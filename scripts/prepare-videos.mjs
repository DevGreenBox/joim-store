/**
 * Готовит промо-ролики заказчика к вебу.
 *
 * Исходники на Яндекс.Диске — маркетплейсные монтажи по 44–49 МБ:
 * 4K или вертикаль 4:5, с музыкой, голосом и впечатанными подписями.
 * Класть их на сайт как есть нельзя, поэтому здесь они ужимаются
 * до размера, который не жалко отдать браузеру.
 *
 * Что важно в параметрах:
 *
 * — **звук оставляем.** Ролики озвучены, и без звука половина смысла
 *   теряется. Плеер на странице стартует по клику, поэтому автоплей
 *   с музыкой никого не напугает.
 *
 * — **`-movflags +faststart`** переносит индекс в начало файла: без него
 *   браузер ждёт загрузки всего ролика, прежде чем показать первый кадр.
 *
 * — **постер снимается из самого ролика**, а не рисуется отдельно: так
 *   первый кадр плеера гарантированно совпадает с тем, что начнёт играть.
 *
 * Требуется ffmpeg в системе. Запуск: node scripts/prepare-videos.mjs
 */

import { spawnSync } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const VIDEO_OUT = path.join(ROOT, "public/video");
const POSTER_OUT = path.join(ROOT, "public/images/products");
const TMP = path.join(ROOT, "assets/video-raw/joim");

const PUBLIC_KEY = "https://disk.yandex.ru/d/r160coPcbmAvjA";
const API = "https://cloud-api.yandex.net/v1/disk/public/resources";

/**
 * Что берём. `shoot` — начало имени папки товара в `Content`,
 * `file` — точное имя ролика, `poster` — секунда, с которой снимаем кадр.
 */
const WANTED = [
  {
    out: "es19-promo",
    shoot: "ES-19",
    folder: "Видео",
    file: "JOIM Es-19 lite.mp4",
    width: 1280,
    poster: 2,
  },
  {
    out: "es29-promo",
    shoot: "ES-29",
    folder: "Видео",
    file: "ES29.mp4",
    width: 720,
    poster: 4,
  },
  {
    out: "pvc1-promo",
    shoot: "PVC-1",
    folder: "Black/Видео",
    file: "Пылесос.mp4",
    width: 720,
    poster: 6,
  },
];

async function list(diskPath) {
  const url = `${API}?public_key=${encodeURIComponent(PUBLIC_KEY)}${
    diskPath ? `&path=${encodeURIComponent(diskPath)}` : ""
  }&limit=300`;
  const json = await (await fetch(url)).json();
  return json._embedded?.items ?? [];
}

async function download(item, target) {
  const url = `${API}/download?public_key=${encodeURIComponent(
    PUBLIC_KEY,
  )}&path=${encodeURIComponent(item.path)}`;
  const { href } = await (await fetch(url)).json();
  const buffer = Buffer.from(await (await fetch(href)).arrayBuffer());
  await writeFile(target, buffer);
  return buffer.length;
}

function run(args) {
  const result = spawnSync("ffmpeg", args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`ffmpeg: ${args.join(" ")}`);
}

await mkdir(VIDEO_OUT, { recursive: true });
await mkdir(TMP, { recursive: true });

const root = await list("");
const joim = await list(root.find((i) => i.name === "JOIM").path);
const content = await list(joim.find((i) => i.name === "Content").path);

for (const want of WANTED) {
  const dir = content.find((i) => i.name.startsWith(want.shoot));
  let items = await list(dir.path);

  for (const step of want.folder.split("/")) {
    items = await list(items.find((i) => i.name.trim() === step).path);
  }

  const source = items.find((i) => i.name.trim() === want.file);
  if (!source) {
    console.log(`пропуск: ${want.shoot}/${want.file} не найден`);
    continue;
  }

  const raw = path.join(TMP, `${want.out}-original.mp4`);
  const bytes = await download(source, raw);

  const target = path.join(VIDEO_OUT, `${want.out}.mp4`);
  run([
    "-y",
    "-i",
    raw,
    "-vf",
    `scale=${want.width}:-2:flags=lanczos`,
    "-c:v",
    "libx264",
    "-crf",
    "30",
    "-preset",
    "slow",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "96k",
    "-movflags",
    "+faststart",
    "-loglevel",
    "error",
    target,
  ]);

  const poster = path.join(POSTER_OUT, `${want.out}-poster.webp`);
  run([
    "-y",
    "-ss",
    String(want.poster),
    "-i",
    target,
    "-frames:v",
    "1",
    "-c:v",
    "libwebp",
    "-quality",
    "80",
    "-loglevel",
    "error",
    poster,
  ]);

  const after = await stat(target);
  console.log(
    `${want.out}.mp4  ${(bytes / 1024 / 1024).toFixed(0)} МБ → ${(
      after.size /
      1024 /
      1024
    ).toFixed(1)} МБ`,
  );
}

console.log("\nОригиналы — в assets/video-raw/joim/, наружу не отдаются.");

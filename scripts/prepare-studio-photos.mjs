/**
 * Готовит студийные снимки заказчика к тёмной теме.
 *
 * Съёмка сделана на белом циклораме: если положить кадр как есть,
 * в тёмной сетке получится светлый прямоугольник. Поэтому фон снимаем
 * в прозрачность — предметы на снимках чёрные, разница с фоном большая,
 * порога по минимальному каналу хватает.
 *
 * Прозрачность нарастает от LO к HI, а не переключается на пороге:
 * мягкая тень под предметом уходит вместе с фоном, без белой каймы
 * по контуру. На светлых деталях (прозрачный контейнер пылесоса)
 * проверялось отдельно — они темнее HI и остаются.
 *
 * Мастера кладём в `assets/images-raw/joim/`, дальше их подхватывает
 * `prepare-product-images.mjs` и делает webp для `public/`.
 *
 * Со съёмки ES-19 берём ещё и репортаж: подкапотное пространство, багажник,
 * салон, руки. Там фон не белый, а сам сюжет, вырезать нечего — такие кадры
 * идут мимо выреза, отдельным списком (`cut: false`) и в свою папку
 * `assets/images-raw/joim-life/`. В плитку товара они не годятся, зато
 * работают подложками и сценариями.
 *
 * Запуск: node scripts/prepare-studio-photos.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "assets/images-raw/joim");
const OUT_LIFE = path.join(ROOT, "assets/images-raw/joim-life");

const PUBLIC_KEY = "https://disk.yandex.ru/d/r160coPcbmAvjA";
const API = "https://cloud-api.yandex.net/v1/disk/public/resources";

/** Длинная сторона мастера, px. */
const MASTER = 2400;
/** Ниже LO — предмет, выше HI — фон, между ними полупрозрачный край. */
const LO = 222;
const HI = 249;

/** Что берём. Папка задаётся началом имени: на диске оно в разложенной кириллице. */
const WANTED = [
  { shoot: "10.09.25", file: "4Y8A4330.jpg", out: "joim-es29-kit" },
  { shoot: "10.09.25", file: "4Y8A4355.jpg", out: "joim-es29-hands" },
  { shoot: "10.09.25", file: "4Y8A4336.jpg", out: "joim-es29-module" },
  { shoot: "10.09.25", file: "4Y8A4350.jpg", out: "joim-es29-ports" },
  { shoot: "10.02.26", file: "4Y8A2100.JPG", out: "joim-pvc1-body" },
  { shoot: "10.02.26", file: "4Y8A2050.JPG", out: "joim-pvc1-hose" },
  { shoot: "10.02.26", file: "4Y8A2110в.jpg", out: "joim-pvc1-panel" },
  { shoot: "10.02.26", file: "4Y8A2117.JPG", out: "joim-pvc1-filter" },
  { shoot: "10.02.26", file: "4Y8A1941.JPG", out: "joim-pvc1-kit" },

  // Пылесос целиком: комплект, кейс, насадки по отдельности и в сборе.
  // Из 62 кадров папки взяты те, где предмет один и читается с первого
  // взгляда; остальные — те же предметы в соседних ракурсах.
  { shoot: "10.02.26", file: "4Y8A2174.JPG", out: "joim-pvc1-kit-flat" },
  { shoot: "10.02.26", file: "4Y8A1904.JPG", out: "joim-pvc1-case" },
  { shoot: "10.02.26", file: "4Y8A1948.JPG", out: "joim-pvc1-case-open" },
  { shoot: "10.02.26", file: "4Y8A2175.JPG", out: "joim-pvc1-cyclone" },
  { shoot: "10.02.26", file: "4Y8A2179.JPG", out: "joim-pvc1-brush" },
  { shoot: "10.02.26", file: "4Y8A2180.JPG", out: "joim-pvc1-crevice" },
  { shoot: "10.02.26", file: "4Y8A3968.JPG", out: "joim-pvc1-turbo" },
  { shoot: "10.02.26", file: "4Y8A2052.JPG", out: "joim-pvc1-hose-set" },
  { shoot: "10.02.26", file: "4Y8A2182.JPG", out: "joim-pvc1-with-crevice" },
  { shoot: "10.02.26", file: "4Y8A4208.JPG", out: "joim-pvc1-with-turbo" },

  // Репортаж ES-19 — папка `18.12.24 (JOIM ES-19, ES-9)/Es-19`, 125 кадров.
  { shoot: "18.12.24", dir: "Es-19", cut: false, file: "DSC09013.jpg", out: "es19-battery" },
  { shoot: "18.12.24", dir: "Es-19", cut: false, file: "DSC09027.jpg", out: "es19-bay" },
  { shoot: "18.12.24", dir: "Es-19", cut: false, file: "DSC09031.jpg", out: "es19-closeup" },
  { shoot: "18.12.24", dir: "Es-19", cut: false, file: "DSC09271.jpg", out: "es19-trunk" },
  { shoot: "18.12.24", dir: "Es-19", cut: false, file: "DSC09314.jpg", out: "es19-powerbank" },
  { shoot: "18.12.24", dir: "Es-19", cut: false, file: "DSC09402.jpg", out: "es19-case" },
  { shoot: "18.12.24", dir: "Es-19", cut: false, file: "DSC09416.jpg", out: "es19-ports" },
  { shoot: "18.12.24", dir: "Es-19", cut: false, file: "DSC09490.jpg", out: "es19-clamp" },
  { shoot: "18.12.24", dir: "Es-19", cut: false, file: "DSC09516.jpg", out: "es19-wide" },
  { shoot: "18.12.24", dir: "Es-19", cut: false, file: "DSC09528.jpg", out: "es19-driver" },
];

async function list(diskPath) {
  const url = `${API}?public_key=${encodeURIComponent(PUBLIC_KEY)}${
    diskPath ? `&path=${encodeURIComponent(diskPath)}` : ""
  }&limit=300`;
  const json = await (await fetch(url)).json();
  return json._embedded?.items ?? [];
}

/**
 * Три попытки: диск отдаёт ссылку на случайный узел хранилища, и попадаются
 * узлы с просроченным сертификатом. За новой ссылкой идём каждый раз заново —
 * повторять запрос к тому же узлу бессмысленно.
 */
async function download(item, attempt = 1) {
  const url = `${API}/download?public_key=${encodeURIComponent(
    PUBLIC_KEY,
  )}&path=${encodeURIComponent(item.path)}`;
  try {
    const { href } = await (await fetch(url)).json();
    return Buffer.from(await (await fetch(href)).arrayBuffer());
  } catch (error) {
    if (attempt >= 3) throw error;
    console.log(`  повтор ${attempt}: ${item.name} — ${error.cause?.code ?? error.message}`);
    return download(item, attempt + 1);
  }
}

/** Белый фон → прозрачность. Возвращает PNG с альфой. */
async function cutout(buffer) {
  const { data, info } = await sharp(buffer)
    .resize(MASTER, MASTER, { fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const rgba = Buffer.alloc(width * height * 4);

  for (let i = 0, j = 0; i < data.length; i += channels, j += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // По минимальному каналу: цветные детали (красная клемма, зелёная
    // молния) остаются непрозрачными даже там, где они яркие.
    const level = Math.min(r, g, b);

    rgba[j] = r;
    rgba[j + 1] = g;
    rgba[j + 2] = b;
    rgba[j + 3] =
      level >= HI ? 0 : level > LO ? Math.round((255 * (HI - level)) / (HI - LO)) : 255;
  }

  return sharp(rgba, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const root = await list("");
const joim = await list(root.find((i) => i.name === "JOIM").path);
const shoots = await list(
  joim.find((i) => i.name.startsWith("Фотосессия")).path,
);

await mkdir(OUT_LIFE, { recursive: true });

// Листинги папок кэшируем: в списке по десятку кадров из одной и той же,
// а каждый запрос к диску — секунда.
const cache = new Map();

for (const want of WANTED) {
  const dir = want.dir ?? "ФОТОШОП";
  const key = `${want.shoot}/${dir}`;

  if (!cache.has(key)) {
    const shoot = shoots.find((i) => i.name.startsWith(want.shoot));
    const inside = await list(shoot.path);
    cache.set(key, await list(inside.find((i) => i.name === dir).path));
  }

  const item = cache.get(key).find((i) => i.name === want.file);

  if (!item) {
    console.log(`пропуск: ${key}/${want.file} не найден`);
    continue;
  }

  const source = await download(item);
  const cut = want.cut !== false;

  const master = cut
    ? await cutout(source)
    : await sharp(source)
        .resize(MASTER, MASTER, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 86 })
        .toBuffer();

  const name = `${want.out}.${cut ? "png" : "webp"}`;
  await writeFile(path.join(cut ? OUT : OUT_LIFE, name), master);

  console.log(
    `${name}  ${(source.length / 1024 / 1024).toFixed(1)} МБ → ${(
      master.length / 1024
    ).toFixed(0)} КБ`,
  );
}

console.log("\nДальше: node scripts/prepare-product-images.mjs");

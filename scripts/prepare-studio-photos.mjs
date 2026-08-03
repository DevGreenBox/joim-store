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
 * Запуск: node scripts/prepare-studio-photos.mjs
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "assets/images-raw/joim");

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
];

async function list(diskPath) {
  const url = `${API}?public_key=${encodeURIComponent(PUBLIC_KEY)}${
    diskPath ? `&path=${encodeURIComponent(diskPath)}` : ""
  }&limit=300`;
  const json = await (await fetch(url)).json();
  return json._embedded?.items ?? [];
}

async function download(item) {
  const url = `${API}/download?public_key=${encodeURIComponent(
    PUBLIC_KEY,
  )}&path=${encodeURIComponent(item.path)}`;
  const { href } = await (await fetch(url)).json();
  return Buffer.from(await (await fetch(href)).arrayBuffer());
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

for (const want of WANTED) {
  const shoot = shoots.find((i) => i.name.startsWith(want.shoot));
  const inside = await list(shoot.path);
  const retouched = await list(
    inside.find((i) => i.name === "ФОТОШОП").path,
  );
  const item = retouched.find((i) => i.name === want.file);

  if (!item) {
    console.log(`пропуск: ${want.shoot}/${want.file} не найден`);
    continue;
  }

  const source = await download(item);
  const png = await cutout(source);
  const target = path.join(OUT, `${want.out}.png`);
  await writeFile(target, png);

  console.log(
    `${want.out}.png  ${(source.length / 1024 / 1024).toFixed(1)} МБ → ${(
      png.length / 1024
    ).toFixed(0)} КБ`,
  );
}

console.log("\nДальше: node scripts/prepare-product-images.mjs");

/**
 * Готовит фото товаров к показу: берёт оригиналы из `assets/images-raw/`,
 * ужимает по длинной стороне до 1200 px и кладёт webp
 * в `public/images/products/`.
 *
 * Пропорции не трогаем: если дорисовать прозрачные поля до квадрата,
 * вытянутый товар в плитке каталога окажется вдвое мельче остальных.
 *
 * По пути снимается светлый кант вдоль контура (`defringe.mjs`): товары
 * снимали на белом, и после обтравки вдоль проводов и клемм оставалась
 * светлая обводка. На белой подложке её не видно, на графите — видно всем.
 *
 * Оригиналы наружу не отдаются (см. docs/content-guide.md), в репозитории
 * лежит и то и другое: исходник — чтобы можно было пересобрать, webp —
 * чтобы отдавать браузеру.
 *
 * Запуск: node scripts/prepare-product-images.mjs
 */

import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { defringeFile } from "./defringe.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets/images-raw");
const OUT = path.join(ROOT, "public/images/products");

const SIZE = 1200;
const QUALITY = 82;

/**
 * Кадры, которые заказчик просил вставлять как есть: без чистки канта
 * и без обрезки прозрачных полей, только перевод в webp. Качество выше
 * общего — файл отдаётся таким, каким его прислали.
 *
 * Список нужен, чтобы правка пережила пересборку: без него следующий
 * прогон снова прогнал бы кадр через defringe и trim.
 */
const AS_IS = new Map([["joim-es29-kit", 92]]);

async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(full)));
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

const sources = await collect(SRC);
await mkdir(OUT, { recursive: true });

for (const source of sources) {
  const name = path.basename(source).replace(/\.[^.]+$/, "");
  const target = path.join(OUT, `${name}.webp`);

  if (AS_IS.has(name)) {
    await sharp(source)
      .resize(SIZE, SIZE, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: AS_IS.get(name), effort: 6 })
      .toFile(target);
  } else {
    // Светлый кант по контуру снимаем до уменьшения: на оригинале граница
    // альфы точная, после resize она размазана и опору внутри не найти.
    const { buffer } = await defringeFile(source);

    await sharp(buffer ?? source)
      .resize(SIZE, SIZE, { fit: "inside", withoutEnlargement: true })
      .trim({ threshold: 0 })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(target);
  }

  const before = (await stat(source)).size;
  const after = (await stat(target)).size;
  console.log(
    `${name}.webp  ${(before / 1024) | 0} КБ → ${(after / 1024) | 0} КБ`,
  );
}

console.log(`\nГотово: ${sources.length} шт. в public/images/products/`);

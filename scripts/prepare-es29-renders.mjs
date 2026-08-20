/**
 * Готовит заводские 3D-рендеры ES-29 к показу на лендинге.
 *
 * Исходники — из библиотеки заказчика на Яндекс.Диске, папка
 * «Content/ES-29 (пусковое устройство)/3D Модель». Это 4K PNG
 * с прозрачностью по 7–48 МБ: отдавать их браузером нельзя,
 * но и пересобирать по кадру руками не нужно.
 *
 * Что делает: срезает пустые поля по альфе, ужимает по длинной стороне
 * и кладёт webp в `public/images/products/`. Прозрачность сохраняется —
 * на лендинге прибор стоит в воздухе, а не в рамке.
 *
 * Исходники в репозитории не лежат: 151 МБ на модель — репозиторий вырос
 * бы вдвое. Скачиваются из папки заказчика в `assets/renders/es29/`
 * (папка в .gitignore), результат в `public/` — лежит.
 *
 * Запуск: node scripts/prepare-es29-renders.mjs
 */

import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const SRC = "assets/renders/es29";
const OUT = "public/images/products";

/** Ширина под место показа: макро идут крупнее, ортогональный вид уже. */
const SHOTS = [
  { file: "Лицевая под 90.png", out: "es29-front-90", width: 1100 },
  { file: "Разрез под углом три грани.png", out: "es29-cut", width: 1800 },
  { file: "Макро фонарь.png", out: "es29-lamp-macro", width: 1800 },
  { file: "Макро порты с проводами.png", out: "es29-ports-macro", width: 1800 },
  { file: "Макро_диоды.png", out: "es29-diodes-macro", width: 1600 },
  { file: "Разлет.png", out: "es29-explode", width: 1800 },
  { file: "8_Фонарь_90_включен.png", out: "es29-lamp-on", width: 1400 },
];

await mkdir(OUT, { recursive: true });

for (const shot of SHOTS) {
  const from = path.join(SRC, shot.file);
  const to = path.join(OUT, `${shot.out}.webp`);

  const info = await sharp(from)
    // Порог по альфе, а не по цвету: кадр вырезан по контуру, и обрезать
    // надо именно прозрачные поля, а иногда они занимают половину кадра.
    .trim({ threshold: 1 })
    .resize(shot.width, null, { withoutEnlargement: true, kernel: "lanczos3" })
    .webp({ quality: 88, effort: 6, smartSubsample: true })
    .toFile(to);

  const before = (await stat(from)).size;
  console.log(
    `${shot.out}.webp  ${info.width}×${info.height}  ` +
      `${(before / 1024 / 1024).toFixed(1)} МБ → ${Math.round(info.size / 1024)} КБ`,
  );
}

/**
 * Готовит текстуры для граней корпуса из заводских видов «под 90».
 *
 * Лицевая и задняя грани получают сами виды. Боковым граням и торцам
 * вид не годится: они узкие, и натянутая на них лицевая картинка
 * размазывается полосами, а в углублении кнопки проступает её призрак.
 *
 * Поэтому для них считается профиль края: для каждой строки берётся
 * цвет чуть внутри силуэта слева и справа, для каждого столбца — сверху
 * и снизу. Медиана по нескольким пикселям, прозрачные не в счёт. Получаются
 * ровные полосы, на которых зелёный кант продолжается без швов и без ряби.
 *
 * Запуск: node scripts/prepare-model-skins.mjs
 */

import sharp from "sharp";

const SRC = "assets/models/es19-front.png";
const W = 512;
const H = 1024;
/** На сколько пикселей уходим внутрь от силуэта. */
const INSET = 6;
/** Сколько пикселей усредняем. */
const TAKE = 5;

const { data, info } = await sharp(SRC)
  .trim({ threshold: 12 })
  .resize(W, H, { fit: "fill" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const at = (x, y) => {
  const i = (y * info.width + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};

/** Медиана по яркости среди непрозрачных проб. */
const median = (samples) => {
  const solid = samples.filter((p) => p[3] > 160);
  if (solid.length === 0) return [20, 22, 21];
  solid.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  return solid[solid.length >> 1];
};

/** Идём от края внутрь, пока не найдём непрозрачный пиксель. */
const inward = (y, from, step) => {
  for (let x = from; x >= 0 && x < info.width; x += step) {
    if (at(x, y)[3] > 160) {
      const probe = [];
      for (let k = 0; k < TAKE; k++) probe.push(at(x + step * (INSET + k), y));
      return median(probe);
    }
  }
  return [20, 22, 21];
};

const inwardV = (x, from, step) => {
  for (let y = from; y >= 0 && y < info.height; y += step) {
    if (at(x, y)[3] > 160) {
      const probe = [];
      for (let k = 0; k < TAKE; k++) probe.push(at(x, y + step * (INSET + k)));
      return median(probe);
    }
  }
  return [20, 22, 21];
};

// Боковые: столбец слева и столбец справа, по высоте
const side = Buffer.alloc(2 * H * 3);
for (let y = 0; y < H; y++) {
  const l = inward(y, 0, 1);
  const r = inward(y, info.width - 1, -1);
  for (let c = 0; c < 3; c++) {
    side[(y * 2 + 0) * 3 + c] = l[c];
    side[(y * 2 + 1) * 3 + c] = r[c];
  }
}

// Торцы: строка сверху и строка снизу, по ширине
const end = Buffer.alloc(W * 2 * 3);
for (let x = 0; x < W; x++) {
  const t = inwardV(x, 0, 1);
  const b = inwardV(x, info.height - 1, -1);
  for (let c = 0; c < 3; c++) {
    end[(0 * W + x) * 3 + c] = t[c];
    end[(1 * W + x) * 3 + c] = b[c];
  }
}

const a = await sharp(side, { raw: { width: 2, height: H, channels: 3 } })
  .webp({ quality: 96, effort: 6 })
  .toFile("public/models/es19-side.webp");
const b = await sharp(end, { raw: { width: W, height: 2, channels: 3 } })
  .webp({ quality: 96, effort: 6 })
  .toFile("public/models/es19-end.webp");

console.log(`боковые: ${a.width}×${a.height}, ${Math.round(a.size / 1024)} КБ`);
console.log(`торцы:   ${b.width}×${b.height}, ${Math.round(b.size / 1024)} КБ`);

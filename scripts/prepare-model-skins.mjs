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

/**
 * Торцы: разъёмы сверху и фонарь снизу.
 *
 * Заводских видов «под 90» для торцов в библиотеке нет, а в STL торец —
 * гладкая площадка с гравировкой в полмиллиметра: ни гнёзд, ни линзы
 * в геометрии нет. Поэтому обе площадки рисуются — по заводским рендерам
 * узла, в масштабе самой модели: панель 6,8 px на миллиметр, USB-A
 * 12×4,5 мм, USB-C 8,3×2,6 мм, гнёзда пуска Ø12 мм.
 *
 * Порядок вдоль оси задан гравировкой на самой модели: «INPUT / OUTPUT /
 * BOOST» идёт от +X к −X, то есть гнёзда пуска — у левого края текстуры.
 *
 * Зелёный взят с заводского вида — тот же, что на накладках корпуса.
 */

/** Ширина и глубина торца в пикселях: пропорции грани 0,35 × 0,16. */
const EW = 640;
const EH = 292;
const GREEN = "#8ccc22";
const BODY = "#17191a";

const svgTop = `<svg xmlns="http://www.w3.org/2000/svg" width="${EW}" height="${EH}">
  <rect width="${EW}" height="${EH}" fill="${GREEN}"/>
  <rect x="83" y="41" width="474" height="210" rx="14" fill="${BODY}"/>
  <rect x="91" y="49" width="458" height="194" rx="10" fill="#1b1e20"/>

  <!-- BOOST: два гнезда пуска, круглое и с ключом -->
  <circle cx="138" cy="146" r="41" fill="#3a3cc0"/>
  <circle cx="138" cy="146" r="30" fill="#0a0b0c"/>
  <circle cx="138" cy="146" r="17" fill="#c08b2e"/>
  <circle cx="138" cy="146" r="7" fill="#0a0b0c"/>
  <path d="M189 146a41 41 0 0 1 41-41h30a11 11 0 0 1 11 11v60a11 11 0 0 1-11 11h-30a41 41 0 0 1-41-41z" fill="#3a3cc0"/>
  <circle cx="230" cy="146" r="30" fill="#0a0b0c"/>
  <circle cx="230" cy="146" r="17" fill="#c08b2e"/>
  <circle cx="230" cy="146" r="7" fill="#0a0b0c"/>

  <!-- OUTPUT: два USB-A друг над другом -->
  <rect x="310" y="104" width="82" height="31" rx="3" fill="#040506"/>
  <rect x="316" y="116" width="70" height="13" rx="2" fill="#41464a"/>
  <rect x="310" y="157" width="82" height="31" rx="3" fill="#040506"/>
  <rect x="316" y="169" width="70" height="13" rx="2" fill="#41464a"/>

  <!-- INPUT: USB-C -->
  <rect x="450" y="137" width="56" height="18" rx="9" fill="#040506"/>
  <rect x="457" y="142" width="42" height="8" rx="4" fill="#41464a"/>
</svg>`;

const svgBottom = `<svg xmlns="http://www.w3.org/2000/svg" width="${EW}" height="${EH}">
  <rect width="${EW}" height="${EH}" fill="${GREEN}"/>
  <rect x="90" y="70" width="460" height="152" rx="18" fill="#5f8c19"/>
  <rect x="102" y="82" width="436" height="128" rx="12" fill="#ffffff"/>
</svg>`;

for (const [name, svg] of [["top", svgTop], ["bottom", svgBottom]]) {
  const r = await sharp(Buffer.from(svg))
    .webp({ quality: 92, effort: 6 })
    .toFile(`public/models/es19-${name}.webp`);
  console.log(`${name}:     ${r.width}×${r.height}, ${Math.round(r.size / 1024)} КБ`);
}

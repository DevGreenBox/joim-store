/**
 * Готовит фон первого экрана из съёмки в подкапотном пространстве.
 *
 * Три вещи, которые делает этот скрипт и которых не сделать в вёрстке:
 *
 * 1. Кадрирует так, чтобы `object-fit: cover` считал снимок ПО ВЫСОТЕ.
 *    Высота первого экрана постоянная (925 px на любой ширине), поэтому
 *    прибор перестаёт расти вместе с окном и всегда стоит в просвете
 *    между заголовком и карточками показаний. Для этого к снимку
 *    добавлены поля цветом страницы слева и справа: они уводят пропорцию
 *    к 2,3 и заодно сдвигают прибор от середины кадра вправо.
 *
 * 2. Поднимает яркость в пятне вокруг прибора — в самих пикселях.
 *    Раньше это делал белый слой `mix-blend-screen` поверх кадра, но он
 *    не осветлял, а подмешивал белое: снимок в этом месте выцветал
 *    и выглядел затуманенным. Здесь осветляется сама фотография, а маска
 *    только решает, где именно.
 *
 * 3. Гасит всё остальное: за пределами пятна кадр уходит вниз по яркости.
 *    Разница между прибором и окружением набирается с двух сторон.
 *
 * Запуск: node scripts/prepare-hero.mjs
 */

import sharp from "sharp";

const SRC = "assets/images-raw/joim/hero-engine-original.jpg";
const OUT = "public/images/hero/engine.webp";

/** Кадр из оригинала 1680×1122. Левый край берём целиком: он уходит под текст. */
const CROP = { left: 0, top: 102, width: 1680, height: 1012 };

/** Итоговый размер и поля цветом страницы по бокам. */
const OUT_W = 2400;
const OUT_H = 1043;
const PAD_LEFT = 595;
const PAD_RIGHT = 73;
const VOID = "#111313";

/**
 * Прибор в итоговом кадре: центр и полуоси пятна, в долях от размера.
 * Считаются от положения корпуса в оригинале (центр 798×583, ширина 418).
 */
const SPOT = { x: 0.591, y: 0.475, rx: 0.145, ry: 0.33 };

/** Насколько поднимаем яркость в пятне и насколько гасим за его пределами. */
const LIT = 1.42;
const DIM = 0.8;

/**
 * Маска пятна: белое в центре, прозрачное по краю. Плато до 40% радиуса —
 * иначе прибор осветляется только по центру и корпус выглядит выпуклым.
 */
function spotMask() {
  const svg = `<svg width="${OUT_W}" height="${OUT_H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="s" cx="${SPOT.x}" cy="${SPOT.y}" r="0.5"
        gradientTransform="translate(${SPOT.x} ${SPOT.y}) scale(${SPOT.rx * 2} ${SPOT.ry * 2}) translate(${-SPOT.x} ${-SPOT.y})">
        <stop offset="0" stop-color="#fff"/>
        <stop offset="0.4" stop-color="#fff"/>
        <stop offset="1" stop-color="#000"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="#000"/>
    <rect width="100%" height="100%" fill="url(#s)"/>
  </svg>`;
  return sharp(Buffer.from(svg)).greyscale().toColourspace("b-w").toBuffer();
}

async function main() {
  // Общая обработка: цвет и контраст съёмки, одинаковые для обоих слоёв.
  const base = await sharp(SRC)
    .extract(CROP)
    .resize(OUT_W - PAD_LEFT - PAD_RIGHT, OUT_H, { kernel: "lanczos3" })
    .extend({ left: PAD_LEFT, right: PAD_RIGHT, background: VOID })
    .modulate({ saturation: 1.28 })
    .linear(1.1, -6)
    .sharpen({ sigma: 0.9 })
    .toColourspace("srgb")
    .removeAlpha()
    .toBuffer();

  const mask = await spotMask();

  // Тёмный слой — вся площадь. Светлый — только в пятне, через альфу.
  const dim = await sharp(base).modulate({ brightness: DIM }).toBuffer();
  const lit = await sharp(base)
    .modulate({ brightness: LIT })
    .ensureAlpha()
    .joinChannel(mask)
    .toBuffer();

  const info = await sharp(dim)
    .composite([{ input: lit, blend: "over" }])
    .webp({ quality: 74 })
    .toFile(OUT);

  console.log(`${OUT}: ${info.width}×${info.height}, ${Math.round(info.size / 1024)} КБ`);
}

main();

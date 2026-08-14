/**
 * Готовит фоны из съёмки в подкапотном пространстве: два кадра первого
 * экрана и подложку анкеты.
 *
 * Что этот скрипт делает и чего не сделать в вёрстке:
 *
 * 1. Кадрирует так, чтобы `object-fit: cover` считал снимок ПО ВЫСОТЕ.
 *    Высота первого экрана постоянная (925 px на любой ширине), поэтому
 *    прибор перестаёт расти вместе с окном и всегда стоит в просвете
 *    между заголовком и карточками показаний. Для этого к снимку
 *    добавлены поля цветом страницы слева и справа: они уводят пропорцию
 *    за 2,2 и заодно сдвигают прибор от середины кадра вправо.
 *
 * 2. Кладёт виньетку — ровное затемнение к краям кадра.
 *
 *    Раньше здесь было пятно яркости над прибором: сам он шёл вверх,
 *    окружение вниз. На светлом фоне второго кадра граница пятна стала
 *    видна овалом — то самое «свечение», которое заказчик просил убрать.
 *    Виньетка центральная и без светлого ядра: прибор ничем не подсвечен,
 *    к краям кадр просто уходит в тень, как в съёмке.
 *
 * Оба кадра первого экрана посажены так, чтобы прибор вставал на одно
 * и то же место: `середина экрана + 193 px`. При перелистывании сюжет
 * меняется, а композиция стоит.
 *
 * Подложка анкеты считается проще: там нет предмета, за которым надо
 * следить, — только общий уровень яркости под текстом и полями.
 *
 * Запуск: node scripts/prepare-hero.mjs
 */

import sharp from "sharp";

const VOID = "#111313";

/** Высота итогового кадра. Ширина набирается кадром и полями. */
const OUT_H = 1043;

/**
 * Кадры первого экрана.
 *
 * `crop` — окно в исходнике. `pad` — поля цветом страницы слева и справа;
 * их разница двигает прибор вправо от середины кадра, сумма задаёт
 * пропорцию. `spot` — центр и полуоси пятна яркости в долях итогового
 * кадра, совпадает с прибором.
 *
 * Числа считаны от положения корпуса в каждом исходнике и проверены
 * замером на 1280, 1440 и 1912.
 */
const HERO = [
  {
    src: "assets/scenes/hero-1-source.jpg",
    out: "public/images/hero/engine.webp",
    crop: { left: 0, top: 102, width: 1680, height: 1012 },
    pad: { left: 595, right: 73 },
  },
  {
    // Прибор здесь стоит вертикально и почти по середине кадра, поэтому
    // поле справа нужно широкое — иначе не набрать пропорцию. Плоским
    // его делать нельзя: на широком экране оно выходит из-под завесы
    // и читается полосой. Поэтому справа зеркало края кадра: в тёмном
    // размытии шва не видно.
    //
    // Окно уже полного кадра: заказчик просил прибор крупнее. Исходник
    // взят с диска в полном разрешении (3000 px против 1280 у присланного
    // файла), поэтому подрезка не съедает качество.
    src: "assets/scenes/hero-2-source.jpg",
    out: "public/images/hero/engine-2.webp",
    crop: { left: 0, top: 191, width: 3000, height: 1517 },
    pad: { left: 200, right: 136 },
    mirrorRight: true,
  },
];

/** Подложка анкеты: кадр целиком, только приглушённый. */
const LEAD = {
  src: "assets/scenes/lead-source.jpg",
  out: "public/images/hero/lead.webp",
  width: 1800,
};

/** Насколько кадр уходит в тень по углам. */
const VIGNETTE = 0.42;

/**
 * Виньетка: прозрачная середина, чёрные углы. Плато до половины радиуса —
 * затемнение начинается там, где уже нет ни прибора, ни текста, и растёт
 * плавно, чтобы границы не было видно.
 */
function vignette(width, height) {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="v" cx="0.5" cy="0.5" r="0.72">
        <stop offset="0" stop-color="#000" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity="${VIGNETTE}"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#v)"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function hero(slide) {
  const photoW = Math.round((slide.crop.width * OUT_H) / slide.crop.height);
  const outW = photoW + slide.pad.left + slide.pad.right;

  const photo = await sharp(slide.src)
    .extract(slide.crop)
    .resize(photoW, OUT_H, { kernel: "lanczos3" })
    // Промежуточный формат задаём явно: без него sharp отдаёт буфер
    // в формате исходника, и следующий шаг его не читает.
    .png()
    .toBuffer();

  // Поля: слева цвет страницы (он под завесой на 96%), справа — либо тот же
  // цвет, либо зеркало края кадра, если поле широкое и вылезает наружу.
  const layers = [{ input: photo, left: slide.pad.left, top: 0 }];

  if (slide.mirrorRight && slide.pad.right > 0) {
    layers.push({
      input: await sharp(photo)
        .extract({ left: photoW - slide.pad.right, top: 0, width: slide.pad.right, height: OUT_H })
        .flop()
        .toBuffer(),
      left: slide.pad.left + photoW,
      top: 0,
    });
  }

  // Общая обработка: цвет и контраст съёмки, одинаковые для обоих слоёв.
  const base = await sharp({
    create: { width: outW, height: OUT_H, channels: 3, background: VOID },
  })
    .composite(layers)
    .modulate({ saturation: 1.28 })
    .linear(1.1, -6)
    .sharpen({ sigma: 0.9 })
    .toColourspace("srgb")
    .removeAlpha()
    .png()
    .toBuffer();

  const info = await sharp(base)
    .composite([{ input: await vignette(outW, OUT_H), blend: "over" }])
    .webp({ quality: 78 })
    .toFile(slide.out);

  console.log(
    `${slide.out}: ${info.width}×${info.height}, пропорция ${(info.width / info.height).toFixed(3)}, ${Math.round(info.size / 1024)} КБ`,
  );
}

async function lead() {
  // Контраст поднят, а общая яркость опущена: под завесой плоский кадр
  // превращался в серую кашу, в которой предмет не читался. Теперь тени
  // глубже, блики на корпусе живые, а средний уровень остался низким —
  // текст поверх ничего не теряет.
  const info = await sharp(LEAD.src)
    .resize(LEAD.width, null, { kernel: "lanczos3" })
    .modulate({ saturation: 1.2, brightness: 0.86 })
    .linear(1.42, -26)
    .webp({ quality: 80 })
    .toFile(LEAD.out);

  console.log(`${LEAD.out}: ${info.width}×${info.height}, ${Math.round(info.size / 1024)} КБ`);
}

for (const slide of HERO) await hero(slide);
await lead();

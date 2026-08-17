/**
 * Снимает светлый ореол по краю вырезанного объекта.
 *
 * Съёмка велась на белом, маску подрезали с растушёвкой — вдоль контура
 * остался светлый кант. На белой подложке его не видно, на графите он
 * читается как дешёвая обводка вокруг проводов и клемм.
 *
 * Кант всегда светлее того, что лежит глубже внутри объекта. Берём полосу
 * шириной BAND от границы альфы, для каждого пикселя ищем опору глубже
 * внутри и, если пиксель ярче опоры больше чем на THRESHOLD, тянем его
 * к ней. Настоящие блики переживают правку: у них опора внутри тоже
 * светлая (металл контакта, шильдик), и разница не набирается.
 *
 * Запуск без аргументов — отчёт по всем исходникам, ничего не меняет:
 *   node scripts/defringe.mjs
 */

import sharp from "sharp";

const BAND = 2;
const THRESHOLD = 14;
const REACH = 5;

/** Расстояние до прозрачного фона, обрезанное на limit. */
function distanceMap(data, W, H, limit) {
  const dist = new Int16Array(W * H).fill(-1);
  let frontier = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      if (data[k * 4 + 3] < 128) {
        dist[k] = 0;
        frontier.push(k);
      }
    }
  }
  for (let d = 1; d <= limit && frontier.length; d++) {
    const next = [];
    for (const k of frontier) {
      const x = k % W;
      const y = (k / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const nk = ny * W + nx;
        if (dist[nk] !== -1) continue;
        dist[nk] = d;
        next.push(nk);
      }
    }
    frontier = next;
  }
  return dist;
}

/**
 * @returns {{ data: Buffer, touched: number, rim: number }}
 *   `touched` — сколько пикселей канта поправлено, `rim` — сколько
 *   их всего в полосе. Отношение показывает, есть ли ореол вообще.
 */
export function defringe(data, W, H) {
  const dist = distanceMap(data, W, H, BAND + REACH);
  const lum = (i) => (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;

  const out = Buffer.from(data);
  let touched = 0;
  let rim = 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      const d = dist[k];
      if (d < 1 || d > BAND) continue;
      rim++;
      const i = k * 4;

      // Опора — медиана того, что лежит сразу за кантом. Не минимум:
      // на фактурном корпусе самый тёмный сосед всегда темнее любого
      // края, и фильтр съедал бы настоящие блики вместо ореола.
      const near = [];
      for (let ry = -REACH; ry <= REACH; ry++) {
        for (let rx = -REACH; rx <= REACH; rx++) {
          const nx = x + rx;
          const ny = y + ry;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const nk = ny * W + nx;
          if (dist[nk] <= BAND || dist[nk] > BAND + REACH) continue;
          near.push(nk * 4);
        }
      }
      if (near.length < 4) continue;
      near.sort((a, b) => lum(a) - lum(b));
      const refI = near[near.length >> 1];
      if (lum(i) <= lum(refI) + THRESHOLD) continue;

      touched++;
      // У самой границы тянем полностью, на втором пикселе — мягче.
      const pull = d === 1 ? 1 : 0.6;
      for (let c = 0; c < 3; c++) {
        out[i + c] = Math.round(data[i + c] * (1 - pull) + data[refI + c] * pull);
      }
    }
  }

  return { data: out, touched, rim };
}

/** Читает файл, снимает кант, отдаёт PNG-буфер. Без альфы — отдаёт как есть. */
export async function defringeFile(file) {
  const meta = await sharp(file).metadata();
  if (!meta.hasAlpha) return { buffer: null, share: 0 };

  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const result = defringe(data, info.width, info.height);
  const share = result.rim ? result.touched / result.rim : 0;
  const buffer = await sharp(result.data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
  return { buffer, share, touched: result.touched, rim: result.rim };
}

if (process.argv[1]?.endsWith("defringe.mjs")) {
  const { readdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const SRC = path.join(import.meta.dirname, "..", "assets/images-raw");

  // С аргументами — правка на месте. Нужна для вырезок, которых нет
  // в `assets/images-raw`: карточные пакшоты собраны вручную, и файл
  // в `public/` для них единственный.
  const targets = process.argv.slice(2);
  if (targets.length > 0) {
    for (const file of targets) {
      const { buffer, touched, rim } = await defringeFile(file);
      if (!buffer) {
        console.log(`${path.basename(file)}: без альфы, пропуск`);
        continue;
      }
      const webp = /\.webp$/i.test(file);
      const out = await sharp(buffer)[webp ? "webp" : "png"](
        webp ? { quality: 82, effort: 6 } : {},
      ).toBuffer();
      await writeFile(file, out);
      console.log(
        `${path.basename(file)}: поправлено ${touched} из ${rim} пикселей канта`,
      );
    }
    process.exit(0);
  }


  const walk = async (dir) => {
    const out = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...(await walk(full)));
      else if (/\.(png|webp)$/i.test(entry.name)) out.push(full);
    }
    return out;
  };

  const rows = [];
  for (const file of await walk(SRC)) {
    const { share, touched, rim } = await defringeFile(file);
    if (rim) rows.push([path.basename(file), share, touched]);
  }
  rows.sort((a, b) => b[1] - a[1]);
  for (const [name, share, touched] of rows) {
    console.log(`${(share * 100).toFixed(1).padStart(5)}%  ${String(touched).padStart(6)}  ${name}`);
  }
}

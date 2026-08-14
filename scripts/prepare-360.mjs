/**
 * Готовит 360°-облёт из исходника заказчика к раздаче в вебе.
 *
 *   node scripts/prepare-360.mjs
 *
 * Исходник — `assets/video-raw/joim/es19-360-original.mp4`: 1920×1080,
 * 12,7 МБ, устройство занимает четверть кадра, вокруг чистый чёрный.
 *
 * Что делаем:
 *   1. режем кадр по объединённому bounding box товара за весь клип —
 *      это выкидывает ~70 % пикселей, которые всё равно чёрные;
 *   2. кладём в квадрат 720×720: блок на странице квадратный;
 *   3. раскладываем на 72 отдельных кадра по 5° — их и показывает
 *      `Spin360`. Видео на странице больше нет: перемотка `currentTime`
 *      асинхронная, на потоке событий мыши кадры не успевали и вращение
 *      шло рывками. Картинки рисуются в canvas мгновенно;
 *   4. первый кадр сохраняем постером: он стоит до загрузки набора.
 *
 * 72 кадра в webp весят 475 КБ — меньше, чем весило видео (639 КБ).
 *
 * Требуется ffmpeg в системе.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets/video-raw/joim/es19-360-original.mp4");
const OUT_FRAMES = path.join(ROOT, "public/images/spin/es19");
const OUT_POSTER = path.join(ROOT, "public/images/products/es19-360-poster.webp");

/** Кроп посчитан по объединённому bbox товара за весь клип. */
const CROP = "crop=900:900:478:84";
const SIZE = 720;

mkdirSync(OUT_FRAMES, { recursive: true });
mkdirSync(path.dirname(OUT_POSTER), { recursive: true });

/** Сколько кадров оставляем: 72 — это шаг в 5°, вращение читается гладко. */
const FRAMES = 72;

/** Раскладываем клип в PNG во временную папку. */
const TMP = mkdtempSync(path.join(tmpdir(), "joim-360-"));

execFileSync(
  "ffmpeg",
  [
    "-v", "error", "-y",
    "-i", SRC,
    "-an",
    "-vf", `${CROP},scale=${SIZE}:${SIZE}:flags=lanczos`,
    "-vsync", "0",
    path.join(TMP, "%04d.png"),
  ],
  { stdio: "inherit" },
);

// Последний кадр совпадает с первым — облёт замкнутый. В набор берём
// только различающиеся положения, иначе на стыке вращение спотыкается.
const shots = readdirSync(TMP).filter((f) => f.endsWith(".png")).sort();
const unique = shots.length - 1;

for (let i = 0; i < FRAMES; i += 1) {
  const source = shots[Math.round((i * unique) / FRAMES)];
  await sharp(path.join(TMP, source))
    .webp({ quality: 70, effort: 6 })
    .toFile(path.join(OUT_FRAMES, `${String(i).padStart(2, "0")}.webp`));
}

rmSync(TMP, { recursive: true, force: true });
console.log(`Кадров: ${FRAMES}, шаг ${(360 / FRAMES).toFixed(1)}°`);


const firstFrame = execFileSync(
  "ffmpeg",
  [
    "-v", "error",
    "-i", SRC,
    "-vf", `${CROP},scale=${SIZE}:${SIZE}:flags=lanczos`,
    "-frames:v", "1",
    "-f", "image2pipe",
    "-vcodec", "png",
    "-",
  ],
  { maxBuffer: 64 * 1024 * 1024 },
);

await sharp(firstFrame).webp({ quality: 80, effort: 6 }).toFile(OUT_POSTER);

console.log("готово:", path.relative(ROOT, OUT_VIDEO), "и постер");

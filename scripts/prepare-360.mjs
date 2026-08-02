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
 *   3. кодируем КАЖДЫЙ кадр ключевым (-g 1). Дороже в полтора раза,
 *      но перемотка мышью попадает точно в кадр, а не в ближайший
 *      опорный — ролик крутят перетаскиванием, это важнее размера;
 *   4. первый кадр сохраняем постером: он и стоит до загрузки видео.
 *
 * Требуется ffmpeg в системе.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets/video-raw/joim/es19-360-original.mp4");
const OUT_VIDEO = path.join(ROOT, "public/video/es19-360.mp4");
const OUT_POSTER = path.join(ROOT, "public/images/products/es19-360-poster.webp");

/** Кроп посчитан по объединённому bbox товара за весь клип. */
const CROP = "crop=900:900:478:84";
const SIZE = 720;

mkdirSync(path.dirname(OUT_VIDEO), { recursive: true });
mkdirSync(path.dirname(OUT_POSTER), { recursive: true });

execFileSync(
  "ffmpeg",
  [
    "-v", "error", "-y",
    "-i", SRC,
    "-an",
    "-vf", `${CROP},scale=${SIZE}:${SIZE}:flags=lanczos`,
    "-c:v", "libx264",
    "-profile:v", "high",
    "-pix_fmt", "yuv420p",
    "-crf", "32",
    "-preset", "slow",
    "-g", "1",
    "-movflags", "+faststart",
    OUT_VIDEO,
  ],
  { stdio: "inherit" },
);

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

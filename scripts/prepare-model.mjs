/**
 * Делает из STL заказчика компактную сетку для браузера.
 *
 * Исходник — бинарный STL на 89 911 треугольников, 4,3 МБ: это данные
 * для печати, а не для страницы. Здесь он прореживается кластеризацией
 * по сетке и пакуется в Int16.
 *
 * Кластеризация: пространство модели режется на ячейки, все вершины
 * внутри ячейки схлопываются в одну (среднее). Треугольники, у которых
 * после схлопывания совпали вершины, выбрасываются. Приём грубый, зато
 * предсказуемый и без зависимостей: на корпусе с прямыми гранями он
 * съедает мелкую фаску, но силуэт, кнопку и рёбра держит.
 *
 * Нормали не пишем: объект плоскогранный, и нормаль считается в шейдере
 * от производных экранных координат. Это ровно вдвое меньше данных.
 *
 * Формат `.bin`: 8 байт заголовка (Uint32 число вершин, Float32 масштаб),
 * дальше Int16 x, y, z по вершине. Координаты нормированы в куб [-1, 1]
 * и умножены на 32767.
 *
 * Запуск: node scripts/prepare-model.mjs [размер сетки]
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";

const SRC = "assets/models/es19.stl";
const OUT = "public/models/es19.bin";
const GRID = Number(process.argv[2] ?? 200);

const buf = await readFile(SRC);
const count = buf.readUInt32LE(80);

// Первый проход: габариты
let min = [Infinity, Infinity, Infinity];
let max = [-Infinity, -Infinity, -Infinity];
const vert = (t, v) => {
  const o = 84 + t * 50 + 12 + v * 12;
  return [buf.readFloatLE(o), buf.readFloatLE(o + 4), buf.readFloatLE(o + 8)];
};
for (let t = 0; t < count; t++) {
  for (let v = 0; v < 3; v++) {
    const p = vert(t, v);
    for (let i = 0; i < 3; i++) {
      if (p[i] < min[i]) min[i] = p[i];
      if (p[i] > max[i]) max[i] = p[i];
    }
  }
}
const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
const span = Math.max(...size);
const centre = [
  (min[0] + max[0]) / 2,
  (min[1] + max[1]) / 2,
  (min[2] + max[2]) / 2,
];

// Второй проход: схлопывание по сетке
const cellOf = (p) => {
  const c = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    c[i] = Math.min(GRID - 1, Math.floor(((p[i] - min[i]) / span) * GRID));
  }
  return c[0] + c[1] * GRID + c[2] * GRID * GRID;
};

const sums = new Map();
for (let t = 0; t < count; t++) {
  for (let v = 0; v < 3; v++) {
    const p = vert(t, v);
    const k = cellOf(p);
    const s = sums.get(k);
    if (s) {
      s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3] += 1;
    } else {
      sums.set(k, [p[0], p[1], p[2], 1]);
    }
  }
}
const rep = new Map();
for (const [k, s] of sums) rep.set(k, [s[0] / s[3], s[1] / s[3], s[2] / s[3]]);

// Третий проход: сборка треугольников
const out = [];
let dropped = 0;
for (let t = 0; t < count; t++) {
  const keys = [cellOf(vert(t, 0)), cellOf(vert(t, 1)), cellOf(vert(t, 2))];
  if (keys[0] === keys[1] || keys[1] === keys[2] || keys[0] === keys[2]) {
    dropped++;
    continue;
  }
  for (const k of keys) out.push(rep.get(k));
}

// Упаковка: нормируем в [-1, 1] по длинной стороне и кладём Int16
const data = new Int16Array(out.length * 3);
for (let i = 0; i < out.length; i++) {
  for (let a = 0; a < 3; a++) {
    const n = ((out[i][a] - centre[a]) / span) * 2;
    data[i * 3 + a] = Math.max(-32767, Math.min(32767, Math.round(n * 32767)));
  }
}

const header = Buffer.alloc(8);
header.writeUInt32LE(out.length, 0);
header.writeFloatLE(1 / 32767, 4);

await mkdir("public/models", { recursive: true });
await writeFile(OUT, Buffer.concat([header, Buffer.from(data.buffer)]));

console.log(
  `сетка ${GRID}: было ${count.toLocaleString("ru")} треугольников, стало ${(out.length / 3).toLocaleString("ru")}`,
);
console.log(
  `выброшено вырожденных: ${dropped.toLocaleString("ru")} | файл ${(
    (8 + data.byteLength) / 1024
  ).toFixed(0)} КБ | габариты ${size.map((s) => s.toFixed(0)).join("×")}`,
);

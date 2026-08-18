/**
 * Делает из STL заказчика сетку для браузера.
 *
 * Исходник — бинарный STL на 89 911 треугольников, 4,3 МБ: это данные
 * для печати. Здесь координаты пакуются в Int16, и всё.
 *
 * Прореживания нет. Пробовали кластеризацию по решётке: она схлопывает
 * вершины в ячейку и выбрасывает выродившиеся треугольники — на этой
 * модели даже мелкая решётка 440 теряла 46 % граней. В кадре это читалось
 * рваными клиньями по корпусу и смазанной эмблемой. Точная копия дороже
 * трёхсот килобайт трафика, тем более что блок грузится только при
 * подходе к экрану.
 *
 * Нормали не пишем: корпус мелко триангулирован, и нормаль считается
 * в шейдере от производных экранных координат. Это вдвое меньше данных
 * и ровно тот же результат.
 *
 * Формат `.bin`: 20 байт заголовка (Uint32 число вершин, Float32 масштаб,
 * три Float32 — половины габарита по осям), дальше по вершине три Int16:
 * x, y, z. Координаты нормированы в куб [-1, 1] и умножены на 32767.
 * Половины габарита нужны шейдеру, чтобы положить заводские виды
 * «лицевая» и «задняя» ровно на грани корпуса.
 *
 * Запуск: node scripts/prepare-model.mjs
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";

const SRC = "assets/models/es19.stl";
const OUT = "public/models/es19.bin";

const buf = await readFile(SRC);
const count = buf.readUInt32LE(80);

const vert = (t, v) => {
  const o = 84 + t * 50 + 12 + v * 12;
  return [buf.readFloatLE(o), buf.readFloatLE(o + 4), buf.readFloatLE(o + 8)];
};

// Габариты
let min = [Infinity, Infinity, Infinity];
let max = [-Infinity, -Infinity, -Infinity];
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

// Упаковка: нормируем в [-1, 1] по длинной стороне и кладём Int16
const vertices = count * 3;
const data = new Int16Array(vertices * 3);
for (let t = 0; t < count; t++) {
  for (let v = 0; v < 3; v++) {
    const p = vert(t, v);
    for (let a = 0; a < 3; a++) {
      const n = ((p[a] - centre[a]) / span) * 2;
      data[(t * 3 + v) * 3 + a] = Math.max(-32767, Math.min(32767, Math.round(n * 32767)));
    }
  }
}

const header = Buffer.alloc(20);
header.writeUInt32LE(vertices, 0);
header.writeFloatLE(1 / 32767, 4);
// Половины габарита в тех же единицах, что и вершины после нормировки.
for (let a = 0; a < 3; a++) header.writeFloatLE(size[a] / span, 8 + a * 4);

await mkdir("public/models", { recursive: true });
await writeFile(OUT, Buffer.concat([header, Buffer.from(data.buffer)]));

console.log(
  `треугольников: ${count.toLocaleString("ru")} | файл ${((20 + data.byteLength) / 1024).toFixed(0)} КБ`,
);

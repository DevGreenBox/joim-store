/**
 * Расставляет неразрывные пробелы в текстах сайта.
 *
 * Предлог или союз в конце строки — висячий: глаз доходит до края и не
 * понимает, к чему относится «в», пока не перескочит вниз. Правило простое:
 * короткое слово уезжает на следующую строку вместе с тем, к которому
 * относится. То же с тире (не начинает строку), числами («5 000», «8 л»)
 * и частицами («же», «ли» — они, наоборот, липнут к слову перед собой).
 *
 * Правится сам контент, а не вёрстка: тексты лежат в `content/`, и связка
 * должна пережить пересборку страницы. Скрипт идемпотентный — гоняется
 * сколько угодно раз, второй прогон ничего не меняет.
 *
 * **После правки текстов в `content/` скрипт надо прогнать заново.**
 *
 * Запуск: node scripts/typo.mjs [--check]
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "content");
const NBSP = " ";
/** Неразрывный дефис — для имён моделей вида ES-19. */
const NBHY = "‑";

/** Предлоги в три буквы. Всё, что в одну-две, ловится длиной. */
const LONG = ["для", "без", "над", "под", "при", "про", "изо", "обо", "ото"];

/** Частицы: липнут к слову СЛЕВА, а не справа. */
const AFTER = ["же", "ли", "ль", "бы", "б"];

/**
 * Ключи, значения которых текстом не являются: пути, слаги, идентификаторы.
 * Плюс отдельная проверка по виду значения — на случай новых ключей.
 */
const SKIP_KEYS = new Set([
  "src", "href", "slug", "id", "art", "icon", "image", "video", "poster",
  "alt", "sku", "category", "brand", "key", "file", "cta",
]);

// `name` намеренно не в списке: это отображаемый текст — имена моделей,
// категорий и авторов отзывов. Технические имена лежат в `slug` и `sku`.

const LOOKS_TECHNICAL = /^(\/|https?:|[a-z0-9._-]+$)/i;

const SHORT = new RegExp(`(^|[ ("«${NBSP}])([а-яё]{1,2}|${LONG.join("|")}) +`, "gi");
const PARTICLE = new RegExp(`(\\S) +(${AFTER.join("|")})(?=[ .,;:!?)»—-]|$)`, "gi");

function bind(text) {
  let out = text;

  // Числа первыми: разряды и короткая единица — «5 000», «8 л», «40 мин».
  // Иначе единицу в одну букву следующий шаг примет за предлог и приклеит
  // её не к числу, а к слову справа.
  out = out.replace(/(\d) +(?=\d)/g, `$1${NBSP}`);
  out = out.replace(/(\d) +([а-яё]{1,3}\.?)(?=[ .,;:!?)»]|$)/gi, `$1${NBSP}$2`);

  // Частицы к слову слева: «так же» → «так<NBSP>же».
  out = out.replace(PARTICLE, `$1${NBSP}$2`);

  // Короткие слова к слову справа. Два прохода: подряд идущие предлоги
  // («и в мороз») с одного не связываются — первый съедает разделитель,
  // и второй остаётся висеть.
  const forward = (match, sep, word, at, whole) =>
    // Единица, уже связанная с числом, предлогом не является.
    sep === NBSP && /\d/.test(whole[at - 1] ?? "") ? match : `${sep}${word}${NBSP}`;

  out = out.replace(SHORT, forward).replace(SHORT, forward);

  // Тире не начинает строку — держим его на строке предыдущего слова.
  out = out.replace(/(\S) +—/g, `$1${NBSP}—`);

  // Имена моделей не рвутся по дефису: на 390 px «ES-19» разъезжалось
  // на «ES-» и «19». Дефис заменяется неразрывным (U+2011).
  out = out.replace(/\b([A-Z]{2,4})-(\d{1,3})\b/g, `$1${NBHY}$2`);

  return out;
}

function walk(value, key) {
  if (typeof value === "string") {
    if (SKIP_KEYS.has(key) || LOOKS_TECHNICAL.test(value)) return value;
    return bind(value);
  }
  if (Array.isArray(value)) return value.map((v) => walk(v, key));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v, k)]));
  }
  return value;
}

async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(full)));
    else if (entry.name.endsWith(".json")) files.push(full);
  }
  return files;
}

const check = process.argv.includes("--check");
let touched = 0;

for (const file of await collect(SRC)) {
  const before = await readFile(file, "utf8");
  const after = `${JSON.stringify(walk(JSON.parse(before)), null, 2)}\n`;
  if (before === after) continue;

  touched += 1;
  const added = [...after].filter((c) => c === NBSP).length - [...before].filter((c) => c === NBSP).length;
  console.log(`${path.relative(ROOT, file)}: +${added} неразрывных`);
  if (!check) await writeFile(file, after);
}

console.log(touched ? `\nФайлов ${check ? "требует правки" : "поправлено"}: ${touched}` : "\nВсё уже связано.");
if (check && touched) process.exitCode = 1;

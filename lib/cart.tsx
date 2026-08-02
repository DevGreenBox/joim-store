"use client";

import { useSyncExternalStore } from "react";

import type { CartLine } from "@/lib/types";

/**
 * Корзина как внешнее хранилище поверх localStorage.
 *
 * Состояние живёт в модуле, компоненты подписываются через
 * useSyncExternalStore: на сервере снимок всегда пустой, на клиенте — то, что
 * лежит в localStorage. Поэтому нет ни расхождений при гидратации, ни
 * setState внутри эффектов, ни контекста вокруг всего дерева.
 */

const STORAGE_KEY = "joim-cart-v1";
const MAX_QTY = 20;
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const valid = parsed.filter(
      (line): line is CartLine =>
        typeof line === "object" &&
        line !== null &&
        typeof (line as CartLine).slug === "string" &&
        Number.isFinite((line as CartLine).qty) &&
        (line as CartLine).qty > 0,
    );
    return valid.length > 0 ? valid : EMPTY;
  } catch {
    return EMPTY;
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    lines = parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    lines = EMPTY;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Приватный режим или переполненное хранилище — корзина живёт в памяти.
  }
  emit();
}

/** Корзина открыта в двух вкладках — держим их синхронными. */
function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  lines = parse(event.newValue);
  emit();
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): CartLine[] {
  load();
  return lines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

export function add(slug: string, qty = 1) {
  const existing = lines.find((line) => line.slug === slug);
  commit(
    existing
      ? lines.map((line) =>
          line.slug === slug
            ? { ...line, qty: Math.min(line.qty + qty, MAX_QTY) }
            : line,
        )
      : [...lines, { slug, qty: Math.min(qty, MAX_QTY) }],
  );
}

export function setQty(slug: string, qty: number) {
  commit(
    qty <= 0
      ? lines.filter((line) => line.slug !== slug)
      : lines.map((line) =>
          line.slug === slug ? { ...line, qty: Math.min(qty, MAX_QTY) } : line,
        ),
  );
}

export function remove(slug: string) {
  commit(lines.filter((line) => line.slug !== slug));
}

export function clear() {
  commit([]);
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Корзина прочитана из localStorage. До этого счётчики и пустые состояния
  // не показываем, чтобы разметка сервера и клиента совпадали.
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return {
    lines: items,
    ready,
    count: items.reduce((sum, line) => sum + line.qty, 0),
    add,
    setQty,
    remove,
    clear,
  };
}

"use client";

import type { Invoice } from "@/lib/actions";
import legal from "@/content/pages/legal.json";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * Накладная к заказу: собирается автоматически из принятой заявки
 * и печатается по кнопке.
 *
 * Хранилища заказов пока нет, поэтому документ живёт ровно столько,
 * сколько открыта страница «заказ принят». Печатать его удобно сразу —
 * покупателю на память, продавцу в посылку.
 *
 * На экране блок скрыт: он нужен только на бумаге. Показывать его рядом
 * с подтверждением незачем — там уже сказано всё то же самое короче.
 * Печатные стили лежат в `globals.css`, поэтому лист выходит белым
 * с чёрным текстом, а не тёмным, как сайт.
 */
export function OrderInvoice({ invoice }: { invoice: Invoice }) {
  const { requisites } = legal;

  return (
    <div
      id="order-invoice"
      aria-hidden="true"
      className="hidden print:block print:text-black"
    >
      <table className="w-full">
        <tbody>
          <tr>
            <td className="align-top">
              <p className="text-[22px] font-semibold">
                Заказ № {invoice.orderId}
              </p>
              <p className="mt-1 text-[13px]">от {invoice.date}</p>
            </td>
            <td className="text-right align-top text-[12px] leading-relaxed">
              <p className="font-semibold">{site.legalName}</p>
              {requisites.items.map((item) => (
                <p key={item.label}>
                  {item.label}: {item.value}
                </p>
              ))}
              <p>{site.phone}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="mt-8 w-full text-[13px]">
        <tbody>
          <tr>
            <td className="w-[110px] py-1 align-top">Получатель</td>
            <td className="py-1 font-medium">{invoice.name}</td>
          </tr>
          <tr>
            <td className="py-1 align-top">Телефон</td>
            <td className="py-1">{invoice.phone}</td>
          </tr>
          {invoice.email ? (
            <tr>
              <td className="py-1 align-top">Почта</td>
              <td className="py-1">{invoice.email}</td>
            </tr>
          ) : null}
          <tr>
            <td className="py-1 align-top">Доставка</td>
            <td className="py-1">
              {invoice.delivery}
              {invoice.city ? `, ${invoice.city}` : ""}
            </td>
          </tr>
          {invoice.address ? (
            <tr>
              <td className="py-1 align-top">Адрес</td>
              <td className="py-1">{invoice.address}</td>
            </tr>
          ) : null}
          {invoice.comment ? (
            <tr>
              <td className="py-1 align-top">Комментарий</td>
              <td className="py-1">{invoice.comment}</td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <table className="mt-8 w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-black/40 text-left">
            <th className="py-2 font-semibold">Артикул</th>
            <th className="py-2 font-semibold">Наименование</th>
            <th className="py-2 text-right font-semibold">Кол-во</th>
            <th className="py-2 text-right font-semibold">Цена</th>
            <th className="py-2 text-right font-semibold">Сумма</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line) => (
            <tr key={line.sku} className="border-b border-black/15">
              <td className="py-2">{line.sku}</td>
              <td className="py-2">{line.name}</td>
              <td className="py-2 text-right">{line.qty}</td>
              <td className="py-2 text-right">{formatPrice(line.price)}</td>
              <td className="py-2 text-right">
                {formatPrice(line.price * line.qty)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="py-2 text-right">
              Товары
            </td>
            <td className="py-2 text-right">{formatPrice(invoice.subtotal)}</td>
          </tr>
          <tr>
            <td colSpan={4} className="py-1 text-right">
              Доставка
            </td>
            <td className="py-1 text-right">
              {invoice.shipping === 0
                ? "бесплатно"
                : formatPrice(invoice.shipping)}
            </td>
          </tr>
          <tr className="border-t border-black/40">
            <td colSpan={4} className="py-2 text-right font-semibold">
              Итого
            </td>
            <td className="py-2 text-right text-[16px] font-semibold">
              {formatPrice(invoice.total)}
            </td>
          </tr>
        </tfoot>
      </table>

      <table className="mt-16 w-full text-[12px]">
        <tbody>
          <tr>
            <td className="w-1/2 border-t border-black/40 pt-2 align-top">
              Отпустил
            </td>
            <td className="w-1/2 border-t border-black/40 pt-2 pl-8 align-top">
              Получил
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-8 text-[11px]">
        Оплата при получении. Условия продажи — {site.url}/offer, гарантия —{" "}
        {site.url}/warranty.
      </p>
    </div>
  );
}

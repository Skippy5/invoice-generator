"use client";

import { formatCurrency, formatRate, invoiceTotals, lineAmount } from "@/lib/calc";
import type { Invoice } from "@/lib/types";

type InvoicePreviewProps = {
  invoice: Invoice;
};

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const totals = invoiceTotals(invoice);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-8 font-serif text-slate-950 shadow-sm">
      <header className="mb-10 text-right font-sans">
        <h2 className="text-4xl font-bold uppercase tracking-[0.32em] text-slate-950">
          Invoice
        </h2>
        <p className="mt-2 text-sm text-slate-600">#{invoice.invoiceNumber}</p>
      </header>

      <div className="space-y-5 text-sm leading-6">
        <p>
          <span className="font-bold">INVOICE DATE:</span> {invoice.invoiceDate}
        </p>
        <p>
          <span className="font-bold">BILLED TO:</span> {invoice.billedTo}
        </p>
        <div>
          <p className="font-bold">PAY TO:</p>
          <p>{invoice.payToName}</p>
          <p>{invoice.payToAddress1}</p>
          <p>{invoice.payToAddress2}</p>
        </div>
        <div className="grid gap-1 text-sm sm:grid-cols-2">
          <p>
            <span className="font-bold">Bank:</span> {invoice.bankName}
          </p>
          <p>
            <span className="font-bold">Account Name:</span> {invoice.accountName}
          </p>
          <p>
            <span className="font-bold">BSB:</span> {invoice.bsb}
          </p>
          <p>
            <span className="font-bold">Account Number:</span>{" "}
            {invoice.accountNumber}
          </p>
        </div>
      </div>

      <table className="mt-10 w-full border-collapse text-sm">
        <thead className="border-b border-slate-300 font-sans text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th className="py-3 text-left">Description</th>
            <th className="py-3 text-right">Rate</th>
            <th className="py-3 text-right">Hours</th>
            <th className="py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map((item) => (
            <tr key={item.id} className="border-b border-slate-200">
              <td className="py-3 pr-4">{item.description || "Untitled item"}</td>
              <td className="py-3 text-right">{formatRate(item.rate)}</td>
              <td className="py-3 text-right">{item.hours}</td>
              <td className="py-3 text-right">
                {formatCurrency(lineAmount(item))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 ml-auto w-full max-w-xs space-y-3 text-sm">
        <div className="flex justify-between gap-8">
          <span>Sub Total</span>
          <span>{formatCurrency(totals.subTotal)}</span>
        </div>
        {invoice.discountPercent > 0 ? (
          <div className="flex justify-between gap-8">
            <span>{invoice.discountLabel || "Discount"}</span>
            <span>{formatCurrency(totals.discount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between gap-8 border-t border-slate-400 pt-3 text-lg font-bold">
          <span>TOTAL</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <footer className="mt-12 space-y-3 text-sm leading-6 text-slate-700">
        <p>
          Payment is required within {invoice.paymentTermsDays} business days of
          invoice date. Please send remittance to {invoice.remittanceEmail}.
        </p>
        <p className="font-bold text-slate-950">Thank you for your business.</p>
      </footer>
    </article>
  );
}

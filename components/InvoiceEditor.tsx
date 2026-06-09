"use client";

import { formatCurrency, invoiceTotals, lineAmount, normalizeNumber } from "@/lib/calc";
import type { Invoice, LineItem } from "@/lib/types";

type InvoiceEditorProps = {
  invoice: Invoice;
  onChange: (invoice: Invoice) => void;
};

const fieldLabels: Array<{
  key: keyof Omit<Invoice, "id" | "lineItems">;
  label: string;
  type?: "number" | "email" | "date";
}> = [
  { key: "invoiceNumber", label: "Invoice Number" },
  { key: "invoiceDate", label: "Invoice Date", type: "date" },
  { key: "billedTo", label: "Billed To" },
  { key: "payToName", label: "Pay To Name" },
  { key: "payToAddress1", label: "Pay To Address 1" },
  { key: "payToAddress2", label: "Pay To Address 2" },
  { key: "bankName", label: "Bank Name" },
  { key: "accountName", label: "Account Name" },
  { key: "bsb", label: "BSB" },
  { key: "accountNumber", label: "Account Number" },
  { key: "discountLabel", label: "Discount Label" },
  { key: "discountPercent", label: "Discount Percent", type: "number" },
  { key: "paymentTermsDays", label: "Payment Terms Days", type: "number" },
  { key: "remittanceEmail", label: "Remittance Email", type: "email" },
];

export function InvoiceEditor({ invoice, onChange }: InvoiceEditorProps) {
  const totals = invoiceTotals(invoice);

  function updateField(
    key: keyof Omit<Invoice, "id" | "lineItems">,
    value: string,
  ) {
    const nextValue =
      key === "discountPercent" || key === "paymentTermsDays"
        ? normalizeNumber(value)
        : value;

    onChange({ ...invoice, [key]: nextValue });
  }

  function updateLineItem(id: string, patch: Partial<LineItem>) {
    onChange({
      ...invoice,
      lineItems: invoice.lineItems.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  function addLineItem() {
    const id = `${invoice.invoiceNumber || "invoice"}-item-${Date.now()}`;
    onChange({
      ...invoice,
      lineItems: [
        ...invoice.lineItems,
        {
          id,
          invoiceNumber: invoice.invoiceNumber,
          description: "",
          rate: 0,
          hours: 0,
        },
      ],
    });
  }

  function removeLineItem(id: string) {
    onChange({
      ...invoice,
      lineItems: invoice.lineItems.filter((item) => item.id !== id),
    });
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Editable invoice
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Invoice #{invoice.invoiceNumber || "Draft"}
          </h2>
        </div>
        <p className="text-sm font-semibold text-slate-700">
          Total {formatCurrency(totals.total)}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fieldLabels.map((field) => (
          <label key={field.key} className="grid gap-1.5 text-sm font-medium text-slate-700">
            {field.label}
            <input
              type={field.type ?? "text"}
              value={String(invoice[field.key] ?? "")}
              min={field.type === "number" ? 0 : undefined}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              onChange={(event) => updateField(field.key, event.target.value)}
            />
          </label>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Line Items
          </h3>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            onClick={addLineItem}
          >
            Add row
          </button>
        </div>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 pr-3">Description</th>
              <th className="px-3 py-2">Rate</th>
              <th className="px-3 py-2">Hours</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="py-2 pl-3 text-right">Remove</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-2 pr-3">
                  <input
                    value={item.description}
                    className="w-full min-w-48 rounded-md border border-slate-300 px-2 py-1.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    onChange={(event) =>
                      updateLineItem(item.id, { description: event.target.value })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={item.rate}
                    className="w-24 rounded-md border border-slate-300 px-2 py-1.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    onChange={(event) =>
                      updateLineItem(item.id, {
                        rate: normalizeNumber(event.target.value),
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    step="0.25"
                    value={item.hours}
                    className="w-20 rounded-md border border-slate-300 px-2 py-1.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    onChange={(event) =>
                      updateLineItem(item.id, {
                        hours: normalizeNumber(event.target.value),
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium text-slate-900">
                  {formatCurrency(lineAmount(item))}
                </td>
                <td className="py-2 pl-3 text-right">
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                    onClick={() => removeLineItem(item.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

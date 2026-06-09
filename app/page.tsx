"use client";

import { useMemo, useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { InvoiceEditor } from "@/components/InvoiceEditor";
import { InvoicePreview } from "@/components/InvoicePreview";
import { TemplateButton } from "@/components/TemplateButton";
import { downloadInvoices } from "@/lib/buildDocx";
import type { Invoice } from "@/lib/types";

export default function Home() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedInvoices = useMemo(
    () => invoices.slice(0, selectedCount),
    [invoices, selectedCount],
  );

  function handleParsed(parsedInvoices: Invoice[]) {
    setInvoices(parsedInvoices);
    setSelectedCount(parsedInvoices.length);
    setError(null);
  }

  function updateInvoice(nextInvoice: Invoice) {
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === nextInvoice.id ? nextInvoice : invoice,
      ),
    );
  }

  async function handleGenerate() {
    if (selectedInvoices.length === 0) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await downloadInvoices(selectedInvoices);
    } catch {
      setError("The Word file could not be generated. Check the invoice fields and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Spreadsheet to Word
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Invoice Generator
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Upload an Excel workbook, edit each invoice, preview the printed
              layout, and download Word documents from your browser.
            </p>
          </div>
          <TemplateButton />
        </header>

        <FileUpload onParsed={handleParsed} onError={setError} />

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        ) : null}

        {invoices.length > 0 ? (
          <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-950">
                Found {invoices.length} invoice{invoices.length === 1 ? "" : "s"}.
              </p>
              <p className="mt-1 text-sm text-slate-600">
                The generator uses the first selected invoices in spreadsheet order.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                Number of invoices to generate
                <select
                  value={selectedCount}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  onChange={(event) => setSelectedCount(Number(event.target.value))}
                >
                  {invoices.map((invoice, index) => (
                    <option key={invoice.id} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="h-10 rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={selectedInvoices.length === 0 || isGenerating}
                onClick={() => void handleGenerate()}
              >
                {isGenerating
                  ? "Generating..."
                  : selectedInvoices.length === 1
                    ? "Generate Word"
                    : "Generate Word ZIP"}
              </button>
            </div>
          </section>
        ) : null}

        {selectedInvoices.map((invoice) => (
          <section
            key={invoice.id}
            className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(520px,0.9fr)]"
          >
            <InvoiceEditor invoice={invoice} onChange={updateInvoice} />
            <InvoicePreview invoice={invoice} />
          </section>
        ))}
      </div>
    </main>
  );
}

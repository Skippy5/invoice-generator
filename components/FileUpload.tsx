"use client";

import { useRef, useState } from "react";
import { parseWorkbook } from "@/lib/parseWorkbook";
import type { Invoice } from "@/lib/types";

type FileUploadProps = {
  onParsed: (invoices: Invoice[]) => void;
  onError: (message: string) => void;
};

export function FileUpload({ onParsed, onError }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFile(file?: File) {
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      onError("Please upload an .xlsx workbook. The blank template is the safest starting point.");
      return;
    }

    const result = await parseWorkbook(file);

    if (!result.ok) {
      onError(result.message);
      return;
    }

    onParsed(result.invoices);
  }

  return (
    <section
      className={`rounded-lg border border-dashed p-8 text-center transition ${
        isDragging
          ? "border-emerald-500 bg-emerald-50"
          : "border-slate-300 bg-white"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        void handleFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      <p className="text-lg font-semibold text-slate-950">Upload invoice spreadsheet</p>
      <p className="mt-2 text-sm text-slate-600">
        Drop an .xlsx workbook here, or choose one from your computer.
      </p>
      <button
        type="button"
        className="mt-5 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        onClick={() => inputRef.current?.click()}
      >
        Choose .xlsx file
      </button>
    </section>
  );
}

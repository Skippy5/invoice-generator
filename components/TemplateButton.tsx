"use client";

import * as XLSX from "xlsx";
import { INVOICE_HEADERS, LINE_ITEM_HEADERS } from "@/lib/parseWorkbook";

const invoiceRows = [
  {
    InvoiceNumber: "1024",
    InvoiceDate: "2026-06-09",
    BilledTo: "Really Great Company",
    PayToName: "Avery Davis",
    PayToAddress1: "123 Anywhere St., Any City",
    PayToAddress2: "123 456 7890",
    BankName: "Really Great Bank",
    AccountName: "John Smith",
    BSB: "000 000",
    AccountNumber: "0000 0000",
    DiscountLabel: "Package Discount (30%)",
    DiscountPercent: 30,
    PaymentTermsDays: 14,
    RemittanceEmail: "hello@reallygreatsite.com",
  },
  {
    InvoiceNumber: "1025",
    InvoiceDate: "2026-06-10",
    BilledTo: "Bright Harbor Studio",
    PayToName: "Avery Davis",
    PayToAddress1: "123 Anywhere St., Any City",
    PayToAddress2: "123 456 7890",
    BankName: "Really Great Bank",
    AccountName: "John Smith",
    BSB: "000 000",
    AccountNumber: "0000 0000",
    DiscountLabel: "Package Discount",
    DiscountPercent: 0,
    PaymentTermsDays: 14,
    RemittanceEmail: "hello@reallygreatsite.com",
  },
];

const lineItemRows = [
  { InvoiceNumber: "1024", Description: "Content Plan", Rate: 50, Hours: 4 },
  { InvoiceNumber: "1024", Description: "Draft Revisions", Rate: 65, Hours: 2 },
  { InvoiceNumber: "1025", Description: "Landing Page Copy", Rate: 75, Hours: 5 },
  { InvoiceNumber: "1025", Description: "Editorial Review", Rate: 60, Hours: 1.5 },
];

export function TemplateButton() {
  function downloadTemplate() {
    const workbook = XLSX.utils.book_new();
    const invoices = XLSX.utils.json_to_sheet(invoiceRows, {
      header: [...INVOICE_HEADERS],
    });
    const lineItems = XLSX.utils.json_to_sheet(lineItemRows, {
      header: [...LINE_ITEM_HEADERS],
    });

    XLSX.utils.book_append_sheet(workbook, invoices, "Invoices");
    XLSX.utils.book_append_sheet(workbook, lineItems, "LineItems");
    XLSX.writeFile(workbook, "invoice-template.xlsx");
  }

  return (
    <button
      type="button"
      className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
      onClick={downloadTemplate}
    >
      Download blank template
    </button>
  );
}

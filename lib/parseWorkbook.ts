import * as XLSX from "xlsx";
import { normalizeDate, normalizeInteger, normalizeNumber } from "./calc";
import type { Invoice, LineItem, ParseResult } from "./types";

export const INVOICE_HEADERS = [
  "InvoiceNumber",
  "InvoiceDate",
  "BilledTo",
  "PayToName",
  "PayToAddress1",
  "PayToAddress2",
  "BankName",
  "AccountName",
  "BSB",
  "AccountNumber",
  "DiscountLabel",
  "DiscountPercent",
  "PaymentTermsDays",
  "RemittanceEmail",
] as const;

export const LINE_ITEM_HEADERS = [
  "InvoiceNumber",
  "Description",
  "Rate",
  "Hours",
] as const;

type Row = Record<string, unknown>;

function firstRowHeaders(sheet: XLSX.WorkSheet): string[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });

  return (rows[0] ?? []).map((value) => String(value).trim());
}

function missingColumns(headers: string[], required: readonly string[]) {
  const found = new Set(headers);
  return required.filter((header) => !found.has(header));
}

function asText(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

export async function parseWorkbook(file: File): Promise<ParseResult> {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array", cellDates: true });

    for (const sheetName of ["Invoices", "LineItems"]) {
      if (!workbook.Sheets[sheetName]) {
        return {
          ok: false,
          message: `The workbook is missing the "${sheetName}" sheet. Download the blank template and try again.`,
        };
      }
    }

    const invoiceSheet = workbook.Sheets.Invoices;
    const lineItemSheet = workbook.Sheets.LineItems;
    const invoiceMissing = missingColumns(
      firstRowHeaders(invoiceSheet),
      INVOICE_HEADERS,
    );
    const lineItemMissing = missingColumns(
      firstRowHeaders(lineItemSheet),
      LINE_ITEM_HEADERS,
    );

    if (invoiceMissing.length > 0) {
      return {
        ok: false,
        message: `The "Invoices" sheet is missing required column "${invoiceMissing[0]}".`,
      };
    }

    if (lineItemMissing.length > 0) {
      return {
        ok: false,
        message: `The "LineItems" sheet is missing required column "${lineItemMissing[0]}".`,
      };
    }

    const invoiceRows = XLSX.utils.sheet_to_json<Row>(invoiceSheet, {
      defval: "",
      raw: true,
    });
    const lineItemRows = XLSX.utils.sheet_to_json<Row>(lineItemSheet, {
      defval: "",
      raw: true,
    });

    if (invoiceRows.length === 0) {
      return {
        ok: false,
        message: "The Invoices sheet does not contain any invoice rows.",
      };
    }

    const invoices: Invoice[] = invoiceRows.map((row, index) => {
      const invoiceNumber = asText(row.InvoiceNumber);
      return {
        id: `${invoiceNumber || "invoice"}-${index}`,
        invoiceNumber,
        invoiceDate: normalizeDate(row.InvoiceDate),
        billedTo: asText(row.BilledTo),
        payToName: asText(row.PayToName),
        payToAddress1: asText(row.PayToAddress1),
        payToAddress2: asText(row.PayToAddress2),
        bankName: asText(row.BankName),
        accountName: asText(row.AccountName),
        bsb: asText(row.BSB),
        accountNumber: asText(row.AccountNumber),
        discountLabel: asText(row.DiscountLabel) || "Discount",
        discountPercent: normalizeNumber(row.DiscountPercent),
        paymentTermsDays: normalizeInteger(row.PaymentTermsDays, 14),
        remittanceEmail: asText(row.RemittanceEmail),
        lineItems: [],
      };
    });

    if (invoices.some((invoice) => !invoice.invoiceNumber)) {
      return {
        ok: false,
        message: "Every invoice row needs an InvoiceNumber.",
      };
    }

    const invoiceNumbers = new Set(
      invoices.map((invoice) => invoice.invoiceNumber),
    );
    const lineItemsByInvoice = new Map<string, LineItem[]>();

    for (const [index, row] of lineItemRows.entries()) {
      const invoiceNumber = asText(row.InvoiceNumber);

      if (!invoiceNumber) {
        return {
          ok: false,
          message: "Every line item row needs an InvoiceNumber.",
        };
      }

      if (!invoiceNumbers.has(invoiceNumber)) {
        return {
          ok: false,
          message: `LineItems contains InvoiceNumber "${invoiceNumber}", but no matching invoice exists.`,
        };
      }

      const item: LineItem = {
        id: `${invoiceNumber}-item-${index}`,
        invoiceNumber,
        description: asText(row.Description),
        rate: normalizeNumber(row.Rate),
        hours: normalizeNumber(row.Hours),
      };

      lineItemsByInvoice.set(invoiceNumber, [
        ...(lineItemsByInvoice.get(invoiceNumber) ?? []),
        item,
      ]);
    }

    return {
      ok: true,
      invoices: invoices.map((invoice) => ({
        ...invoice,
        lineItems: lineItemsByInvoice.get(invoice.invoiceNumber) ?? [],
      })),
    };
  } catch {
    return {
      ok: false,
      message:
        "That file could not be read as an .xlsx workbook. Download the blank template and try again.",
    };
  }
}

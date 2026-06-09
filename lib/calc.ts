import type { Invoice, InvoiceTotals, LineItem } from "./types";

export function normalizeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[$,]/g, "").trim();
    if (!cleaned) {
      return fallback;
    }

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
  }

  return fallback;
}

export function normalizeInteger(value: unknown, fallback = 14): number {
  const parsed = Math.round(normalizeNumber(value, fallback));
  return parsed > 0 ? parsed : fallback;
}

export function normalizeDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    const date = new Date(excelEpoch + value * 24 * 60 * 60 * 1000);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }

    return trimmed;
  }

  return "";
}

export function lineAmount(item: LineItem): number {
  return normalizeNumber(item.rate) * normalizeNumber(item.hours);
}

export function invoiceTotals(invoice: Invoice): InvoiceTotals {
  const subTotal = invoice.lineItems.reduce(
    (sum, item) => sum + lineAmount(item),
    0,
  );
  const discount = subTotal * (normalizeNumber(invoice.discountPercent) / 100);

  return {
    subTotal,
    discount,
    total: Math.max(0, subTotal - discount),
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatRate(rate: number): string {
  const normalized = Number.isFinite(rate) ? rate : 0;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(normalized) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(normalized);

  return `${formatted}/hr`;
}

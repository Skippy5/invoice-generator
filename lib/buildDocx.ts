import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import {
  formatCurrency,
  formatRate,
  invoiceTotals,
  lineAmount,
} from "./calc";
import type { Invoice } from "./types";

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "D9D9D9" };

function cell(
  value: string,
  width: number,
  align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
  options: { bold?: boolean; size?: number } = {},
) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    borders: {
      top: noBorder,
      left: noBorder,
      right: noBorder,
      bottom: thinBorder,
    },
    children: [
      new Paragraph({
        alignment: align,
        children: [text(value, options)],
      }),
    ],
  });
}

function text(
  value: string,
  options: { bold?: boolean; size?: number; font?: string; color?: string } = {},
) {
  return new TextRun({
    text: value,
    bold: options.bold,
    size: options.size ?? 22,
    font: options.font ?? "Cambria",
    color: options.color,
  });
}

function line(label: string, value: string) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [text(`${label}: `, { bold: true }), text(value)],
  });
}

function totalRow(label: string, value: string, bold = false) {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 100 },
    children: [
      text(label, { bold, size: bold ? 26 : 22 }),
      text("    "),
      text(value, { bold, size: bold ? 26 : 22 }),
    ],
  });
}

export function buildInvoiceDocument(invoice: Invoice): Document {
  const totals = invoiceTotals(invoice);
  const totalRows = [
    totalRow("Sub Total", formatCurrency(totals.subTotal)),
    ...(invoice.discountPercent > 0
      ? [
          totalRow(
            invoice.discountLabel || "Discount",
            formatCurrency(totals.discount),
          ),
        ]
      : []),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { top: thinBorder },
      spacing: { before: 120, after: 120 },
      children: [text("TOTAL    ", { bold: true, size: 28 }), text(formatCurrency(totals.total), { bold: true, size: 28 })],
    }),
  ];

  const itemRows = [
    new TableRow({
      children: [
        cell("DESCRIPTION", 46, AlignmentType.LEFT, { bold: true, size: 18 }),
        cell("RATE", 18, AlignmentType.RIGHT, { bold: true, size: 18 }),
        cell("HOURS", 16, AlignmentType.RIGHT, { bold: true, size: 18 }),
        cell("AMOUNT", 20, AlignmentType.RIGHT, { bold: true, size: 18 }),
      ],
    }),
    ...invoice.lineItems.map(
      (item) =>
        new TableRow({
          children: [
            cell(item.description, 46),
            cell(formatRate(item.rate), 18, AlignmentType.RIGHT),
            cell(String(item.hours), 16, AlignmentType.RIGHT),
            cell(formatCurrency(lineAmount(item)), 20, AlignmentType.RIGHT),
          ],
        }),
    ),
  ];

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 80 },
            children: [
              text("INVOICE", {
                bold: true,
                size: 54,
                font: "Arial",
                color: "111827",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 360 },
            children: [text(`#${invoice.invoiceNumber}`, { font: "Arial" })],
          }),
          line("INVOICE DATE", invoice.invoiceDate),
          line("BILLED TO", invoice.billedTo),
          new Paragraph({
            spacing: { before: 160, after: 60 },
            children: [text("PAY TO:", { bold: true })],
          }),
          new Paragraph({ children: [text(invoice.payToName)] }),
          new Paragraph({ children: [text(invoice.payToAddress1)] }),
          new Paragraph({
            spacing: { after: 220 },
            children: [text(invoice.payToAddress2)],
          }),
          line("Bank", invoice.bankName),
          line("Account Name", invoice.accountName),
          line("BSB", invoice.bsb),
          line("Account Number", invoice.accountNumber),
          new Paragraph({ spacing: { after: 320 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: noBorder,
              left: noBorder,
              right: noBorder,
              bottom: noBorder,
              insideHorizontal: thinBorder,
              insideVertical: noBorder,
            },
            rows: itemRows,
          }),
          new Paragraph({ spacing: { after: 260 } }),
          ...totalRows,
          new Paragraph({
            spacing: { before: 480, after: 140 },
            children: [
              text(
                `Payment is required within ${invoice.paymentTermsDays} business days of invoice date. Please send remittance to ${invoice.remittanceEmail}.`,
              ),
            ],
          }),
          new Paragraph({
            children: [text("Thank you for your business.", { bold: true })],
          }),
        ],
      },
    ],
  });
}

function filenameFor(invoice: Invoice) {
  const cleaned = invoice.invoiceNumber.replace(/[^a-z0-9-_]/gi, "-");
  return `Invoice-${cleaned || "draft"}.docx`;
}

export async function downloadInvoices(invoices: Invoice[]): Promise<void> {
  if (invoices.length === 0) {
    return;
  }

  if (invoices.length === 1) {
    const blob = await Packer.toBlob(buildInvoiceDocument(invoices[0]));
    saveAs(blob, filenameFor(invoices[0]));
    return;
  }

  const zip = new JSZip();

  for (const invoice of invoices) {
    const blob = await Packer.toBlob(buildInvoiceDocument(invoice));
    zip.file(filenameFor(invoice), blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, "Invoices.zip");
}

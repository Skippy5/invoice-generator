export type LineItem = {
  id: string;
  invoiceNumber: string;
  description: string;
  rate: number;
  hours: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  billedTo: string;
  payToName: string;
  payToAddress1: string;
  payToAddress2: string;
  bankName: string;
  accountName: string;
  bsb: string;
  accountNumber: string;
  discountLabel: string;
  discountPercent: number;
  paymentTermsDays: number;
  remittanceEmail: string;
  lineItems: LineItem[];
};

export type InvoiceTotals = {
  subTotal: number;
  discount: number;
  total: number;
};

export type ParseResult =
  | { ok: true; invoices: Invoice[] }
  | { ok: false; message: string };

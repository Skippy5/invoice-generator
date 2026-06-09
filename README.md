# Spreadsheet to Word Invoice Generator

A small client-only Next.js app that turns an Excel workbook into editable invoice previews and downloadable Word documents.

## What It Does

- Upload an `.xlsx` workbook with invoice and line-item sheets.
- See how many invoices were found.
- Choose how many invoices to generate.
- Edit invoice fields and line items in the browser.
- Preview a clean printed invoice layout.
- Download one invoice as `Invoice-<InvoiceNumber>.docx`.
- Download multiple invoices as `Invoices.zip`.

All parsing and document generation happens in the browser. There are no API routes, serverless functions, databases, or environment variables.

## Spreadsheet Format

Use the in-app **Download blank template** button as the source of truth. It creates a workbook with two sheets:

### `Invoices`

Required columns:

`InvoiceNumber`, `InvoiceDate`, `BilledTo`, `PayToName`, `PayToAddress1`, `PayToAddress2`, `BankName`, `AccountName`, `BSB`, `AccountNumber`, `DiscountLabel`, `DiscountPercent`, `PaymentTermsDays`, `RemittanceEmail`

Notes:

- `InvoiceNumber` is required and links each invoice to its line items.
- `DiscountPercent` may be `0`; when it is `0`, the discount row is omitted.
- `PaymentTermsDays` is used in the footer sentence.
- Dates are normalized for display where possible.

### `LineItems`

Required columns:

`InvoiceNumber`, `Description`, `Rate`, `Hours`

Notes:

- `InvoiceNumber` must match a row in the `Invoices` sheet.
- `Rate` and `Hours` are numeric and may use decimals.

Calculations are computed by the app:

- Line amount = `Rate * Hours`
- Sub Total = sum of line amounts
- Discount = `Sub Total * DiscountPercent / 100`
- Total = `Sub Total - Discount`

If a workbook is missing a required sheet or column, the app shows a friendly error and points the user back to the template.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run lint
npm run build
```

## Deployment

This is a standard Next.js App Router project and can be imported into Vercel with default settings.

```bash
vercel
vercel --prod
```

## Links

- GitHub: pending repository creation
- Live app: pending Vercel deployment

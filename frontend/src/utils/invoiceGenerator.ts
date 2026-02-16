import * as FileSystem from "expo-file-system";
import { Share } from "react-native";
import type { Order } from "../services/api/orders.api";

export type InvoiceResult = { uri: string };

export async function generateInvoicePdf(order: Order): Promise<InvoiceResult> {
  try {
    const PDFLib: any = (require as any)("react-native-pdf-lib");
    const page1 = PDFLib.Page.create();
    page1.drawText(`Glowverse Invoice`, { x: 50, y: 700, color: "#111111", fontSize: 22 });
    page1.drawText(`Order: ${order.number || order.id}`, { x: 50, y: 670, fontSize: 14 });
    page1.drawText(`Date: ${new Date(order.createdAt).toLocaleString()}`, { x: 50, y: 650, fontSize: 12 });
    let y = 620;
    for (const it of order.items) {
      const line = `${it.product?.name || it.productId} x${it.quantity}  $${((it.price || 0) * it.quantity).toFixed(2)}`;
      page1.drawText(line, { x: 50, y, fontSize: 12 });
      y -= 18;
    }
    page1.drawText(`Subtotal: $${order.subtotal.toFixed(2)}`, { x: 50, y: y - 10, fontSize: 12 });
    page1.drawText(`Tax: $${order.tax.toFixed(2)}`, { x: 50, y: y - 28, fontSize: 12 });
    page1.drawText(`Shipping: $${order.shipping.toFixed(2)}`, { x: 50, y: y - 46, fontSize: 12 });
    page1.drawText(`Total: $${order.total.toFixed(2)}`, { x: 50, y: y - 70, fontSize: 16 });
    const FS: any = FileSystem as any;
    const docsDir = FS?.cacheDirectory || FS?.documentDirectory || "/tmp/";
    const path = `${docsDir}invoice_${order.id}.pdf`;
    const pdfDoc = PDFLib.PDFDocument.create(path).addPages(page1);
    await pdfDoc.write();
    return { uri: path };
  } catch {
    const html = toHtmlInvoice(order);
    const FS: any = FileSystem as any;
    const uri = `${(FS?.cacheDirectory || FS?.documentDirectory || "/tmp/")}invoice_${order.id}.html`;
    await FS.writeAsStringAsync(uri, html, { encoding: "utf8" });
    return { uri };
  }
}

export async function shareInvoice(order: Order): Promise<void> {
  const res = await generateInvoicePdf(order);
  try {
    await Share.share({ url: res.uri, title: "Invoice" });
  } catch {}
}

function toHtmlInvoice(order: Order): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Invoice ${order.number || order.id}</title></head>
<body>
  <h1>Glowverse Invoice</h1>
  <h3>Order ${order.number || order.id}</h3>
  <p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
  <table border="1" cellpadding="6" cellspacing="0">
    <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
    <tbody>
      ${order.items.map(it => `<tr><td>${it.product?.name || it.productId}</td><td>${it.quantity}</td><td>$${((it.price || 0) * it.quantity).toFixed(2)}</td></tr>`).join("")}
    </tbody>
  </table>
  <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
  <p>Tax: $${order.tax.toFixed(2)}</p>
  <p>Shipping: $${order.shipping.toFixed(2)}</p>
  <h2>Total: $${order.total.toFixed(2)}</h2>
</body></html>`;
}

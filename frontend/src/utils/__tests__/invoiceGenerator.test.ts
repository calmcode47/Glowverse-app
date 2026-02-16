import { generateInvoicePdf } from "../../utils/invoiceGenerator";

jest.mock("react-native-pdf-lib", () => {
  return new Proxy({}, { get() { throw new Error("not installed"); } });
}, { virtual: true });
jest.mock("expo-file-system", () => {
  let store: Record<string, string> = {};
  return {
    __esModule: true,
    writeAsStringAsync: jest.fn(async (uri: string, content: string) => {
      store[uri] = content;
    }),
  };
});

describe("invoiceGenerator", () => {
  it("falls back to HTML when pdf-lib is unavailable", async () => {
    const order: any = {
      id: "o1",
      number: "INV-123",
      createdAt: new Date().toISOString(),
      items: [{ productId: "p1", product: { name: "Prod 1" }, quantity: 2, price: 10 }],
      subtotal: 20,
      tax: 0,
      shipping: 0,
      total: 20
    };
    const res = await generateInvoicePdf(order);
    expect(typeof res.uri).toBe("string");
    expect(res.uri.includes("invoice_")).toBe(true);
  });
});

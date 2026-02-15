import { getProducts } from "../products.api";

jest.mock("../client", () => ({
  client: {
    get: jest.fn(async () => ({ data: { items: [{ id: "1", name: "Product 1", price: 10 }], total: 1, page: 1, totalPages: 1 } }))
  }
}));

describe("products.api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches products successfully", async () => {
    const res = await getProducts();
    expect(res.products.length).toBe(1);
    expect(res.total).toBe(1);
  });

  it("handles API errors", async () => {
    const { client } = require("../client");
    client.get.mockRejectedValueOnce(new Error("Network error"));
    const res = await getProducts();
    expect(res.products.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThan(0);
  });
});

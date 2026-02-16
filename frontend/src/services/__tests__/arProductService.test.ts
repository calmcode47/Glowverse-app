import { convertGlowverseProductToAR, arProductToMakeupProduct } from "../arProductService";

describe("arProductService", () => {
  it("converts product to AR format and MakeupProduct", () => {
    const product: any = {
      id: "p1",
      name: "Lip Color 1",
      category: "lipstick",
      colorHex: "#CC3366",
      finish: "matte"
    };
    const ar = convertGlowverseProductToAR(product);
    expect(ar.sdkProductId).toBe("p1");
    expect(ar.type).toBe("lip");
    expect(ar.colors.primary.r).toBeGreaterThanOrEqual(0);
    expect(ar.intensity.default).toBeGreaterThan(0);
    const mp = arProductToMakeupProduct(ar);
    expect(mp.id).toBe("p1");
    expect(mp.category).toBe("lipstick");
    expect(typeof mp.color).toBe("string");
  });
});


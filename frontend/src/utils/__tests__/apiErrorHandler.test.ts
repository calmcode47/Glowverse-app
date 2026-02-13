import { handleAPIError, withBackoffRetry } from "../../utils/apiErrorHandler";

describe("apiErrorHandler", () => {
  it("maps status codes", () => {
    expect(handleAPIError({ response: { status: 400 } })).toMatch(/Invalid request/);
    expect(handleAPIError({ response: { status: 401 } })).toMatch(/log in/);
    expect(handleAPIError({ response: { status: 403 } })).toMatch(/permission/);
    expect(handleAPIError({ response: { status: 404 } })).toMatch(/not found/);
    expect(handleAPIError({ response: { status: 429 } })).toMatch(/Too many/);
    expect(handleAPIError({ response: { status: 500 } })).toMatch(/Server error/);
    expect(handleAPIError({ response: { status: 503 } })).toMatch(/Something went wrong/);
  });
});

describe("withBackoffRetry", () => {
  it("retries up to 3 times and succeeds", async () => {
    let attempts = 0;
    const fn = jest.fn(async () => {
      attempts++;
      if (attempts < 3) throw new Error("fail");
      return "ok";
    });
    const res = await withBackoffRetry(fn);
    expect(res).toBe("ok");
    expect(attempts).toBe(3);
  });

  it("throws after max retries", async () => {
    const fn = jest.fn(async () => {
      throw new Error("fail");
    });
    await expect(withBackoffRetry(fn)).rejects.toThrow("fail");
  });
});

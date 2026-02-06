import { validateEmail, validatePhoneNumber, validateFileSize } from "../../src/utils/validation";

test("validateEmail works", () => {
  expect(validateEmail("test@example.com")).toBe(true);
  expect(validateEmail("bad-email")).toBe(false);
});

test("validatePhoneNumber works", () => {
  expect(validatePhoneNumber("+1234567890")).toBe(true);
  expect(validatePhoneNumber("abc123")).toBe(false);
});

test("validateFileSize works", () => {
  expect(validateFileSize(100, 200)).toBe(true);
  expect(validateFileSize(300, 200)).toBe(false);
});

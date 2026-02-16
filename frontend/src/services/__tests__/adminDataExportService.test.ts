import { adminDataExportService } from "../adminDataExportService";

describe("adminDataExportService", () => {
  it("converts to CSV with headers", async () => {
    // @ts-ignore - access private via casting
    const csv = (adminDataExportService as any).convertToCSV([{ a: 1, b: 2 }, { a: 3, b: 4 }]);
    expect(csv.split("\n")[0]).toBe("a,b");
    expect(csv.includes("1,2")).toBe(true);
    expect(csv.includes("3,4")).toBe(true);
  });
});


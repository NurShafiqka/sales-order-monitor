import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatNumber } from "./format";

// Intl may use a non-breaking space between "RM" and the amount.
const normalise = (s: string) => s.replace(/\s/g, " ");

describe("format", () => {
  it("formats amounts as Malaysian ringgit", () => {
    expect(normalise(formatCurrency(998244.3))).toBe("RM 998,244.30");
  });

  it("formats counts with thousands separators", () => {
    expect(formatNumber(1200)).toBe("1,200");
  });

  it("shows dates in Malaysia time, not UTC", () => {
    // 20:00 UTC on 30 Sep is 04:00 on 1 Oct in Kuala Lumpur (UTC+8).
    expect(formatDate("2026-09-30T20:00:00.000Z")).toBe("01 Oct 2026");
  });
});

// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse, makeOrder } from "@/test/helpers";
import { OrderDetail } from "./OrderDetail";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("OrderDetail", () => {
  it("loads the order from the single-order route and shows its fields", async () => {
    fetchMock.mockResolvedValue(jsonResponse(makeOrder()));
    render(<OrderDetail salesId="SO-MOCK-00001" onClose={vi.fn()} />);

    expect(await screen.findByText("Aisha Noor")).toBeTruthy();
    expect(screen.getByText("PO-2026001")).toBeTruthy();
    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/orders/SO-MOCK-00001");
  });

  it("shows 'Order not found' for an unknown ID, with no retry button", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "Not found" }, 404));
    render(<OrderDetail salesId="SO-FAKE-123" onClose={vi.fn()} />);

    expect(await screen.findByText("Order not found")).toBeTruthy();
    expect(screen.getByText("No sales order with ID SO-FAKE-123.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull();
  });

  it("shows an error with Try again, which loads the order on retry", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "Sales order service timed out" }, 504))
      .mockResolvedValueOnce(jsonResponse(makeOrder()));
    render(<OrderDetail salesId="SO-MOCK-00001" onClose={vi.fn()} />);

    expect(await screen.findByText("Couldn't load this order")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText("Aisha Noor")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("closes with the close button or the Esc key", async () => {
    fetchMock.mockResolvedValue(jsonResponse(makeOrder()));
    const onClose = vi.fn();
    render(<OrderDetail salesId="SO-MOCK-00001" onClose={onClose} />);
    await screen.findByText("Aisha Noor");

    fireEvent.click(screen.getByRole("button", { name: /close order details/i }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

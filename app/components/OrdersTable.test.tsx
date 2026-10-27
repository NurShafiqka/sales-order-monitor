// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeOrder } from "@/test/helpers";
import type { SalesOrder } from "@/lib/types";
import { OrdersTable } from "./OrdersTable";

afterEach(cleanup);

const orders = [
  makeOrder(),
  makeOrder({ SalesId: "SO-MOCK-00002", SalesName: "Borneo Hardware", SalesStatus: "Cancelled" }),
];

// Pass null to simulate the first load, before any orders have arrived.
function setup(rows: SalesOrder[] | null = orders) {
  const onSort = vi.fn();
  const onSelect = vi.fn();
  render(
    <OrdersTable
      orders={rows ?? undefined}
      loading={!rows}
      sort="SalesId"
      order="asc"
      pageSize={25}
      onSort={onSort}
      onSelect={onSelect}
    />,
  );
  // jsdom ignores CSS, so the mobile list and desktop table both render; test the desktop table.
  return { onSort, onSelect, table: within(screen.getByRole("table")) };
}

describe("OrdersTable", () => {
  it("shows one row per order with its details", () => {
    const { table } = setup();
    expect(table.getAllByRole("row")).toHaveLength(3); // header + 2 orders
    expect(table.getByText("Borneo Hardware")).toBeTruthy();
    expect(table.getAllByText(/162\.35/)).toHaveLength(2);
  });

  it("sorts when a sortable column header is clicked", () => {
    const { onSort, table } = setup();
    fireEvent.click(table.getByRole("button", { name: "Amount" }));
    expect(onSort).toHaveBeenCalledWith("HAR_TotalSOAmount");
  });

  it("marks the current sort column and doesn't make Customer sortable", () => {
    const { table } = setup();
    expect(table.getByRole("columnheader", { name: /order no/i }).getAttribute("aria-sort")).toBe("ascending");
    expect(table.queryByRole("button", { name: "Customer" })).toBeNull();
  });

  it("opens an order when it's clicked", () => {
    const { onSelect, table } = setup();
    fireEvent.click(table.getByRole("button", { name: "SO-MOCK-00002" }));
    expect(onSelect).toHaveBeenCalledWith("SO-MOCK-00002");
  });

  it("shows placeholder rows while the first page is loading", () => {
    const { table } = setup(null);
    expect(table.getAllByRole("row")).toHaveLength(11); // header + 10 skeleton rows
    expect(table.queryByText(/SO-MOCK/)).toBeNull();
  });
});

// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Filters } from "./Filters";

afterEach(cleanup);

function setup(values: { query?: string; site?: string; status?: string } = {}) {
  const handlers = {
    onQueryChange: vi.fn(),
    onSiteChange: vi.fn(),
    onStatusChange: vi.fn(),
    onClear: vi.fn(),
  };
  render(
    <Filters
      query={values.query ?? ""}
      site={values.site ?? ""}
      status={values.status ?? ""}
      sites={[{ value: "A10", count: 150 }, { value: "B20", count: 150 }]}
      statuses={[{ value: "Open order", count: 420 }, { value: "Cancelled", count: 120 }]}
      {...handlers}
    />,
  );
  return handlers;
}

describe("Filters", () => {
  it("lists the branch and status options from the API", () => {
    setup();
    const branch = screen.getByRole("combobox", { name: /branch/i });
    const status = screen.getByRole("combobox", { name: /status/i });
    expect([...branch.querySelectorAll("option")].map((o) => o.textContent)).toEqual(["All branches", "A10", "B20"]);
    expect([...status.querySelectorAll("option")].map((o) => o.textContent)).toEqual([
      "All statuses",
      "Open order",
      "Cancelled",
    ]);
  });

  it("reports search, branch and status changes", () => {
    const handlers = setup();
    fireEvent.change(screen.getByRole("searchbox", { name: /search/i }), { target: { value: "siti" } });
    fireEvent.change(screen.getByRole("combobox", { name: /branch/i }), { target: { value: "B20" } });
    fireEvent.change(screen.getByRole("combobox", { name: /status/i }), { target: { value: "Cancelled" } });
    expect(handlers.onQueryChange).toHaveBeenCalledWith("siti");
    expect(handlers.onSiteChange).toHaveBeenCalledWith("B20");
    expect(handlers.onStatusChange).toHaveBeenCalledWith("Cancelled");
  });

  it("disables Clear filters when nothing is filtered", () => {
    setup();
    expect(screen.getByRole("button", { name: /clear filters/i }).hasAttribute("disabled")).toBe(true);
  });

  it("clears the filters when Clear filters is clicked", () => {
    const handlers = setup({ site: "B20" });
    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(handlers.onClear).toHaveBeenCalled();
  });
});

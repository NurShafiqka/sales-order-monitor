// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { summary } from "@/test/helpers";
import { SummaryCards } from "./SummaryCards";

afterEach(cleanup);

function setup(activeStatus = "") {
  const onSelectStatus = vi.fn();
  render(<SummaryCards summary={summary} activeStatus={activeStatus} onSelectStatus={onSelectStatus} />);
  return onSelectStatus;
}

describe("SummaryCards", () => {
  it("shows the totals from the API summary", () => {
    setup();
    expect(screen.getByText("1,200")).toBeTruthy();
    expect(screen.getByText("420")).toBeTruthy();
    expect(screen.getByText("660")).toBeTruthy(); // completed = invoiced + delivered
    expect(screen.getByText("120")).toBeTruthy();
    expect(screen.getByText(/998,244\.30/)).toBeTruthy();
  });

  it("filters by status when a card is clicked", () => {
    const onSelectStatus = setup();
    fireEvent.click(screen.getByRole("button", { name: /cancelled/i }));
    expect(onSelectStatus).toHaveBeenCalledWith("Cancelled");
  });

  it("filters by invoiced or delivered from the completed card", () => {
    const onSelectStatus = setup();
    fireEvent.click(screen.getByRole("button", { name: /invoiced/i }));
    fireEvent.click(screen.getByRole("button", { name: /delivered/i }));
    expect(onSelectStatus.mock.calls).toEqual([["Invoiced"], ["Delivered"]]);
  });

  it("clears the filter when the active card is clicked again", () => {
    const onSelectStatus = setup("Cancelled");
    const card = screen.getByRole("button", { name: /cancelled/i });
    expect(card.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(card);
    expect(onSelectStatus).toHaveBeenCalledWith("");
  });

  it("shows placeholders while the summary is loading", () => {
    render(<SummaryCards activeStatus="" onSelectStatus={vi.fn()} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});

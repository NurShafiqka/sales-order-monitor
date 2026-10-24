"use client";

import { formatCurrency, formatNumber } from "@/lib/format";
import type { OrdersSummary } from "@/lib/types";

interface SummaryCardsProps {
  summary?: OrdersSummary;
  // Currently selected status filter ("" = all statuses).
  activeStatus: string;
  // Called with the status to filter by, or "" to show all.
  onSelectStatus: (status: string) => void;
}

// Columns: Total | Open | Completed (spans 2) | Cancelled | Total value (wider so RM fits).
const GRID = "grid grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,1.4fr)] gap-4";

const cardBase = "relative overflow-hidden rounded-xl bg-white p-5 text-left shadow-sm transition duration-150";
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

function Accent({ className }: { className: string }) {
  return <span className={`absolute inset-x-0 top-0 h-1 ${className}`} />;
}

export function SummaryCards({ summary, activeStatus, onSelectStatus }: SummaryCardsProps) {
  if (!summary) {
    return (
      <div className={GRID}>
        {[1, 1, 2, 1, 1].map((span, i) => (
          <div
            key={i}
            className={`h-[124px] animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-brand-100 ${span === 2 ? "col-span-2" : ""}`}
          />
        ))}
      </div>
    );
  }

  // Clicking an active status card again clears the filter.
  const toggle = (status: string) => onSelectStatus(activeStatus === status ? "" : status);

  const completedParts = [
    { status: "Invoiced", value: summary.invoiced_orders, note: "Billed to customer", dot: "bg-sky-500" },
    { status: "Delivered", value: summary.delivered_orders, note: "Goods received", dot: "bg-emerald-500" },
  ];
  const completedActive = completedParts.some((p) => p.status === activeStatus);

  return (
    <div className={GRID}>
      <StatusCard
        label="Total orders"
        value={summary.total_orders}
        note="All branches & statuses"
        accent="bg-brand-600"
        active={activeStatus === ""}
        title="Show all orders"
        onClick={() => onSelectStatus("")}
      />

      <StatusCard
        label="Open / pending"
        value={summary.open_orders}
        note="Awaiting fulfilment"
        accent="bg-amber-500"
        active={activeStatus === "Open order"}
        onClick={() => toggle("Open order")}
      />

      {/* Completed = Invoiced + Delivered. The API filters one status at a time,
          so each half filters on its own; the card itself is not a button. */}
      <div
        className={`${cardBase} col-span-2 py-4 ${completedActive ? "ring-2 ring-brand-600" : "ring-1 ring-brand-100"}`}
      >
        <Accent className="bg-emerald-500" />
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-slate-500">Completed</p>
          <p className="text-2xl font-semibold tracking-tight text-brand-900">
            {formatNumber(summary.invoiced_orders + summary.delivered_orders)}
          </p>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {completedParts.map((part) => {
            const active = activeStatus === part.status;
            return (
              <button
                key={part.status}
                type="button"
                onClick={() => toggle(part.status)}
                aria-pressed={active}
                title={active ? "Click to show all statuses" : `Show ${part.status.toLowerCase()} orders`}
                className={`cursor-pointer rounded-lg px-3 py-2 text-left transition ${focusRing} ${
                  active
                    ? "bg-brand-50 ring-2 ring-brand-600"
                    : "bg-slate-50 ring-1 ring-slate-100 hover:bg-white hover:shadow-sm hover:ring-brand-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <span className={`size-1.5 rounded-full ${part.dot}`} />
                    {part.status}
                  </span>
                  <span className="text-lg font-semibold text-brand-900">{formatNumber(part.value)}</span>
                </div>
                <p className="truncate text-[11px] text-slate-400">{active ? "Filtered · click to clear" : part.note}</p>
              </button>
            );
          })}
        </div>
      </div>

      <StatusCard
        label="Cancelled"
        value={summary.cancelled_orders}
        note="Not fulfilled"
        accent="bg-rose-500"
        active={activeStatus === "Cancelled"}
        onClick={() => toggle("Cancelled")}
      />

      {/* Total order value: informational only, not a filter */}
      <div className={`${cardBase} ring-1 ring-brand-100`}>
        <Accent className="bg-brand-900" />
        <p className="text-sm font-medium text-slate-500">Total order value</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">
          {formatCurrency(summary.total_order_value)}
        </p>
        <p className="mt-1 text-xs text-slate-400">Sum of all orders</p>
      </div>
    </div>
  );
}

interface StatusCardProps {
  label: string;
  value: number;
  note: string;
  accent: string;
  active: boolean;
  title?: string;
  onClick: () => void;
}

function StatusCard({ label, value, note, accent, active, title, onClick }: StatusCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title ?? (active ? "Click to show all statuses" : `Show ${label.toLowerCase()} orders`)}
      className={`${cardBase} cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${focusRing} ${
        active ? "bg-brand-50/60 ring-2 ring-brand-600" : "ring-1 ring-brand-100 hover:ring-brand-300"
      }`}
    >
      <Accent className={accent} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">{formatNumber(value)}</p>
      <p className="mt-1 truncate text-xs text-slate-400">
        {active && title === undefined ? "Filtered · click to clear" : note}
      </p>
    </button>
  );
}

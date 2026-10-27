"use client";

import { formatCurrency, formatDate } from "@/lib/format";
import type { SalesOrder } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export const SORT_FIELDS = [
  "SalesId",
  "CreatedDateTime1",
  "HAR_TotalSOAmount",
  "SalesStatus",
  "InventSiteId",
] as const;
export type SortField = (typeof SORT_FIELDS)[number];

interface Column {
  label: string;
  sortField?: SortField;
  align?: "right";
}

const COLUMNS: Column[] = [
  { label: "Order no.", sortField: "SalesId" },
  { label: "Customer" },
  { label: "Branch", sortField: "InventSiteId" },
  { label: "Order date", sortField: "CreatedDateTime1" },
  { label: "Status", sortField: "SalesStatus" },
  { label: "Amount", sortField: "HAR_TotalSOAmount", align: "right" },
];

interface OrdersTableProps {
  orders?: SalesOrder[];
  loading: boolean;
  sort: SortField;
  order: "asc" | "desc";
  pageSize: number;
  selectedId?: string;
  onSort: (field: SortField) => void;
  onSelect: (salesId: string) => void;
}

export function OrdersTable(props: OrdersTableProps) {
  return (
    <>
      <MobileOrderList {...props} />
      <DesktopTable {...props} />
    </>
  );
}

// Below lg: a list of tappable cards, with a sort dropdown in place of column headers.
function MobileOrderList({ orders, loading, sort, order, pageSize, selectedId, onSort, onSelect }: OrdersTableProps) {
  const sortable = COLUMNS.filter((c) => c.sortField);

  return (
    <div className="lg:hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-brand-50/60 px-4 py-2.5">
        <label htmlFor="mobile-sort" className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Sort by
        </label>
        <select
          id="mobile-sort"
          value={sort}
          onChange={(e) => onSort(e.target.value as SortField)}
          className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-base text-slate-700 outline-none focus:border-brand-500"
        >
          {sortable.map((c) => (
            <option key={c.sortField} value={c.sortField}>
              {c.label}
            </option>
          ))}
        </select>
        {/* Same column again = flip direction */}
        <button
          type="button"
          onClick={() => onSort(sort)}
          aria-label={order === "asc" ? "Sorted ascending, tap for descending" : "Sorted descending, tap for ascending"}
          className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-brand-700 active:bg-brand-100"
        >
          {order === "asc" ? "▲" : "▼"}
        </button>
      </div>

      <ul className={`divide-y divide-slate-100 transition-opacity ${loading && orders ? "opacity-50" : ""}`} aria-busy={loading}>
        {orders
          ? orders.map((o) => (
              <li key={o.SalesId}>
                <button
                  type="button"
                  onClick={() => onSelect(o.SalesId)}
                  className={`block w-full px-4 py-3.5 text-left transition-colors active:bg-brand-100 ${
                    o.SalesId === selectedId ? "bg-brand-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[13px] font-medium text-brand-700">{o.SalesId}</span>
                    <StatusBadge status={o.SalesStatus} />
                  </div>
                  <div className="mt-1 truncate font-medium text-slate-800">{o.SalesName}</div>
                  <div className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span className="truncate">
                      {o.InventSiteId} · {formatDate(o.CreatedDateTime1)}
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-800">
                      {formatCurrency(o.HAR_TotalSOAmount)}
                    </span>
                  </div>
                </button>
              </li>
            ))
          : Array.from({ length: Math.min(pageSize, 6) }, (_, i) => (
              <li key={i} className="space-y-2 px-4 py-4">
                <div className="h-4 w-2/5 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </li>
            ))}
      </ul>
    </div>
  );
}

function DesktopTable({ orders, loading, sort, order, pageSize, selectedId, onSort, onSelect }: OrdersTableProps) {
  return (
    <table className="hidden w-full text-left text-sm lg:table">
      <thead className="border-b border-slate-200 bg-brand-50/60 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          {COLUMNS.map((col) => {
            const active = col.sortField === sort;
            return (
              <th
                key={col.label}
                scope="col"
                aria-sort={active ? (order === "asc" ? "ascending" : "descending") : undefined}
                className={`px-5 py-3 font-semibold ${col.align === "right" ? "text-right" : ""}`}
              >
                {col.sortField ? (
                  <button
                    type="button"
                    onClick={() => onSort(col.sortField!)}
                    className={`inline-flex items-center gap-1 uppercase hover:text-brand-700 ${active ? "text-brand-700" : ""}`}
                  >
                    {col.label}
                    <span aria-hidden="true" className={active ? "" : "opacity-0"}>
                      {order === "asc" || !active ? "▲" : "▼"}
                    </span>
                  </button>
                ) : (
                  col.label
                )}
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody
        className={`divide-y divide-slate-100 transition-opacity ${loading && orders ? "opacity-50" : ""}`}
        aria-busy={loading}
      >
        {orders
          ? orders.map((o) => (
              <tr
                key={o.SalesId}
                onClick={() => onSelect(o.SalesId)}
                className={`cursor-pointer ${o.SalesId === selectedId ? "bg-brand-50" : "hover:bg-brand-50/50"}`}
              >
                <td className="whitespace-nowrap px-5 py-3 font-mono text-[13px] font-medium text-brand-700">
                  {/* Real button so the row can be opened with the keyboard too */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(o.SalesId);
                    }}
                    className="rounded hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    {o.SalesId}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="font-medium text-slate-800">{o.SalesName}</div>
                  <div className="text-xs text-slate-400">{o.CustAccount}</div>
                </td>
                <td className="px-5 py-3 text-slate-600">{o.InventSiteId}</td>
                <td className="whitespace-nowrap px-5 py-3 text-slate-600">{formatDate(o.CreatedDateTime1)}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={o.SalesStatus} />
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right font-medium tabular-nums text-slate-800">
                  {formatCurrency(o.HAR_TotalSOAmount)}
                </td>
              </tr>
            ))
          : Array.from({ length: Math.min(pageSize, 10) }, (_, i) => (
              <tr key={i}>
                {COLUMNS.map((col) => (
                  <td key={col.label} className="px-5 py-4">
                    <div className="h-4 animate-pulse rounded bg-slate-100" />
                  </td>
                ))}
              </tr>
            ))}
      </tbody>
    </table>
  );
}

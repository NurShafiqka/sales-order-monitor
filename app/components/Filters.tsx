"use client";

import type { Facet } from "@/lib/types";

interface FiltersProps {
  query: string;
  site: string;
  status: string;
  sites: Facet[];
  statuses: Facet[];
  onQueryChange: (value: string) => void;
  onSiteChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

const selectClass =
  "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function Filters(props: FiltersProps) {
  const hasFilters = Boolean(props.query || props.site || props.status);

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l3.08 3.08a.75.75 0 1 1-1.06 1.06l-3.08-3.08A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="search"
          value={props.query}
          onChange={(e) => props.onQueryChange(e.target.value)}
          placeholder="Search order no., customer, account, PO ref or sales taker…"
          aria-label="Search orders"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <select
        value={props.site}
        onChange={(e) => props.onSiteChange(e.target.value)}
        aria-label="Filter by branch"
        className={`${selectClass} w-44`}
      >
        <option value="">All branches</option>
        {props.sites.map((s) => (
          <option key={s.value} value={s.value}>
            {s.value} ({s.count})
          </option>
        ))}
      </select>

      <select
        value={props.status}
        onChange={(e) => props.onStatusChange(e.target.value)}
        aria-label="Filter by status"
        className={`${selectClass} w-44`}
      >
        <option value="">All statuses</option>
        {props.statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.value} ({s.count})
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={props.onClear}
        disabled={!hasFilters}
        className="h-10 rounded-lg px-3 text-sm font-medium text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
      >
        Clear filters
      </button>
    </div>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";
import type { MetaResponse, OrdersResponse } from "@/lib/types";
import { useFetchJson } from "@/lib/useFetchJson";
import { Filters } from "./Filters";
import { OrderDetail } from "./OrderDetail";
import { OrdersTable, SORT_FIELDS, type SortField } from "./OrdersTable";
import { SummaryCards } from "./SummaryCards";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 350;

// Larger tap target on mobile, compact on desktop.
const pagerButton =
  "rounded-lg px-4 py-2.5 font-medium text-brand-600 ring-1 ring-slate-200 hover:bg-brand-50 active:bg-brand-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent sm:px-3 sm:py-1.5";

export function OrdersDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters live in the URL so a filtered view can be bookmarked or shared.
  const q = searchParams.get("q") ?? "";
  const site = searchParams.get("site") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const sortParam = searchParams.get("sort") as SortField;
  // Default: order number ascending (SO-MOCK-00001 first).
  const sort: SortField = SORT_FIELDS.includes(sortParam) ? sortParam : "SalesId";
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";
  // Order open in the detail panel (?id=SO-MOCK-00001); "order" is taken by sort direction.
  const selectedId = searchParams.get("id") ?? "";

  const [query, setQuery] = useState(q);
  const [reloadKey, setReloadKey] = useState(0);

  function updateParams(updates: Record<string, string | null>, resetPage = true) {
    // Start from the live URL, not this render's searchParams: the debounced search
    // calls this later, and a stale copy would undo filters changed in the meantime.
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Push the search box value to the URL once the user stops typing.
  useEffect(() => {
    if (query.trim() === q) return;
    const timer = setTimeout(() => updateParams({ q: query.trim() || null }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the typed text changes
  }, [query]);

  const apiParams = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    sort,
    order,
  });
  if (q) apiParams.set("q", q);
  if (site) apiParams.set("site", site);
  if (status) apiParams.set("status", status);

  const orders = useFetchJson<OrdersResponse>(`/api/orders?${apiParams}`, reloadKey);
  const meta = useFetchJson<MetaResponse>("/api/orders/meta");

  const result = orders.data;
  const hasFilters = Boolean(q || site || status);

  // A page past the end (e.g. ?page=999 typed into the URL) comes back empty;
  // jump to the last real page instead of showing a blank table.
  const pastLastPage = Boolean(result && !orders.loading && result.total > 0 && result.page > result.totalPages);
  useEffect(() => {
    if (pastLastPage && result) updateParams({ page: String(result.totalPages) }, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to landing past the last page
  }, [pastLastPage]);
  const firstRow = result && result.total > 0 ? (result.page - 1) * result.pageSize + 1 : 0;
  const lastRow = result ? Math.min(result.page * result.pageSize, result.total) : 0;

  function clearFilters() {
    setQuery("");
    updateParams({ q: null, site: null, status: null });
  }

  // Same field again flips direction; a new field starts descending.
  function handleSort(field: SortField) {
    const nextOrder = field === sort ? (order === "desc" ? "asc" : "desc") : "desc";
    updateParams({ sort: field, order: nextOrder });
  }

  return (
    <div className="space-y-6">
      <section aria-label="Order summary">
        <SummaryCards
          summary={result?.summary}
          activeStatus={status}
          onSelectStatus={(value) => updateParams({ status: value || null })}
        />
      </section>

      <section aria-label="Orders" className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-brand-100">
        <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-lg font-semibold text-brand-900">Sales orders</h2>
            {result && !orders.error && (
              <p className="text-sm text-slate-500">
                {hasFilters
                  ? `${formatNumber(result.total)} of ${formatNumber(result.summary.total_orders)} orders match your filters`
                  : `${formatNumber(result.total)} orders`}
              </p>
            )}
          </div>
          <Filters
            query={query}
            site={site}
            status={status}
            sites={meta.data?.facets.sites ?? []}
            statuses={meta.data?.facets.statuses ?? []}
            onQueryChange={setQuery}
            onSiteChange={(value) => updateParams({ site: value || null })}
            onStatusChange={(value) => updateParams({ status: value || null })}
            onClear={clearFilters}
          />
          {meta.error && (
            <p className="text-xs text-rose-600">Couldn&apos;t load branch and status options: {meta.error}</p>
          )}
        </div>

        {orders.error ? (
          <div role="alert" className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="font-medium text-slate-800">Couldn&apos;t load sales orders</p>
            <p className="text-sm text-slate-500">{orders.error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Try again
            </button>
          </div>
        ) : result && result.total === 0 && !orders.loading ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <p className="font-medium text-slate-800">No orders match your filters</p>
            <p className="text-sm text-slate-500">Try a different search term, branch or status.</p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 rounded-lg px-4 py-2 text-sm font-medium text-brand-600 ring-1 ring-brand-200 hover:bg-brand-50"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <OrdersTable
              orders={result?.data}
              loading={orders.loading}
              sort={sort}
              order={order}
              pageSize={PAGE_SIZE}
              selectedId={selectedId}
              onSort={handleSort}
              onSelect={(id) => updateParams({ id }, false)}
            />
            {result && (
              <div className="flex flex-col items-center gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-5">
                <p>
                  Showing {formatNumber(firstRow)}–{formatNumber(lastRow)} of {formatNumber(result.total)}
                </p>
                <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
                  <button
                    type="button"
                    disabled={result.page <= 1 || orders.loading}
                    onClick={() => updateParams({ page: String(result.page - 1) }, false)}
                    className={pagerButton}
                  >
                    Previous
                  </button>
                  <span className="whitespace-nowrap px-2">
                    Page {result.page} of {Math.max(result.totalPages, 1)}
                  </span>
                  <button
                    type="button"
                    disabled={result.page >= result.totalPages || orders.loading}
                    onClick={() => updateParams({ page: String(result.page + 1) }, false)}
                    className={pagerButton}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {selectedId && <OrderDetail salesId={selectedId} onClose={() => updateParams({ id: null }, false)} />}
    </div>
  );
}

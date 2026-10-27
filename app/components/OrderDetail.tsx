"use client";

import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { SalesOrder } from "@/lib/types";
import { useFetchJson } from "@/lib/useFetchJson";
import { StatusBadge } from "./StatusBadge";

interface OrderDetailProps {
  salesId: string;
  onClose: () => void;
}

// Centered popup showing every field of one order, loaded from /api/orders/{id}.
export function OrderDetail({ salesId, onClose }: OrderDetailProps) {
  const [reloadKey, setReloadKey] = useState(0);
  const { data, error, loading } = useFetchJson<SalesOrder>(
    `/api/orders/${encodeURIComponent(salesId)}`,
    reloadKey,
  );
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close on Esc, and move focus into the panel when it opens.
  const onEscape = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  });
  useEffect(() => {
    closeRef.current?.focus();
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  // The hook keeps the previous order while loading the next one; don't show it.
  const order = !loading && data?.SalesId.toLowerCase() === salesId.toLowerCase() ? data : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        className="relative flex max-h-[88vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 bg-brand-800 px-6 py-5 text-white">
          <div>
            <p className="text-xs uppercase tracking-wider text-brand-200">Sales order</p>
            <h2 id="order-detail-title" className="mt-0.5 font-mono text-xl font-semibold">
              {salesId}
            </h2>
            {order && <p className="mt-1 text-sm text-brand-100">{order.SalesName}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="rounded-lg p-1.5 text-brand-100 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/60 px-6 py-5">
          {error ? (
            <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="font-medium text-slate-800">
                {error === "Not found" ? "Order not found" : "Couldn't load this order"}
              </p>
              <p className="text-sm text-slate-500">
                {error === "Not found" ? `No sales order with ID ${salesId}.` : error}
              </p>
              {error !== "Not found" && (
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Try again
                </button>
              )}
            </div>
          ) : order ? (
            <OrderBody order={order} />
          ) : (
            <DetailSkeleton />
          )}
        </div>
      </div>
    </div>
  );
}

function OrderBody({ order }: { order: SalesOrder }) {
  const stopped = order.MCROrderStopped === "Yes";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={order.SalesStatus} />
        {stopped && (
          <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-medium text-white">Order stopped</span>
        )}
        <span className="text-sm text-slate-500">Created {formatDateTime(order.CreatedDateTime1)}</span>
      </div>

      {/* Amounts */}
      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-brand-100">
        <div className="grid grid-cols-3 gap-4">
          <Amount label="Order total" value={order.HAR_TotalSOAmount} strong />
          <Amount label="Invoiced" value={order.HAR_InvoicedAmount} />
          <Amount label="Balance" value={order.HAR_BalanceAmount} />
        </div>
        <div className="mt-3 border-t border-slate-100 pt-3">
          {/* Amount billed so far, not payment: the API has no payment data. */}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-5">
        <Section title="Order">
          <Field label="Document status">{order.DocumentStatus}</Field>
          <Field label="Validation">{order.DOT_ValidationStatus}</Field>
          <Field label="Release status">{order.ReleaseStatus}</Field>
          <Field label="Sales type">{order.SalesType}</Field>
          <Field label="Item group">{order.DOT_ItemGroupId}</Field>
          <Field label="Sales group">{order.SalesGroup}</Field>
          <Field label="Order stopped">{order.MCROrderStopped}</Field>
          <Field label="Sales taker">{order.SalesTaker}</Field>
        </Section>

        <div className="space-y-5">
          <Section title="Customer">
            <Field label="Name">{order.SalesName}</Field>
            <Field label="Account">{order.CustAccount}</Field>
            <Field label="PO ref">{order.CustomerRef}</Field>
            <Field label="PO form">{order.PurchOrderFormNum}</Field>
          </Section>

          <Section title="Timeline">
            <Field label="Created">{formatDateTime(order.CreatedDateTime1)}</Field>
            <Field label="Last modified">{formatDateTime(order.ModifiedDateTime1)}</Field>
          </Section>
        </div>

        <Section title="Branch & delivery">
          <Field label="Branch / site">{order.InventSiteId}</Field>
          <Field label="Sales district">{order.SalesDistrictDescription}</Field>
          <Field label="Delivery district">
            {order.HAR_DeliveryDistrictDescription}
            <span className="ml-1 font-normal text-slate-400">({order.HAR_SalesDeliveryDistrictId})</span>
          </Field>
          <Field label="Ship date">{formatDate(order.ShippingDateRequested)}</Field>
        </Section>

        <Section title="Notes">
          <Field label="SO notes">{order.DOT_SONotes}</Field>
          <Field label="SFA notes">{order.DOT_SFANotes}</Field>
        </Section>
      </div>
    </div>
  );
}

function Amount({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-0.5 tabular-nums text-brand-900 ${strong ? "text-lg font-semibold" : "font-medium"}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

// A white card with a coloured title bar and one label/value row per field.
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-brand-100">
      <h3 className="border-b border-brand-100 bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
        {title}
      </h3>
      <dl className="divide-y divide-slate-100">{children}</dl>
    </section>
  );
}

// Label (muted, with colon) on the left; value (dark, bold) on the right.
function Field({ label, children }: { label: string; children: ReactNode }) {
  const empty = children === null || children === undefined || children === "";
  return (
    <div className="grid grid-cols-[120px_1fr] items-baseline gap-3 px-4 py-2">
      <dt className="text-xs font-medium text-slate-500">{label}:</dt>
      <dd className={`text-sm ${empty ? "text-slate-300" : "font-semibold text-slate-900"}`}>{empty ? "—" : children}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading order">
      <div className="h-6 w-48 animate-pulse rounded bg-slate-200/70" />
      <div className="h-28 animate-pulse rounded-xl bg-white ring-1 ring-brand-100" />
      <div className="grid grid-cols-2 gap-5">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl bg-white ring-1 ring-brand-100" />
        ))}
      </div>
    </div>
  );
}

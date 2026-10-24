import { formatCurrency, formatNumber } from "@/lib/format";
import type { OrdersSummary } from "@/lib/types";

interface Card {
  label: string;
  value: string;
  note: string;
  accent: string;
}

function buildCards(s: OrdersSummary): Card[] {
  return [
    {
      label: "Total orders",
      value: formatNumber(s.total_orders),
      note: "All branches",
      accent: "bg-brand-600",
    },
    {
      label: "Open / pending",
      value: formatNumber(s.open_orders),
      note: "Awaiting fulfilment",
      accent: "bg-amber-500",
    },
    {
      label: "Completed",
      value: formatNumber(s.invoiced_orders + s.delivered_orders),
      note: `${formatNumber(s.invoiced_orders)} invoiced · ${formatNumber(s.delivered_orders)} delivered`,
      accent: "bg-emerald-500",
    },
    {
      label: "Cancelled",
      value: formatNumber(s.cancelled_orders),
      note: "Not fulfilled",
      accent: "bg-rose-500",
    },
    {
      label: "Total order value",
      value: formatCurrency(s.total_order_value),
      note: "Sum of all orders",
      accent: "bg-brand-900",
    },
  ];
}

export function SummaryCards({ summary }: { summary?: OrdersSummary }) {
  if (!summary) {
    return (
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-[116px] animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-brand-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-4">
      {buildCards(summary).map((card) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-brand-100"
        >
          <span className={`absolute inset-x-0 top-0 h-1 ${card.accent}`} />
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">{card.value}</p>
          <p className="mt-1 truncate text-xs text-slate-400">{card.note}</p>
        </div>
      ))}
    </div>
  );
}

// Shared helpers for tests. No test ever calls the real mock API.

import type { OrdersSummary, SalesOrder } from "@/lib/types";

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const summary: OrdersSummary = {
  total_orders: 1200,
  filtered_orders: 1200,
  open_orders: 420,
  invoiced_orders: 360,
  delivered_orders: 300,
  cancelled_orders: 120,
  total_order_value: 998244.3,
};

export function makeOrder(overrides: Partial<SalesOrder> = {}): SalesOrder {
  return {
    SalesId: "SO-MOCK-00001",
    SalesName: "Siti Mart Sdn Bhd",
    CustAccount: "C10001",
    InventSiteId: "B20",
    SalesStatus: "Open order",
    CreatedDateTime1: "2026-09-30T03:07:00.000Z",
    ShippingDateRequested: "2026-10-01",
    HAR_TotalSOAmount: 162.35,
    HAR_InvoicedAmount: 0,
    HAR_BalanceAmount: 162.35,
    SalesTaker: "Aisha Noor",
    CustomerRef: "PO-2026001",
    SalesDistrictDescription: "Lahad Datu",
    DocumentStatus: "Confirmed",
    SalesType: "Sales",
    DOT_ItemGroupId: "FG-HOME",
    SalesGroup: "SG-NORTH",
    DOT_ValidationStatus: "Validated",
    ModifiedDateTime1: "2026-09-30T03:07:00.000Z",
    ReleaseStatus: "Open",
    MCROrderStopped: "No",
    PurchOrderFormNum: "POF-1",
    DOT_SONotes: null,
    DOT_SFANotes: null,
    HAR_SalesDeliveryDistrictId: "DD-B20",
    HAR_DeliveryDistrictDescription: "Sandakan",
    ...overrides,
  };
}

// Shape of the upstream list response, including fields our API layer should strip.
export function upstreamList(data: SalesOrder[] = [makeOrder()]) {
  return {
    summary,
    page: 1,
    pageSize: 25,
    total: data.length,
    totalPages: 1,
    sort: "SalesId",
    order: "asc",
    data,
    links: { self: "https://hiring.harrisons.my/api/mock/sales-orders?page=1" },
  };
}

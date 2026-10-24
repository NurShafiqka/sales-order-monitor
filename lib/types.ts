// Shapes returned by the mock sales-orders API.

export type SalesStatus = "Open order" | "Invoiced" | "Delivered" | "Cancelled";

export interface SalesOrder {
  SalesId: string;
  SalesName: string;
  CustAccount: string;
  InventSiteId: string;
  SalesStatus: SalesStatus;
  CreatedDateTime1: string;
  ShippingDateRequested: string;
  HAR_TotalSOAmount: number;
  HAR_InvoicedAmount: number;
  HAR_BalanceAmount: number;
  SalesTaker: string;
  CustomerRef: string;
  SalesDistrictDescription: string;
  DocumentStatus: string;
  SalesType: string;
}

export interface OrdersSummary {
  total_orders: number;
  filtered_orders: number;
  open_orders: number;
  invoiced_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_order_value: number;
}

export interface OrdersResponse {
  summary: OrdersSummary;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  sort: string;
  order: "asc" | "desc";
  data: SalesOrder[];
}

export interface Facet {
  value: string;
  count: number;
}

export interface MetaResponse {
  facets: {
    statuses: Facet[];
    sites: Facet[];
  };
}

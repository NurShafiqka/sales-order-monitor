// Server-side client for the mock sales-orders API.
// Only imported by route handlers, so API_KEY never reaches the browser.

import type { MetaResponse, OrdersResponse, SalesOrder } from "./types";

const TIMEOUT_MS = 10_000;

// Query params we pass through to the upstream API; anything else is dropped.
const ALLOWED_PARAMS = ["page", "pageSize", "status", "site", "q", "sort", "order"];

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function getConfig() {
  const baseUrl = process.env.API_BASE_URL;
  const apiKey = process.env.API_KEY;
  if (!baseUrl || !apiKey) {
    throw new ApiError("Server is missing API_BASE_URL or API_KEY", 500);
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

async function request<T>(path: string, params?: URLSearchParams): Promise<T> {
  const { baseUrl, apiKey } = getConfig();
  const url = new URL(baseUrl + path);

  if (params) {
    for (const key of ALLOWED_PARAMS) {
      const value = params.get(key)?.trim();
      if (value) url.searchParams.set(key, value);
    }
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "x-assessment-key": apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    throw new ApiError(
      timedOut ? "Sales order service timed out" : "Could not reach sales order service",
      504,
    );
  }

  if (res.status === 404) throw new ApiError("Not found", 404);
  if (!res.ok) {
    throw new ApiError(`Sales order service returned ${res.status}`, 502);
  }

  return res.json() as Promise<T>;
}

// Each function returns only the fields the UI needs, so upstream URLs and
// the key hint in /meta are not passed on to the browser.

export async function getOrders(params: URLSearchParams): Promise<OrdersResponse> {
  const { summary, page, pageSize, total, totalPages, sort, order, data } =
    await request<OrdersResponse>("", params);
  return { summary, page, pageSize, total, totalPages, sort, order, data };
}

export async function getOrder(salesId: string): Promise<SalesOrder> {
  const res = await request<{ data: SalesOrder }>(`/${encodeURIComponent(salesId)}`);
  return res.data;
}

export async function getMeta(): Promise<MetaResponse> {
  const { facets } = await request<MetaResponse>("/meta");
  return { facets: { statuses: facets.statuses, sites: facets.sites } };
}

// Turns any thrown error into a JSON response for route handlers.
export function errorResponse(err: unknown) {
  if (err instanceof ApiError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return Response.json({ error: "Unexpected server error" }, { status: 500 });
}

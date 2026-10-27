import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse, makeOrder, upstreamList } from "@/test/helpers";
import { ApiError, errorResponse, getMeta, getOrder, getOrders } from "./api";

const BASE = "https://example.test/api/mock/sales-orders";
const KEY = "test-key";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("API_BASE_URL", BASE);
  vi.stubEnv("API_KEY", KEY);
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

// URL and headers of the n-th upstream call.
function call(n = 0) {
  const [input, init] = fetchMock.mock.calls[n];
  return { url: new URL(String(input)), headers: new Headers(init?.headers) };
}

describe("getOrders", () => {
  it("sends the API key header to the upstream API", async () => {
    fetchMock.mockResolvedValue(jsonResponse(upstreamList()));
    await getOrders(new URLSearchParams());

    const { url, headers } = call();
    expect(url.origin + url.pathname).toBe(BASE);
    expect(headers.get("x-assessment-key")).toBe(KEY);
  });

  it("passes allowed params through and drops unknown or empty ones", async () => {
    fetchMock.mockResolvedValue(jsonResponse(upstreamList()));
    await getOrders(
      new URLSearchParams({
        page: "2",
        pageSize: "25",
        status: "Open order",
        site: "B20",
        q: "  Siti  ",
        sort: "SalesId",
        order: "desc",
        evil: "1",
        apiKey: "steal",
      }),
    );

    const params = Object.fromEntries(call().url.searchParams);
    expect(params).toEqual({
      page: "2",
      pageSize: "25",
      status: "Open order",
      site: "B20",
      q: "Siti",
      sort: "SalesId",
      order: "desc",
    });
  });

  it("returns the list without upstream-only fields like links", async () => {
    fetchMock.mockResolvedValue(jsonResponse(upstreamList()));
    const result = await getOrders(new URLSearchParams());

    expect(result).not.toHaveProperty("links");
    expect(result.summary.total_orders).toBe(1200);
    expect(result.data[0].SalesId).toBe("SO-MOCK-00001");
  });
});

describe("getOrder", () => {
  it("unwraps the { data } envelope and encodes the id", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: makeOrder({ SalesId: "SO-MOCK-00007" }) }));
    const order = await getOrder("SO MOCK/7");

    expect(order.SalesId).toBe("SO-MOCK-00007");
    expect(call().url.pathname).toBe("/api/mock/sales-orders/SO%20MOCK%2F7");
  });
});

describe("getMeta", () => {
  it("returns only the facets, so the key hint never reaches the browser", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        name: "mock",
        auth: { header: "x-assessment-key", keyHint: KEY },
        facets: { statuses: [{ value: "Cancelled", count: 120 }], sites: [{ value: "B20", count: 150 }] },
        samples: [],
      }),
    );
    const meta = await getMeta();

    expect(meta).toEqual({
      facets: { statuses: [{ value: "Cancelled", count: 120 }], sites: [{ value: "B20", count: 150 }] },
    });
    expect(JSON.stringify(meta)).not.toContain(KEY);
  });
});

describe("error handling", () => {
  it("maps upstream 404 to ApiError 404", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "nope" }, 404));
    await expect(getOrder("SO-NOPE")).rejects.toMatchObject({ status: 404, message: "Not found" });
  });

  it("maps other upstream failures to 502", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 500));
    await expect(getOrders(new URLSearchParams())).rejects.toMatchObject({ status: 502 });
  });

  it("maps network failures to 504", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    await expect(getOrders(new URLSearchParams())).rejects.toMatchObject({
      status: 504,
      message: "Could not reach sales order service",
    });
  });

  it("maps timeouts to 504 with a timeout message", async () => {
    fetchMock.mockRejectedValue(new DOMException("timed out", "TimeoutError"));
    await expect(getOrders(new URLSearchParams())).rejects.toMatchObject({
      status: 504,
      message: "Sales order service timed out",
    });
  });

  it("fails with 500 and never calls upstream when env vars are missing", async () => {
    vi.stubEnv("API_KEY", "");
    await expect(getOrders(new URLSearchParams())).rejects.toMatchObject({ status: 500 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("errorResponse", () => {
  it("turns an ApiError into a JSON response with its status", async () => {
    const res = errorResponse(new ApiError("Not found", 404));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found" });
  });

  it("hides unexpected errors behind a generic 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = errorResponse(new Error("secret internals"));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Unexpected server error" });
  });
});

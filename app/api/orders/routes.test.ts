// End-to-end tests of our route handlers with a fake upstream API.

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse, makeOrder, upstreamList } from "@/test/helpers";
import { GET as getOrderRoute } from "./[id]/route";
import { GET as getMetaRoute } from "./meta/route";
import { GET as getOrdersRoute } from "./route";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("API_BASE_URL", "https://example.test/api/mock/sales-orders");
  vi.stubEnv("API_KEY", "test-key");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/orders", () => {
  it("returns the order list as JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse(upstreamList()));
    const res = await getOrdersRoute(new NextRequest("http://localhost/api/orders?site=B20&evil=1"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body).not.toHaveProperty("links");

    const upstreamUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(upstreamUrl.searchParams.get("site")).toBe("B20");
    expect(upstreamUrl.searchParams.has("evil")).toBe(false);
  });

  it("returns a JSON error (not a crash) when upstream fails", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 503));
    const res = await getOrdersRoute(new NextRequest("http://localhost/api/orders"));

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "Sales order service returned 503" });
  });

  it("never includes the API key in the response", async () => {
    fetchMock.mockResolvedValue(jsonResponse(upstreamList()));
    const res = await getOrdersRoute(new NextRequest("http://localhost/api/orders"));
    expect(await res.text()).not.toContain("test-key");
  });
});

describe("GET /api/orders/[id]", () => {
  const ctx = (id: string) => ({ params: Promise.resolve({ id }) }) as RouteContext<"/api/orders/[id]">;

  it("returns a single order", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: makeOrder({ SalesId: "SO-MOCK-00007" }) }));
    const res = await getOrderRoute(new NextRequest("http://localhost/api/orders/SO-MOCK-00007"), ctx("SO-MOCK-00007"));

    expect(res.status).toBe(200);
    expect((await res.json()).SalesId).toBe("SO-MOCK-00007");
  });

  it("returns 404 for an unknown order", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "not found" }, 404));
    const res = await getOrderRoute(new NextRequest("http://localhost/api/orders/NOPE"), ctx("NOPE"));

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found" });
  });
});

describe("GET /api/orders/meta", () => {
  it("returns only facets", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ auth: { keyHint: "test-key" }, facets: { statuses: [], sites: [{ value: "B20", count: 150 }] } }),
    );
    const res = await getMetaRoute();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ facets: { statuses: [], sites: [{ value: "B20", count: 150 }] } });
  });
});

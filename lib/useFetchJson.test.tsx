// @vitest-environment jsdom

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "@/test/helpers";
import { useFetchJson } from "./useFetchJson";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => vi.unstubAllGlobals());

describe("useFetchJson", () => {
  it("is loading first, then returns the data", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: 1 }));
    const { result } = renderHook(() => useFetchJson<{ ok: number }>("/api/x"));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ ok: 1 });
    expect(result.current.error).toBeUndefined();
  });

  it("exposes the server's error message", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "Sales order service timed out" }, 504));
    const { result } = renderHook(() => useFetchJson("/api/x"));

    await waitFor(() => expect(result.current.error).toBe("Sales order service timed out"));
    expect(result.current.loading).toBe(false);
  });

  it("ignores a slow, outdated response when the URL changes", async () => {
    // First request (old filter) hangs until aborted; second (new filter) answers immediately.
    fetchMock.mockImplementation((input, init) => {
      if (String(input) === "/api/orders?site=A10") {
        return new Promise((_, reject) =>
          init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))),
        );
      }
      return Promise.resolve(jsonResponse({ site: "B20" }));
    });

    const { result, rerender } = renderHook(({ url }) => useFetchJson<{ site: string }>(url), {
      initialProps: { url: "/api/orders?site=A10" },
    });
    rerender({ url: "/api/orders?site=B20" });

    await waitFor(() => expect(result.current.data).toEqual({ site: "B20" }));
    expect(result.current.error).toBeUndefined();
    // The first request was cancelled, not left to overwrite the newer result.
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  it("refetches when reloadKey changes (Try again button)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "down" }, 502));
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: 1 }));
    const { result, rerender } = renderHook(({ key }) => useFetchJson("/api/x", key), {
      initialProps: { key: 0 },
    });

    await waitFor(() => expect(result.current.error).toBe("down"));
    rerender({ key: 1 });
    await waitFor(() => expect(result.current.data).toEqual({ ok: 1 }));
    expect(result.current.error).toBeUndefined();
  });
});

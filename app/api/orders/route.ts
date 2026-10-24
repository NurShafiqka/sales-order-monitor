import type { NextRequest } from "next/server";
import { errorResponse, getOrders } from "@/lib/api";

// GET /api/orders?page=1&pageSize=25&status=...&site=...&q=...&sort=...&order=...
export async function GET(request: NextRequest) {
  // Read outside the try: during build Next.js throws here to mark the route
  // as dynamic, and that signal must not be caught by our error handler.
  const params = request.nextUrl.searchParams;
  try {
    const data = await getOrders(params);
    return Response.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

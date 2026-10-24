import type { NextRequest } from "next/server";
import { errorResponse, getOrders } from "@/lib/api";

// GET /api/orders?page=1&pageSize=25&status=...&site=...&q=...&sort=...&order=...
export async function GET(request: NextRequest) {
  try {
    const data = await getOrders(request.nextUrl.searchParams);
    return Response.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

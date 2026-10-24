import type { NextRequest } from "next/server";
import { errorResponse, getOrder } from "@/lib/api";

// GET /api/orders/SO-MOCK-00001
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  try {
    const { id } = await ctx.params;
    const data = await getOrder(id);
    return Response.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

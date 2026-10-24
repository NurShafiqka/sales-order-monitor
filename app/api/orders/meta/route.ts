import { errorResponse, getMeta } from "@/lib/api";

// GET /api/orders/meta — available statuses and sites for the filter dropdowns.
export async function GET() {
  try {
    const data = await getMeta();
    return Response.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

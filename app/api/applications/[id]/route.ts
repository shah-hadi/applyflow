import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { applications } from "../../../../db/schema";
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const numericId = Number((await context.params).id);
  if (!Number.isInteger(numericId)) return Response.json({ error: "Invalid application ID" }, { status: 400 });
  try { await getDb().delete(applications).where(eq(applications.id, numericId)); return new Response(null, { status: 204 }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Unable to delete application" }, { status: 500 }); }
}

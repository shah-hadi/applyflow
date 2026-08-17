import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { applications } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser(); if (!user) return Response.json({ error: "Unauthenticated" }, { status: 401 });
  const id = Number((await context.params).id); const body = await request.json() as Record<string, string>;
  const [application] = await getDb().update(applications).set({ ...body, updatedAt: new Date().toISOString() }).where(and(eq(applications.id, id), eq(applications.ownerId, user.userId))).returning();
  if (!application) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ application });
}
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getChatGPTUser(); if (!user) return Response.json({ error: "Unauthenticated" }, { status: 401 });
  const id = Number((await context.params).id);
  await getDb().delete(applications).where(and(eq(applications.id, id), eq(applications.ownerId, user.userId)));
  return new Response(null, { status: 204 });
}

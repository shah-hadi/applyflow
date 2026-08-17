import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { applications } from "../../../db/schema";
export async function GET() {
  try { return Response.json({ applications: await getDb().select().from(applications).orderBy(desc(applications.createdAt), desc(applications.id)) }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Unable to load applications" }, { status: 500 }); }
}
export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, string>;
    if (!body.company?.trim() || !body.role?.trim()) return Response.json({ error: "Company and role are required" }, { status: 400 });
    const [application] = await getDb().insert(applications).values({ company: body.company.trim(), role: body.role.trim(), stage: body.stage || "Applied", location: body.location?.trim() || "", jobUrl: body.jobUrl?.trim() || "", notes: body.notes?.trim() || "" }).returning();
    return Response.json({ application }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Unable to add application" }, { status: 500 }); }
}

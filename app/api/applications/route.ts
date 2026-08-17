import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { applications } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Unauthenticated" }, { status: 401 });
  const rows = await getDb().select().from(applications).where(eq(applications.ownerId, user.userId)).orderBy(desc(applications.updatedAt));
  return Response.json({ applications: rows });
}
export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Unauthenticated" }, { status: 401 });
  const body = await request.json() as Record<string, string>;
  if (!body.company?.trim() || !body.role?.trim()) return Response.json({ error: "Company and role are required" }, { status: 400 });
  const now = new Date().toISOString();
  const [application] = await getDb().insert(applications).values({
    ownerId: user.userId, company: body.company.trim(), role: body.role.trim(), stage: body.stage || "Applied",
    location: body.location || "", jobUrl: body.jobUrl || "", notes: body.notes || "", salary: body.salary || "",
    source: body.source || "", contact: body.contact || "", interviewDate: body.interviewDate || "",
    deadline: body.deadline || "", nextAction: body.nextAction || "", createdAt: now, updatedAt: now,
  }).returning();
  return Response.json({ application }, { status: 201 });
}

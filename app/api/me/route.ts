import { getChatGPTUser } from "../../chatgpt-auth";
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Unauthenticated" }, { status: 401 });
  return Response.json({ user: { id: user.userId, name: user.fullName || user.email.split("@")[0], email: user.email } });
}

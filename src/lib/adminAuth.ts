import { cookies } from "next/headers";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) return false;

  try {
    const decoded = Buffer.from(session, "base64").toString("utf-8");
    const [password] = decoded.split(":");
    const adminPassword = process.env.ADMIN_PASSWORD;
    return !!(adminPassword && password === adminPassword);
  } catch {
    return false;
  }
}

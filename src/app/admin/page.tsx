/**
 * Admin page.
 *
 * PREVIEW MODE: When ADMIN_PASSWORD is not set, this page is publicly accessible
 * and displays mock request data so the layout can be reviewed online.
 *
 * TO SECURE: Set the ADMIN_PASSWORD environment variable. The page will then
 * redirect unauthenticated visitors to /admin/login.
 *
 * TO CONNECT REAL DATA: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * The dashboard will automatically switch from mock data to live data.
 */
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { AdminDashboard } from "./AdminDashboard";

export const metadata = { title: "Admin — NeedItz" };

export default async function AdminPage() {
  const hasPassword = !!process.env.ADMIN_PASSWORD;

  // Only enforce auth when a password has been configured
  if (hasPassword) {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      redirect("/admin/login");
    }
  }

  const isPreview = !process.env.NEXT_PUBLIC_SUPABASE_URL;
  return <AdminDashboard isPreview={isPreview} />;
}

import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { AdminDashboard } from "./AdminDashboard";

export const metadata = { title: "Admin — NeedItz" };

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
  return <AdminDashboard />;
}

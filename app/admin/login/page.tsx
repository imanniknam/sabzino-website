import { redirect } from "next/navigation";
import { adminExists, canInitializeAdmin, getAdminSession } from "../../../lib/admin-auth";
import AdminLogin from "./AdminLogin";
import "./login.css";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  const exists = await adminExists();
  const canSetup = !exists && await canInitializeAdmin();
  return <AdminLogin mode={canSetup ? "setup" : "login"} unavailable={!exists && !canSetup} />;
}

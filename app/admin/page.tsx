import { requireAdminPage } from "../../lib/admin-auth";
import AdminDashboard from "./AdminDashboard";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdminPage();
  return <AdminDashboard adminName={user.displayName} />;
}

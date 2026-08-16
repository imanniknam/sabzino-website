import { redirect } from "next/navigation";
import { getCustomerIdentity } from "../../lib/customer-auth";
import CustomerAuth from "../customer-auth/CustomerAuth";
import "../customer-auth/customer-auth.css";

export const dynamic = "force-dynamic";
export default async function RegisterPage() {
  if (await getCustomerIdentity()) redirect("/account");
  return <CustomerAuth mode="register"/>;
}

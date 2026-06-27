import AdminPanel from "@/_components/AdminPanel";
import { redirect } from "next/navigation";
import { getCookie } from "../_utils/cookies";

export const dynamic = "force-dynamic";
// or do suspense

const AdminPage = async () => {
  const cookie = await getCookie();

  const adminIdAllowlist = (process.env.ADMIN_ID_ALLOWLIST || "")
    .split(", ")
    .map((string) => Number(string));

  if (
    cookie?.id &&
    adminIdAllowlist &&
    adminIdAllowlist.includes(Number(cookie.id))
  ) {
    return (
      <main>
        <AdminPanel />
      </main>
    );
  } else {
    redirect("/signup");
  }
};

export default AdminPage;

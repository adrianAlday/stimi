import AdminPanel from "@/_components/AdminPanel";
import { redirect } from "next/navigation";
import { getCookie } from "../_utils/cookies";
import { isAdmin } from "../_utils/isAdmin";

export const dynamic = "force-dynamic";

const AdminPage = async () => {
  const cookie = await getCookie();

  if (isAdmin(cookie?.id)) {
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

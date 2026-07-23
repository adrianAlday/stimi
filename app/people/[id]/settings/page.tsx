import SettingsPanel from "@/_components/SettingsPanel";
import { getCookie } from "@/app/_utils/cookies";
import { isAdmin } from "@/app/_utils/isAdmin";
import { Params } from "@/app/_utils/types";
import { decodeParams } from "@/app/_utils/url";
import { redirect } from "next/navigation";

type SettingsPageProps = {
  params: Promise<Params>;
  searchParams: Promise<Params>;
};

const SettingsPage = async ({ params, searchParams }: SettingsPageProps) => {
  const resolvedParams = { ...(await params), ...(await searchParams) };
  const decodedParams = decodeParams(resolvedParams);
  const pathId = decodedParams.id;

  const cookie = await getCookie();
  const cookieId = cookie?.id;
  const userIsAdmin = isAdmin(cookieId);

  if (pathId && cookieId && (Number(pathId) === cookieId || userIsAdmin)) {
    return (
      <main>
        <SettingsPanel pathId={pathId} userIsAdmin={userIsAdmin} />
      </main>
    );
  }

  redirect("/signup");
};

export default SettingsPage;

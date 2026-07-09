import Bars from "@/_components/Bars";
import { getCookie } from "@/app/_utils/cookies";
import { isAdmin } from "@/app/_utils/isAdmin";
import { Params } from "@/app/_utils/types";
import { decodeParams, generateSignupUrl } from "@/app/_utils/url";
import { demoParam } from "@/app/signup/page";
import { DateTime } from "luxon";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const weeksToShow = 106;

type PersonPageProps = {
  params: Promise<Params>;
  searchParams: Promise<Params>;
};

const PersonPage = async ({ params, searchParams }: PersonPageProps) => {
  const resolvedParams = { ...(await params), ...(await searchParams) };
  const decodedParams = decodeParams(resolvedParams);
  const pathId = decodedParams.id;

  const cookie = await getCookie();
  const cookieId = cookie?.id;
  const userIsAdmin = isAdmin(cookieId);

  if (
    !pathId ||
    (pathId !== process.env.NEXT_PUBLIC_DEMO_ID &&
      (!cookieId || (Number(pathId) !== cookieId && !userIsAdmin)))
  ) {
    redirect("/signup");
  }

  const resolvedHeaders = await headers();
  const host = resolvedHeaders.get("host");
  const baseUrl = `http://${host}`;

  const activitesParams = {
    strava_athlete_id: pathId,
    after: userIsAdmin
      ? decodedParams.after || ""
      : DateTime.now()
          .minus({ weeks: weeksToShow + 2 })
          .toISODate(),
  };
  const activitiesQueryString = new URLSearchParams(activitesParams).toString();

  const activitiesResponse = await fetch(
    `${baseUrl}/api/activities?${activitiesQueryString}`,
  ).then(async (response) => await response.json());

  const demoUrl = Object.hasOwn(decodedParams, demoParam)
    ? generateSignupUrl(resolvedHeaders)
    : undefined;

  const { profile } = activitiesResponse.profile.data[0];

  const activities = activitiesResponse.activities.data.map(
    (activity: { [key: string]: string }) =>
      Object.keys(activity).reduce(
        (accumulator, key) => {
          accumulator[
            key
              .replace(/[-_ ]+(.)/g, (_, character) => character.toUpperCase())
              .replace(/^[A-Z]/, (character) => character.toLowerCase())
          ] = activity[key];
          return accumulator;
        },
        {} as { [key: string]: string },
      ),
  );

  return (
    <main>
      <Bars
        pathId={pathId}
        userIsAdmin={userIsAdmin}
        demoUrl={demoUrl}
        profile={profile}
        activities={activities}
      />
    </main>
  );
};

export default PersonPage;

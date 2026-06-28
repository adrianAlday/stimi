import Bars from "@/_components/Bars";
import { getCookie } from "@/app/_utils/cookies";
import { Params } from "@/app/_utils/types";
import { decodeParams } from "@/app/_utils/url";
import { DateTime } from "luxon";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type PersonPageProps = {
  params: Promise<Params>;
};

const PersonPage = async ({ params }: PersonPageProps) => {
  const now = DateTime.now();

  const resolvedParams = await params;
  const decodedParams = decodeParams(resolvedParams);
  const pathId = decodedParams.id;

  const cookie = await getCookie();
  const cookieId = cookie?.id;

  if (!pathId || !cookieId || Number(pathId) !== cookieId) {
    redirect("/signup");
  }

  const resolvedHeaders = await headers();
  const host = resolvedHeaders.get("host");
  const baseUrl = `http://${host}`;

  const activitesParams = {
    strava_athlete_id: `${cookieId}`,
  };
  const activitiesQueryString = new URLSearchParams(activitesParams).toString();

  const activitiesResponse = await fetch(
    `${baseUrl}/api/activities?${activitiesQueryString}`,
  ).then(async (response) => await response.json());

  const activities = activitiesResponse.data.map(
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
      <Bars now={now} activities={activities} />
    </main>
  );
};

export default PersonPage;

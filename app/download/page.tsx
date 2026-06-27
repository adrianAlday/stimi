import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DateTime } from "luxon";
import { getCookie } from "../page";

const DownloadPage = async () => {
  const now = DateTime.now();

  const cookie = await getCookie();

  if (!cookie?.id) {
    redirect("/signup");
  }

  const resolvedHeaders = await headers();
  const host = resolvedHeaders.get("host");
  const baseUrl = `http://${host}`;
  // make baseurlhelper

  const stravaAthleteId = `${cookie.id}`;

  const accessTokenParams = {
    id: stravaAthleteId,
  };
  const accessTokenQueryString = new URLSearchParams(
    accessTokenParams,
  ).toString();
  const accessTokenResponse = await fetch(
    `${baseUrl}/api/access-token?${accessTokenQueryString}`,
  ).then(async (response) => await response.json());

  const targetLookBackDate = now.minus({ months: 25 });

  for (let i = 0; ; i++) {
    const activitesParams = {
      accessToken: accessTokenResponse.access_token,
      page: `${i + 1}`,
    };
    const activitiesQueryString = new URLSearchParams(
      activitesParams,
    ).toString();
    const activitiesResponse = await fetch(
      `${baseUrl}/api/activities?${activitiesQueryString}`,
      {
        method: "POST",
      },
    ).then(async (response) => await response.json());

    if (
      !activitiesResponse.length ||
      DateTime.fromISO(activitiesResponse.reverse()[0].start_date_local) <
        targetLookBackDate
    ) {
      break;
    }
  }

  return <main>{/* render loading thing then redirect */}</main>;
};

export default DownloadPage;

import { cookies, headers } from "next/headers";
import { cookieName, verifyJwt } from "./_utils/cookies";
import { redirect } from "next/navigation";
import Bars from "@/_components/Bars";
import { DateTime } from "luxon";

const getCookie = async () => {
  try {
    const cookieStore = await cookies();

    const cookie = cookieStore.get(cookieName)?.value;

    if (!cookie) {
      return null;
    }

    const payload = await verifyJwt(cookie);

    return payload;
  } catch (error) {
    console.error(error);

    return null;
  }
};

const HomePage = async () => {
  const now = DateTime.now();

  const cookie = await getCookie();

  if (!cookie?.id) {
    redirect("/signup");
  }

  const resolvedHeaders = await headers();
  const host = resolvedHeaders.get("host");
  const baseUrl = `http://${host}`;

  const accessTokenParams = {
    id: `${cookie.id}`,
  };
  const accessTokenQueryString = new URLSearchParams(
    accessTokenParams,
  ).toString();
  const accessTokenResponse = await fetch(
    `${baseUrl}/api/access-token?${accessTokenQueryString}`,
  ).then(async (response) => await response.json());

  const activities = [];

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
    ).then(async (response) => await response.json());

    const activiyKeysToPluck = [
      "sport_type",
      "start_date_local",
      "moving_time",
    ];

    activities.push(
      ...activitiesResponse.map((activity: { [key: string]: string }) =>
        Object.fromEntries(
          activiyKeysToPluck.map((key) => [
            key
              .replace(/[-_ ]+(.)/g, (_, character) => character.toUpperCase())
              .replace(/^[A-Z]/, (character) => character.toLowerCase()),
            activity[key],
          ]),
        ),
      ),
    );

    if (
      !activitiesResponse.length ||
      activitiesResponse
        .reverse()[0]
        .start_date_local.startsWith(`${now.year - 2}-`)
    ) {
      break;
    }
  }

  return (
    <main>
      <div className="w-dvw h-dvh flex justify-center-safe">
        <Bars now={now} activities={activities} />
      </div>
    </main>
  );
};

export default HomePage;

// learn from other apps https://www.strava.com/settings/apps
// loader
// use strava profile pic in corner?
// store activities?
// refresh button?
// make strava auth the callback domain then redirect to stimi
// redirect from signup to main page if has cookie
// add admin mode
// add year label on first week of year
// add x number of weeks?
// skip first week in case its partial?
// figure out exact formula for ramp line
// last column red/green if it meets ramp
// load more button for more pages?
// height dependent on data vs ticks?
// or 280 height, make ticks change to not be crammed?
// day target is time target divided by 90 rounded up?
// month and year dividing lines

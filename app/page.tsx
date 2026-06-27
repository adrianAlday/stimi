import { cookies, headers } from "next/headers";
import { cookieName, verifyJwt } from "./_utils/cookies";
import { redirect } from "next/navigation";
import Bars from "@/_components/Bars";
import { DateTime } from "luxon";

export const getCookie = async () => {
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

  const stravaAthleteId = `${cookie.id}`;

  const activitesParams = {
    strava_athlete_id: stravaAthleteId,
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
// make bars go to that week on strava?
// filter for after a specific date?
// keep only last week from 2 years ago?
// routing so that url goes to specific athlete
// allow user to toggle making page public
// fetch and save data
// refetch on what cadence? one page? webhooks?
// allow admin power
// demo page with my data
// switch goal back to target?
// say `${value}+`
// line opacity 0 at beginning and 1 at recent end?
// scroll snap?
// prevent y overscroll?
// smaller days chart?
// remove mock data
// make home the info and signup page?
// add demo link to home page
// user paths
// allow to make public
// homepage with video background
// move get cookie?

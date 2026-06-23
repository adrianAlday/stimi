import { cookies, headers } from "next/headers";
import { cookieName, verifyJwt } from "./_utils/cookies";
import { redirect } from "next/navigation";
import LogOut from "@/_components/LogOut";
import Bars from "@/_components/Bars";

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

  const activitesParams = {
    accessToken: accessTokenResponse.access_token,
  };
  const activitiesQueryString = new URLSearchParams(activitesParams).toString();
  const activitiesResponse = await fetch(
    `${baseUrl}/api/activities?${activitiesQueryString}`,
  ).then(async (response) => await response.json());

  const activiyKeysToPluck = ["sport_type", "start_date_local", "moving_time"];
  const activities = activitiesResponse.map(
    (activity: { [key: string]: string }) =>
      Object.fromEntries(
        activiyKeysToPluck.map((key) => [
          key
            .replace(/[-_ ]+(.)/g, (_, character) => character.toUpperCase())
            .replace(/^[A-Z]/, (character) => character.toLowerCase()),
          activity[key],
        ]),
      ),
  );

  return (
    <main>
      <Bars activities={activities} />

      <LogOut />
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

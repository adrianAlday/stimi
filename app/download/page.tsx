import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DateTime } from "luxon";
import { getCookie } from "../page";
import { Suspense } from "react";
import Bouncer from "@/_components/Bouncer";
import { JWTPayload } from "jose";

type DataFetchingProps = {
  now: DateTime<true>;
  cookie: JWTPayload;
};
const DataFetching = async ({ now, cookie }: DataFetchingProps) => {
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

  redirect("/");
};

const DownloadPage = async () => {
  const now = DateTime.now();

  const cookie = await getCookie();

  if (!cookie?.id) {
    redirect("/signup");
  }

  //  render loading thing then redirect https://www.google.com/search?q=react+suspense+fallback+with+progress+state

  return (
    <main>
      <Suspense
        fallback={
          <div>
            <Bouncer />

            {
              // more data needed to display on mobile
            }
            <div className="text-[rgb(20,20,20)]">
              There{"'"}s a wise saying that goes like this: A real gentleman
              never discusses women he{"'"}s broken up with or how much tax he
              {"'"}s paid. Actually, this is a total lie. I just made it up.
              Sorry! But if there really were such a saying, I think that one
              more condition for being a gentleman would be keeping quiet about
              what you do to stay healthy. A gentleman shouldn{"'"}t go on and
              on about what he does to stay fit. At least that{"'"}s how I see
              it.
            </div>
          </div>
        }
      >
        <DataFetching now={now} cookie={cookie} />
      </Suspense>
    </main>
  );
};

export default DownloadPage;

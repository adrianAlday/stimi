import { redirect } from "next/navigation";
import { DateTime } from "luxon";
import { Suspense } from "react";
import Bouncer from "@/_components/Bouncer";
import {
  defaultActivitiesPageSize,
  getActivitiesReponse,
} from "@/app/api/activities/route";
import { Params } from "@/app/_utils/types";
import { getCookie } from "@/app/_utils/cookies";
import { decodeParams } from "@/app/_utils/url";
import { isAdmin } from "@/app/_utils/isAdmin";
import { weeksToShow } from "@/app/_utils/data";
import { getAccessTokenResponse } from "@/app/api/access-token/route";

type DataFetchingProps = {
  now: DateTime<true>;
  id: string;
  pageNumber: number;
};
const DataFetching = async ({ now, id, pageNumber }: DataFetchingProps) => {
  const accessTokenResponse = await getAccessTokenResponse(id);

  const rawActivitiesResponse = await getActivitiesReponse({
    accessToken: accessTokenResponse.access_token,
    page: `${pageNumber}`,
  });
  const activitiesResponse = (
    rawActivitiesResponse as unknown as { errors: unknown }
  ).errors
    ? []
    : rawActivitiesResponse;

  redirect(
    `/people/${id}${
      !activitiesResponse.length ||
      DateTime.fromISO(
        activitiesResponse.reverse()[0].start_date_local as string,
      ) < now.minus({ weeks: weeksToShow + 2 })
        ? ""
        : `/download?p=${pageNumber + 1}`
    }`,
  );
};

type DownloadPageProps = {
  params: Promise<Params>;
  searchParams: Promise<Params>;
};

const DownloadPage = async ({ params, searchParams }: DownloadPageProps) => {
  const now = DateTime.now();

  const resolvedParams = { ...(await params), ...(await searchParams) };
  const decodedParams = decodeParams(resolvedParams);
  const pathId = decodedParams.id;

  const cookie = await getCookie();
  const cookieId = cookie?.id;

  if (
    !pathId ||
    !cookieId ||
    (Number(pathId) !== cookieId && !isAdmin(cookieId))
  ) {
    redirect("/signup");
  }

  const pageNumber = Number(decodedParams.p || "1");

  return (
    <main>
      <Bouncer />

      <Suspense
        fallback={
          <div>
            <div
              className={`mt-9 flex justify-center font-semibold animate-pulse`}
            >
              <div>
                Downloading{" "}
                {(pageNumber * defaultActivitiesPageSize).toLocaleString()}{" "}
                activities
              </div>
            </div>

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
        <DataFetching now={now} id={pathId} pageNumber={pageNumber} />
      </Suspense>
    </main>
  );
};

export default DownloadPage;

import { createClient } from "@/app/_utils/supabase/server";
import { withAuth } from "@/app/_utils/withAuth";
import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenResponse } from "../access-token/route";

export const defaultActivitiesPageSize = 200;

const basePath = "https://www.strava.com/api/v3";

type Activity = {
  [key: string]: string | { id: string };
  athlete: { id: string };
};

export const getActivitiesReponse = async (options: {
  [key: string]: string;
}) => {
  const params = {
    before: options.before || "9999999999",
    per_page: options.perPage || `${defaultActivitiesPageSize}`,
    page: options.page || "1",
  };
  const queryString = new URLSearchParams(params).toString();

  return (await fetch(`${basePath}/athlete/activities?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  }).then(async (response) => await response.json())) as Activity[];
};

export const getActivityReponse = async (options: {
  [key: string]: string;
}) => {
  return (await fetch(`${basePath}/activities/${options.activityId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  }).then(async (response) => await response.json())) as Activity;
};

type selectActivitiesProps = {
  strava_athlete_id: string;
  after: string;
};

export const selectActivities = async ({
  strava_athlete_id,
  after,
}: selectActivitiesProps) => {
  const supabase = await createClient();

  const profile = await supabase
    .from("strava_athletes")
    .select("profile")
    .eq("id", strava_athlete_id);

  const activities = await supabase
    .from("strava_activities")
    .select("sport_type, start_date_local, moving_time")
    .eq("strava_athlete_id", strava_athlete_id)
    .gte("start_date_local", after || "2001-01-01");

  return { profile, activities };
};

export const upsertActivities = async (activities: Activity[]) => {
  const supabase = await createClient();

  return await supabase
    .from("strava_activities")
    .upsert(
      activities.map(
        ({ id, athlete, sport_type, start_date_local, moving_time }) => ({
          id,
          strava_athlete_id: athlete.id,
          sport_type,
          start_date_local,
          moving_time,
        }),
      ),
      { onConflict: "id" },
    )
    .select();
};

export const deleteActivity = async (activityId: string) => {
  const supabase = await createClient();

  return await supabase.from("strava_activities").delete().eq("id", activityId);
};

export const POST = withAuth(
  async (request: NextRequest) => {
    const { id, page } = await request.json();

    const accessTokenResponse = await getAccessTokenResponse(id);

    const rawActivitiesResponse = await getActivitiesReponse({
      accessToken: accessTokenResponse.access_token,
      page,
    });
    const activitiesResponse = (
      rawActivitiesResponse as unknown as { errors: unknown }
    ).errors
      ? []
      : rawActivitiesResponse;

    return NextResponse.json({
      get: activitiesResponse,
      upsert: await upsertActivities(activitiesResponse),
    });
  },
  { matchableParamKeys: ["id"] },
);

export const GET = withAuth(
  async (request: NextRequest) => {
    return NextResponse.json(
      await selectActivities(
        Object.fromEntries(
          request.nextUrl.searchParams.entries(),
        ) as selectActivitiesProps,
      ),
    );
  },
  { matchableParamKeys: ["strava_athlete_id"] },
);

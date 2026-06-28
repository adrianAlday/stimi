import { createClient } from "@/app/_utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

const selectActivities = async (stravaAthleteId: string) => {
  const supabase = await createClient();

  return await supabase
    .from("strava_activities")
    .select("sport_type, start_date_local, moving_time")
    .eq("strava_athlete_id", stravaAthleteId);
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

export const POST = async (request: NextRequest) => {
  const activitiesResponse = await getActivitiesReponse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  return NextResponse.json({
    get: activitiesResponse,
    upsert: await upsertActivities(activitiesResponse),
  });
};

export const GET = async (request: NextRequest) => {
  return NextResponse.json(
    await selectActivities(
      Object.fromEntries(request.nextUrl.searchParams.entries())
        .strava_athlete_id,
    ),
  );
};

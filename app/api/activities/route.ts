import { createClient } from "@/app/_utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  // get access token here?
  // change to use body insead of query

  const path = "https://www.strava.com/api/v3/athlete/activities";

  const searchParamsObject = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  );
  const params = {
    before: searchParamsObject.before || "9999999999",
    per_page: searchParamsObject.perPage || "200",
    page: searchParamsObject.page || "1",
  };
  const queryString = new URLSearchParams(params).toString();

  const activitiesResponse = (await fetch(`${path}?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${searchParamsObject.accessToken}`,
    },
  }).then(async (response) => await response.json())) as {
    [key: string]: string | { id: string };
    athlete: { id: string };
  }[];

  const supabase = await createClient();

  const upsertResponse = await supabase
    .from("strava_activities")
    .upsert(
      activitiesResponse.map(
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

  return NextResponse.json(activitiesResponse);
};

export const GET = async (request: NextRequest) => {
  const supabase = await createClient();

  const selectResponse = await supabase
    .from("strava_activities")
    .select("sport_type, start_date_local, moving_time")
    .eq(
      "strava_athlete_id",
      Object.fromEntries(request.nextUrl.searchParams.entries())
        .strava_athlete_id,
    );

  return NextResponse.json(selectResponse);
};

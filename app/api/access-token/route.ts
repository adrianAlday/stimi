import { createClient } from "@/app/_utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const getRefreshTokenResponse = async (id: string) => {
  const supabase = await createClient();

  const refreshTokenResponse = await supabase
    .from("strava_athletes")
    .select("refresh_token")
    .eq("id", id);

  return refreshTokenResponse;
};

export const getAccessTokenResponse = async (id: string) => {
  const refreshTokenResponse = await getRefreshTokenResponse(id);

  if (refreshTokenResponse.success) {
    return await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: Number(process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID),
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshTokenResponse.data[0].refresh_token,
      }),
    }).then(async (response) => await response.json());
  }
};

export const GET = async (request: NextRequest) =>
  NextResponse.json(
    await getAccessTokenResponse(
      Object.fromEntries(request.nextUrl.searchParams.entries()).id,
    ),
  );

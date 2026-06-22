import { createClient } from "@/app/_utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const supabase = await createClient();

  const selectResponse = await supabase
    .from("strava_refresh_tokens")
    .select("refresh_token")
    .eq("id", Object.fromEntries(request.nextUrl.searchParams.entries()).id);

  if (selectResponse.success) {
    const refreshTokenResponse = await fetch(
      "https://www.strava.com/api/v3/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: Number(process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID),
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: selectResponse.data[0].refresh_token,
        }),
      },
    ).then(async (response) => await response.json());

    return NextResponse.json(refreshTokenResponse);
  }
};

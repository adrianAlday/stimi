import { cookieName } from "@/app/_utils/cookieName";
import { signJwt } from "@/app/_utils/cookies";
import { createClient } from "@/app/_utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const { code, scope } = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  );

  if (!code || !scope.includes("activity:read")) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  const authorizationCodeResponse = await fetch(
    "https://www.strava.com/api/v3/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: Number(process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID),
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
      }),
    },
  ).then(async (response) => await response.json());

  const {
    athlete: { id, profile, firstname, lastname },
    refresh_token,
  } = authorizationCodeResponse;

  const supabase = await createClient();

  const upsertResponse = await supabase.from("strava_athletes").upsert(
    {
      id,
      scope,
      refresh_token,
      profile: profile === "avatar/athlete/large.png" ? null : profile,
      name: `${firstname} ${lastname}`,
    },
    { onConflict: "id" },
  );

  if (upsertResponse.success) {
    const cookieData = { id };

    const token = await signJwt(cookieData);

    const cookieStore = await cookies();

    await cookieStore.set(cookieName, token, {
      path: "/",
      sameSite: "none",
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 400,
    });

    return NextResponse.redirect(
      new URL(`/people/${id}/download`, request.url),
    );
  }
};

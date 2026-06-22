import { signJwt } from "@/app/_utils/jwt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const searchParamsObject = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  );

  // console.log("searchParamsObject", searchParamsObject);

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
        code: searchParamsObject.code,
      }),
    },
  ).then(async (response) => await response.json());

  console.log("authorizationCodeResponse", authorizationCodeResponse);

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
        refresh_token: authorizationCodeResponse.refresh_token,
      }),
    },
  ).then(async (response) => await response.json());

  console.log("refreshTokenResponse", refreshTokenResponse);

  // store tokens in db

  const { athlete } = authorizationCodeResponse;
  const { id } = athlete;
  const cookieData = { id };

  const token = await signJwt(cookieData);

  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.redirect(new URL("/", request.url));
};

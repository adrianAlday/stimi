import { getCookie, signJwt } from "@/app/_utils/cookies";
import { isAdmin } from "@/app/_utils/isAdmin";
import { Params } from "@/app/_utils/types";
import { decodeParams } from "@/app/_utils/url";
import { NextRequest, NextResponse } from "next/server";
import {
  getAccessTokenResponse,
  getRefreshTokenResponse,
} from "../../access-token/route";
import { createClient } from "@/app/_utils/supabase/server";
import { cookies } from "next/headers";
import { cookieName } from "@/app/_utils/cookieName";
import { withAuth } from "@/app/_utils/withAuth";

export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<Params> },
) => {
  const resolvedParams = await params;
  const decodedParams = decodeParams(resolvedParams);
  const pathId = decodedParams.id;

  const cookie = await getCookie();
  const cookieId = cookie?.id;
  const userIsAdmin = isAdmin(cookieId);

  if (!pathId || !cookieId || (Number(pathId) !== cookieId && !userIsAdmin)) {
    return NextResponse.json(null, { status: 500 });
  }

  const refreshTokenResponse = await getRefreshTokenResponse(pathId);

  if (refreshTokenResponse.success) {
    const revokeResponse = await fetch("https://www.strava.com/oauth/revoke", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}:${process.env.STRAVA_CLIENT_SECRET}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token: refreshTokenResponse.data[0].refresh_token,
      }),
    });

    if (revokeResponse.ok) {
      const supabase = await createClient();

      const deleteAthleteResponse = await supabase
        .from("strava_athletes")
        .delete()
        .eq("id", pathId);

      if (deleteAthleteResponse.success) {
        const cookieData = { id: "" };

        const token = await signJwt(cookieData);

        const cookieStore = await cookies();

        cookieStore.set(cookieName, token, {
          httpOnly: false,
          path: "/",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 400,
        });

        return new Response(null, { status: 204 });
      }
    }
  }
};

export const GET = withAuth(async (_request, { params }) => {
  const resolvedParams = await params;
  const decodedParams = decodeParams(resolvedParams);
  const pathId = decodedParams.id;

  const accessTokenResponse = await getAccessTokenResponse(pathId);

  const athleteResponse = await fetch(
    `${"https://www.strava.com/api/v3"}/athlete`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessTokenResponse.access_token}`,
      },
    },
  ).then(async (response) => await response.json());

  return NextResponse.json(athleteResponse);
});

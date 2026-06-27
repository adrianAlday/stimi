import { NextRequest, NextResponse } from "next/server";

export const pushApiUrl = "https://www.strava.com/api/v3/push_subscriptions";

export const POST = async () => {
  const subscribeReponse = await fetch(pushApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      verify_token: process.env.PUSH_VERIFY_TOKEN,
      client_id: Number(process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID),
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      callback_url: "https://stimi.vercel.app/api/push",
    }),
  }).then(async (response) => await response.json());

  return NextResponse.json(subscribeReponse);
};

export const GET = async () => {
  const params = {
    client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || "",
    client_secret: process.env.STRAVA_CLIENT_SECRET || "",
  };
  const queryString = new URLSearchParams(params).toString();

  const getResponse = await fetch(`${pushApiUrl}?${queryString}`).then(
    async (response) => await response.json(),
  );

  return NextResponse.json(getResponse);
};

export const DELETE = async (request: NextRequest) => {
  const params = {
    client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || "",
    client_secret: process.env.STRAVA_CLIENT_SECRET || "",
  };
  const queryString = new URLSearchParams(params).toString();

  const deleteResponse = await fetch(
    `${pushApiUrl}/${
      Object.fromEntries(request.nextUrl.searchParams.entries()).id
    }?${queryString}`,
    {
      method: "DELETE",
    },
  );

  return NextResponse.json(deleteResponse);
};

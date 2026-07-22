import { withAuth } from "@/app/_utils/withAuth";
import { NextResponse } from "next/server";

export const pushApiUrl = "https://www.strava.com/api/v3/push_subscriptions";

export const POST = withAuth(async () => {
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
});

const getSubscriptionResponse = async () => {
  const params = {
    client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || "",
    client_secret: process.env.STRAVA_CLIENT_SECRET || "",
  };
  const queryString = new URLSearchParams(params).toString();

  return await fetch(`${pushApiUrl}?${queryString}`).then(
    async (response) => await response.json(),
  );
};

export const GET = withAuth(async () => {
  return NextResponse.json(await getSubscriptionResponse());
});

export const DELETE = withAuth(async () => {
  const subscriptionResponse = await getSubscriptionResponse();

  const params = {
    client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || "",
    client_secret: process.env.STRAVA_CLIENT_SECRET || "",
  };
  const queryString = new URLSearchParams(params).toString();

  const deleteResponse = await fetch(
    `${pushApiUrl}/${subscriptionResponse[0]?.id}?${queryString}`,
    {
      method: "DELETE",
    },
  );

  return NextResponse.json(deleteResponse);
});

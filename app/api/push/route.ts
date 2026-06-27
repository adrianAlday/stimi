import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenResponse } from "../access-token/route";
import {
  deleteActivity,
  getActivitiesReponse,
  getActivityReponse,
  upsertActivities,
} from "../activities/route";
import crypto from "crypto";
import { Buffer } from "buffer";

export const GET = async (request: NextRequest) => {
  const searchParamsObject = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  );

  if (
    searchParamsObject["hub.verify_token"] === process.env.PUSH_VERIFY_TOKEN
  ) {
    return NextResponse.json({
      "hub.challenge": searchParamsObject["hub.challenge"],
    });
  }

  return NextResponse.json({});
};

export const POST = async (request: NextRequest) => {
  const headerValue = request.headers.get("x-strava-signature");
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!headerValue || !clientSecret) {
    return NextResponse.json(
      { error: "Unauthorized missing signature or secret" },
      { status: 401 },
    );
  }

  try {
    const { t: timestamp, v1: receivedSignature } = Object.fromEntries(
      headerValue.split(",").map((string) => string.split("=")),
    );
    if (!timestamp || !receivedSignature) {
      return NextResponse.json(
        { error: "Invalid signature format" },
        { status: 400 },
      );
    }

    if (
      Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp, 10)) > 300
    ) {
      return NextResponse.json({ error: "Request expired" }, { status: 400 });
    }

    const rawBody = await request.text();
    if (
      !crypto.timingSafeEqual(
        Buffer.from(receivedSignature, "hex"),
        Buffer.from(
          crypto
            .createHmac("sha256", clientSecret)
            .update(`${timestamp}.${rawBody}`)
            .digest("hex"),
          "hex",
        ),
      )
    ) {
      console.log("Invalid signature match after raw body variable");
      return NextResponse.json(
        { error: "Invalid signature match" },
        { status: 401 },
      );
    }

    const { object_type, aspect_type, updates, owner_id, object_id } =
      await request.json();

    if (object_type === "activity") {
      if (
        aspect_type === "create" ||
        (aspect_type === "update" && updates?.type)
      ) {
        const accessTokenResponse = await getAccessTokenResponse(owner_id);

        const activityResponse = await getActivityReponse({
          accessToken: accessTokenResponse.access_token,
          activityId: object_id,
        });
        const activitiesResponse = await getActivitiesReponse({
          accessToken: accessTokenResponse.access_token,
        });

        await upsertActivities([
          ...new Map(
            [activityResponse, ...activitiesResponse].map((activity) => [
              activity.id,
              activity,
            ]),
          ).values(),
        ]);
      }

      if (aspect_type === "delete") {
        await deleteActivity(object_id);
      }
    }

    return NextResponse.json({ message: "EVENT_RECEIVED" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};

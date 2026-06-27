import { NextRequest, NextResponse } from "next/server";
import { getAccessTokenResponse } from "../access-token/route";
import {
  deleteActivity,
  getActivitiesReponse,
  getActivityReponse,
  upsertActivities,
} from "../activities/route";

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
  let response = {};

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

      response = await upsertActivities([
        ...new Map(
          [activityResponse, ...activitiesResponse].map((activity) => [
            activity.id,
            activity,
          ]),
        ).values(),
      ]);

      console.log("response1", response);
    }

    if (aspect_type === "delete") {
      response = await deleteActivity(object_id);
    }
  }

  console.log("response2", response);

  return NextResponse.json(response);
};

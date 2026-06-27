import { createClient } from "@/app/_utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
  const { object_type, aspect_type, updates, object_id, owner_id } =
    await request.json();

  if (object_type === "activity") {
    const supabase = await createClient();

    // api/activity singular endpoint ? add simple auth?

    if (
      aspect_type === "create" ||
      (aspect_type === "update" && updates?.type)
    ) {
      const accessTokenParams = {
        id: owner_id,
      };
      const accessTokenQueryString = new URLSearchParams(
        accessTokenParams,
      ).toString();

      const accessTokenResponse = await fetch(
        `/api/access-token?${accessTokenQueryString}`,
      ).then(async (response) => await response.json());
    }

    if (aspect_type === "delete") {
      await supabase.from("strava_activities").delete().eq("id", object_id);
    }
  }
};

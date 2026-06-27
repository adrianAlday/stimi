import { createClient } from "@/app/_utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { pushApiUrl } from "../subscribe/route";

export const GET = async (request: NextRequest) => {
  const searchParamsObject = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  );

  console.log(
    `searchParamsObject["hub.verify_token"]`,
    searchParamsObject["hub.verify_token"],
  );
  console.log("process.env.PUSH_VERIFY_TOKEN", process.env.PUSH_VERIFY_TOKEN);
  console.log(
    `searchParamsObject["hub.verify_token"] === process.env.PUSH_VERIFY_TOKEN`,
    searchParamsObject["hub.verify_token"] === process.env.PUSH_VERIFY_TOKEN,
  );

  if (
    searchParamsObject["hub.verify_token"] === process.env.PUSH_VERIFY_TOKEN
  ) {
    console.log(
      `searchParamsObject["hub.challenge"]`,
      searchParamsObject["hub.challenge"],
    );

    const validationResponse = await fetch(pushApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "hub.challenge": searchParamsObject["hub.challenge"],
      }),
    }).then(async (response) => await response.json());

    console.log("validationResponse", validationResponse);

    return NextResponse.json(validationResponse);
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

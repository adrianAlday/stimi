import { createClient } from "@/app/_utils/supabase/server";
import { NextRequest } from "next/server";

export const pushApiUrl = "https://www.strava.com/api/v3/push_subscriptions";

export const GET = async (request: NextRequest) => {
  // make request to sub

  const searchParamsObject = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  );

  if (searchParamsObject.verify_token === process.env.PUSH_VERIFY_TOKEN) {
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

    if (validationResponse.id) {
      // update supabase say subscribed?
    }
  }
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

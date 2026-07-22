import { createClient } from "@/app/_utils/supabase/server";
import { withAuth } from "@/app/_utils/withAuth";
import { NextResponse } from "next/server";

export const GET = withAuth(async () => {
  const supabase = await createClient();

  const idResponse = await supabase.from("strava_athletes").select("id");

  return NextResponse.json(idResponse);
});

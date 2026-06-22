import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const path = "https://www.strava.com/api/v3/athlete/activities";

  const searchParamsObject = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  );
  const params = {
    before: searchParamsObject.before || "9999999999",
    per_page: searchParamsObject.perPage || "200",
    page: searchParamsObject.page || "1",
  };
  const queryString = new URLSearchParams(params).toString();

  const response = await fetch(`${path}?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${searchParamsObject.accessToken}`,
    },
  }).then(async (response) => await response.json());

  return NextResponse.json(response);
};

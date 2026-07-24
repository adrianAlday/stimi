import { NextRequest, NextResponse } from "next/server";
import { getCookie } from "./cookies";
import { isAdmin } from "./isAdmin";
import { Params } from "./types";
import { decodeParams } from "./url";

export const withAuth =
  (
    handler: (
      request: NextRequest,
      context: { params: Promise<Params> },
    ) => Promise<NextResponse | Response> | NextResponse,
    { matchableParamKeys } = { matchableParamKeys: [] as string[] },
  ) =>
  async (request: NextRequest, context: { params: Promise<Params> }) => {
    const cookie = await getCookie();
    const cookieId = cookie?.id;

    const userIsAdmin = isAdmin(cookieId);

    const decodedParams = matchableParamKeys.length
      ? decodeParams({
          ...Object.fromEntries(request.nextUrl.searchParams),
          ...(request.method === "POST" ? await request.clone().json() : {}),
          ...(await context.params),
        })
      : {};
    const userMatchesParam =
      Number(cookieId) &&
      matchableParamKeys
        .map((matchableParamKey) => Number(decodedParams[matchableParamKey]))
        .includes(Number(cookieId));

    return userIsAdmin || userMatchesParam
      ? await handler(request, context)
      : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  };

import { NextRequest, NextResponse } from "next/server";
import { getCookie } from "./cookies";
import { isAdmin } from "./isAdmin";
import { Params } from "./types";

export const withAuth =
  (
    handler: (
      request: NextRequest,
      context: { params: Promise<Params> },
    ) => Promise<NextResponse> | NextResponse,
  ) =>
  async (request: NextRequest, context: { params: Promise<Params> }) => {
    const cookie = await getCookie();
    const cookieId = cookie?.id;
    const userIsAdmin = isAdmin(cookieId);

    return userIsAdmin
      ? await handler(request, context)
      : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  };

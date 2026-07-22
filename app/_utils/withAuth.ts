import { NextRequest, NextResponse } from "next/server";
import { getCookie } from "./cookies";
import { isAdmin } from "./isAdmin";

export const withAuth =
  (
    handler: (
      request: NextRequest,
      context: unknown,
    ) => Promise<NextResponse> | NextResponse,
  ) =>
  async (request: NextRequest, context: unknown) => {
    const cookie = await getCookie();
    const cookieId = cookie?.id;
    const userIsAdmin = isAdmin(cookieId);

    return userIsAdmin
      ? await handler(request, context)
      : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  };

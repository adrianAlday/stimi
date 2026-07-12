import { ParamValue } from "next/dist/server/request/params";
import { Params } from "./types";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { isDev } from "./isDev";

const decodeString = (value: ParamValue) =>
  decodeURIComponent(value as unknown as string)
    .replace(/\+/g, " ")
    .trim();

export const decodeParams = (resolvedParams: Params) =>
  Object.fromEntries(
    Object.entries(resolvedParams).map(([key, value]) => [
      key,
      decodeString(value),
    ]),
  );

export const generateSignupUrl = (resolvedHeaders: ReadonlyHeaders) => {
  const host = resolvedHeaders.get("host");
  const referer = resolvedHeaders.get("referer");

  return (
    `http://www.strava.com/oauth/mobile/authorize?` +
    `&response_type=code` +
    `&client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}` +
    `&scope=activity:read,activity:read_all` +
    `&redirect_uri=http${isDev ? "" : "s"}://${host}/api/signup` +
    `&state=${referer}`
  );
};

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cookieName } from "./cookieName";

const encodedJwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);

export const signJwt = async (payload: { [key: string]: string }) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .sign(encodedJwtSecret);
};

export const verifyJwt = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, encodedJwtSecret);
    return payload;
  } catch (error) {
    console.log(error);

    return null;
  }
};

export const getCookie = async () => {
  try {
    const cookieStore = await cookies();

    const cookie = cookieStore.get(cookieName)?.value;

    if (!cookie) {
      return null;
    }

    const payload = await verifyJwt(cookie);

    return payload;
  } catch (error) {
    console.error(error);

    return null;
  }
};

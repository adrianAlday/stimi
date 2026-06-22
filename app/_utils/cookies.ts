import { SignJWT, jwtVerify } from "jose";

export const cookieName = "token";

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

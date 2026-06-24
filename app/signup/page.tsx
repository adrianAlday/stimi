import { headers } from "next/headers";
import Link from "next/link";
import { isDev } from "../_utils/isDev";
import Image from "next/image";

const SignupPage = async () => {
  const resolvedHeaders = await headers();
  const host = resolvedHeaders.get("host");
  const referer = resolvedHeaders.get("referer");

  return (
    <main>
      <div className="h-dvh flex items-center justify-center">
        <Link
          href={
            `http://www.strava.com/oauth/mobile/authorize?` +
            `&response_type=code` +
            `&client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}` +
            `&scope=activity:read_all` +
            `&redirect_uri=http${isDev ? "" : "s"}://${host}/api/signup` +
            `&state=${referer}`
          }
          className="relative size-[33dvw]"
        >
          <Image
            src={"/connect.svg"}
            alt={"connect"}
            unoptimized={true}
            preload={true}
            fill
          />
        </Link>
      </div>
    </main>
  );
};

export default SignupPage;

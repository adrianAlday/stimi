import { headers } from "next/headers";
import Link from "next/link";
import { isDev } from "../_utils/isDev";
import Image from "next/image";
import { inter } from "../layout";

const SignupPage = async () => {
  const resolvedHeaders = await headers();
  const host = resolvedHeaders.get("host");
  const referer = resolvedHeaders.get("referer");

  const demoId = process.env.NEXT_PUBLIC_DEMO_ID;

  const buttonHeightStyle = { height: 48 };
  const logoHeight = 18;

  return (
    <main>
      <div className="h-dvh w-dvw p-4 flex justify-center overflow-x-auto overflow-y-auto scrollbar-none overscroll-x-none overscroll-y-none">
        <div className="mt-[220px] font-semibold">
          <div>{"See just what's important for training."}</div>

          <div className="mt-4">{"It's not that complicated."}</div>

          {demoId && (
            <Link
              href={`/people/${demoId}`}
              target="_blank"
              className="mt-4 border border-1 border-[rgb(255,255,255)] rounded-3xl w-full flex items-center justify-center"
              style={buttonHeightStyle}
            >
              <div
                className={`mt-[4px] mr-[7px] text-[13px] ${inter.className} uppercase tracking-wide`}
              >
                {"Check out"}
              </div>

              <div
                className={
                  "font-black text-[rgb(255,255,255)] text-[20px] leading-[20px]"
                }
              >
                STiMi
              </div>
            </Link>
          )}

          <Link
            href={
              `http://www.strava.com/oauth/mobile/authorize?` +
              `&response_type=code` +
              `&client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}` +
              `&scope=activity:read_all` +
              `&redirect_uri=http${isDev ? "" : "s"}://${host}/api/signup` +
              `&state=${referer}`
            }
            className="mt-4 rounded-3xl w-full bg-[rgb(252,82,0)] text-[rgb(255,255,255)] flex items-center justify-center"
            style={buttonHeightStyle}
          >
            <div
              className={`mt-[4px] mr-[7px] text-[13px] ${inter.className} uppercase tracking-wide`}
            >
              {"Connect your"}
            </div>

            <div
              className="relative"
              style={{
                height: logoHeight,
                width: (432 / 91) * logoHeight,
              }}
            >
              <Image
                src={"/strava.svg"}
                alt={"strava"}
                unoptimized={true}
                preload={true}
                fill
              />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default SignupPage;

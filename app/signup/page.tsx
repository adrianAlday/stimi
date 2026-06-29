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

  const buttonSizeStyle = { height: 48, width: 237 };

  return (
    <main>
      <div className="mx-4 h-dvh flex items-center justify-center">
        <div className="flex flex-col font-semibold">
          <div className={"font-black text-[rgb(252,82,0)] text-2xl"}>
            STiMi
          </div>

          <div className="mt-4">
            {"Track just what's important for training."}
          </div>

          <div className="mt-4">{"It's not that complicated."}</div>

          <div className="flex flex-col items-center justify-center">
            {demoId && (
              <Link href={`/people/${demoId}`} target="_blank">
                <div
                  className="mt-4 border border-1 border-[rgb(255,255,255)] rounded-md bg-[rgb(20,20,20)] flex items-center justify-center text-[rgb(255,255,255)]"
                  style={buttonSizeStyle}
                >
                  <div className="flex items-baseline pb-[4px]">
                    <div
                      className={`mr-[7px] text-[13px] ${inter.className} uppercase tracking-wide`}
                    >
                      {"Check out"}
                    </div>

                    <div
                      className={"font-black text-[rgb(255,255,255)] text-2xl"}
                    >
                      STiMi
                    </div>
                  </div>
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
              className="mt-4 relative"
              style={buttonSizeStyle}
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
        </div>
      </div>
    </main>
  );
};

export default SignupPage;

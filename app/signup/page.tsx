import { headers } from "next/headers";
import Link from "next/link";
import { generateSignupUrl } from "../_utils/url";
import SignupButton, {
  inter,
  signupButtonHeightStyle,
} from "@/_components/SignupButton";

export const demoParam = "demo";

const SignupPage = async () => {
  const demoId = process.env.NEXT_PUBLIC_DEMO_ID;

  const resolvedHeaders = await headers();

  return (
    <main>
      <div className="h-dvh w-dvw p-4 flex justify-center">
        <div className="mt-[220px] font-semibold">
          <div>{"See just what's important for training."}</div>

          {/* <div className="mt-4">{"It's not that complicated."}</div> */}

          {demoId && (
            <Link
              href={`/people/${demoId}?${demoParam}`}
              className="mt-4 border border-1 border-[rgb(255,255,255)] rounded-3xl w-full flex items-center justify-center"
              style={signupButtonHeightStyle}
            >
              <div
                className={`mt-[4px] mr-[7px] text-[13px] ${inter.className} uppercase tracking-wide`}
              >
                {/* {"Check out"} */}
                {"Check out Stimi"}
              </div>

              {/* <div
                className={
                  "font-black text-[rgb(255,255,255)] text-[20px] leading-[20px]"
                }
              >
                STiMi
              </div> */}
            </Link>
          )}

          <SignupButton
            url={await generateSignupUrl(resolvedHeaders)}
            className={"mt-4"}
          />
        </div>
      </div>
    </main>
  );
};

export default SignupPage;

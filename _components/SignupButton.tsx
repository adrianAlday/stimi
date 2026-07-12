import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const signupButtonHeightStyle = { height: 48 };

type SignupButtonProps = {
  url: string;
  className?: string;
};

const SignupButton = ({ url, className }: SignupButtonProps) => {
  const logoHeight = 18;

  return (
    <Link
      href={url}
      className={`rounded-3xl w-full bg-[rgb(252,82,0)] text-[rgb(255,255,255)] flex items-center justify-center ${className}`}
      style={signupButtonHeightStyle}
    >
      <div
        className={`mt-[4px] mr-[7px] text-[13px] ${inter.className} font-semibold uppercase tracking-wide`}
      >
        {/* {"Connect your"} */}
        {"Connect with"}
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
  );
};

export default SignupButton;

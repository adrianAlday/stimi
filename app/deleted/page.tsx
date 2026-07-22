import { inter, signupButtonHeightStyle } from "@/_components/SignupButton";
import Link from "next/link";

const DeletedPage = () => {
  return (
    <main>
      <div className="h-dvh w-dvw p-4 flex justify-center">
        <div className="mt-[180px] font-semibold flex flex-col items-center">
          <div>
            <svg
              viewBox="0 0 22.7578 22.418"
              xmlns="http://www.w3.org/2000/svg"
              className="size-8"
            >
              <g>
                <rect height="22.418" opacity="0" width="22.7578" x="0" y="0" />

                <path
                  d="M22.4062 4.11328L22.4062 18.2988C22.4062 20.959 20.9473 22.4062 18.2695 22.4062L4.13672 22.4062C1.46484 22.4062 0 20.959 0 18.2988L0 4.11328C0 1.45898 1.46484 0 4.13672 0L18.2695 0C20.9473 0 22.4062 1.45898 22.4062 4.11328ZM14.5195 6.64453L9.95508 13.9043L7.91602 11.3965C7.59375 11.0098 7.27734 10.8516 6.85547 10.8516C6.13477 10.8516 5.54297 11.4258 5.54297 12.1465C5.54297 12.4922 5.66016 12.7852 5.92383 13.1133L8.67773 16.4004C9.04102 16.8516 9.46289 17.0918 9.98438 17.0918C10.4883 17.0918 10.9453 16.8281 11.25 16.377L16.6934 8.06836C16.8984 7.75781 17.0215 7.44141 17.0215 7.14844C17.0215 6.42188 16.377 5.90625 15.6738 5.90625C15.2168 5.90625 14.8359 6.1582 14.5195 6.64453Z"
                  fill="currentColor"
                  fillOpacity="0.85"
                />
              </g>
            </svg>
          </div>

          <div className="mt-4">
            Data successfully removed from{" "}
            <span className={"mx-px font-black text-[20px] leading-[20px]"}>
              STiMi
            </span>
          </div>

          <Link
            href={"/signup"}
            className="mt-4 border border-1 border-[rgb(255,255,255)] rounded-3xl w-full flex items-center justify-center"
            style={signupButtonHeightStyle}
          >
            <div
              className={`mt-[0px] mr-[7px] text-[13px] ${inter.className} uppercase tracking-wide`}
            >
              {"Continue"}
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default DeletedPage;

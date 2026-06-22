import { headers } from "next/headers";
import Link from "next/link";

const SignupPage = async () => {
  const resolvedHeaders = await headers();
  const host = resolvedHeaders.get("host");
  const referer = resolvedHeaders.get("referer");

  return (
    <main>
      <button>
        <Link
          href={
            `http://www.strava.com/oauth/authorize?` +
            `&response_type=code` +
            `&client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}` +
            `&scope=activity:read_all` +
            `&redirect_uri=http://${host}/api/signup` +
            `&state=${referer}`
          }
        >
          <div>sign up</div>
        </Link>
      </button>
    </main>
  );
};

export default SignupPage;

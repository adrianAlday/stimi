import { cookies, headers } from "next/headers";
import Link from "next/link";
import { verifyJwt } from "./_utils/jwt";

const getSessionData = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyJwt(token);

    return payload;
  } catch (error) {
    console.error(error);

    return null;
  }
};

const HomePage = async () => {
  const resolvedHeaders = await headers();
  const host = resolvedHeaders.get("host");
  const referer = resolvedHeaders.get("referer");

  // console.log("referer", referer);

  const session = await getSessionData();

  // console.log("session", session);

  return (
    <div>
      <main>
        <button>
          <Link
            href={
              `http://www.strava.com/oauth/authorize?` +
              `&response_type=code` +
              `&client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}` +
              `&scope=activity:read_all` +
              `&redirect_uri=http://${host}/api/thingy` +
              `&state=${referer}`
            }
          >
            <div>authorize</div>
          </Link>
        </button>
      </main>
    </div>
  );
};

export default HomePage;

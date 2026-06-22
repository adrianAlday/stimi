import { headers } from "next/headers";
import Link from "next/link";

const HomePage = async () => {
  const resolvedHeaders = await headers();
  const host = resolvedHeaders.get("host");
  const referer = resolvedHeaders.get("referer");

  return (
    <div>
      <main>
        <button>
          <Link
            target="_blank"
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

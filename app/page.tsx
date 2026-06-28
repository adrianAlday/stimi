import { getCookie } from "./_utils/cookies";
import { redirect } from "next/navigation";

const HomePage = async () => {
  const cookie = await getCookie();

  const id = cookie?.id;

  redirect(id ? `/people/${id}` : "/signup");
};

export default HomePage;

// learn from other apps https://www.strava.com/settings/apps
// loader
// use strava profile pic in corner?
// refresh button?
// make strava auth the callback domain then redirect to stimi
// redirect from signup to main page if has cookie
// add admin mode
// load more button for more pages?
// height dependent on data vs ticks?
// or 280 height, make ticks change to not be crammed?
// day target is time target divided by 90 rounded up?
// month and year dividing lines
// make bars go to that week on strava?
// filter for after a specific date?
// keep only last week from 2 years ago?
// routing so that url goes to specific athlete
// allow user to toggle making page public
// allow admin power
// demo page with my data
// switch goal back to target?
// say `${value}+` for days
// line opacity 0 at beginning and 1 at recent end?
// smaller days chart?
// make home the info and signup page?
// add demo link to home page
// user paths
// allow to make public
// homepage with video background
// move get cookie?
// move all strava api management into new repo, other apps will be called by it
// filter select activities by date
// change api/activities/post to use body insead of query string
// review error handling, success checking
// promise all simultaneous calls
// make baseurlhelper
//  render loading thing then redirect https://www.google.com/search?q=react+suspense+fallback+with+progress+state
// suspense instead of force dynamic on admin page?
// current flow: redirect to signup page -> authorize -> save token -> set cookie -> download -> display bars on root, webhook to refresh
// new flow: root is info with signup button -> auth -> download with progress -> display bars on athlete/:id page, webhook to refresh

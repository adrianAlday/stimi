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
// refresh button?
// make strava auth the callback domain then redirect to stimi
// redirect from signup to main page if has cookie
// admin user browser
// load more button for more pages?
// height dependent on data vs ticks?
// or 280 height, make ticks change to not be crammed?
// day target is time target divided by 90 rounded up?
// month and year dividing lines
// make bars go to that week on strava?
// get activities from db also filter for after a specific date?
// allow user to toggle making page public
// switch goal back to target?
// say `${value}+` for days
// line opacity 0 at beginning and 1 at recent end?
// smaller days chart?
// signup page with video background
// move all strava api management into new repo, other apps will be called by it
// change api/activities/post to use body insead of query string
// review error handling, success checking
// promise all simultaneous calls
// make baseurlhelper
//  render loading thing then redirect https://www.google.com/search?q=react+suspense+fallback+with+progress+state
// suspense instead of force dynamic on admin page?
// "thats it"
// connect on linkedin
// goals are a range?
// golden line for 10*90mins
// "im weird" button to show more charts
// login button vs actuall doing auth?
// handle if last activity was at a later time than current system now time
// demo mock data instead of real data
// show profile picture on downloading page
// video background by center it, maybe crop video

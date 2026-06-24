import { DateTime } from "luxon";
import BarChart from "./BarChart";

type Activity = {
  sportType: string;
  startDateLocal: string;
  date: string;
  movingTime: number;
};

type BarsProps = {
  now: DateTime<true>;
  activities: Activity[];
};

const Bars = ({ now, activities }: BarsProps) => {
  const filteredActivities = activities
    .filter((activity) => activity.sportType.includes("Run"))
    .sort((a, b) => a.startDateLocal.localeCompare(b.startDateLocal));
  const processedActivities = filteredActivities.map((activity) => {
    const date = DateTime.fromISO(activity.startDateLocal, {
      zone: "UTC",
    });
    const startOfWeek = date.startOf("week");

    return {
      ...activity,
      date: date.toISODate() as string,
      startOfWeek: startOfWeek.toISODate() as string,
    };
  });

  const groupedActivities = {} as {
    [key: string]: Activity[];
  };
  const lastWeekString = now.startOf("week").toISODate();
  const firstWeek = DateTime.fromISO(
    processedActivities[0].startOfWeek || lastWeekString,
  );
  const lastWeek = DateTime.fromISO(lastWeekString);
  const weeks = [firstWeek];
  for (let i = 0; ; i++) {
    const newWeek = weeks.toReversed()[0].plus({ weeks: 1 });

    if (newWeek > lastWeek) {
      break;
    }

    weeks.push(newWeek);
  }
  weeks.forEach((week) => {
    groupedActivities[week.toISODate() as string] = [];
  });
  processedActivities.forEach((activity) => {
    groupedActivities[activity.startOfWeek].push(activity);
  });
  const groupedActivitiesEntries = Object.entries(groupedActivities).sort(
    (a, b) => a[0].localeCompare(b[0]),
  );
  const selectedGroups = groupedActivitiesEntries.slice(
    groupedActivitiesEntries.length > 1 ? 1 : 0,
  );
  // keep only last week from 2 years ago?
  const getLabels = (week: string) => {
    const date = DateTime.fromISO(week); // jsut store this higher up
    const label = date.toFormat("L/d");
    const [month, day] = label.split("/");
    const sublabel =
      month === "1" && Number(day) <= 7 ? date.toFormat("yyyy") : undefined;

    return {
      label,
      sublabel,
    };
  };
  const daysData = selectedGroups.map(([week, activities]) => ({
    ...getLabels(week),
    value: new Set(activities.map((activity) => activity.date)).size,
  }));
  const TimeData = selectedGroups.map(([week, activities]) => ({
    ...getLabels(week),
    value: Math.floor(
      activities.reduce(
        (accumulator, activity) => accumulator + activity.movingTime,
        0,
      ) / 60,
    ),
  }));

  return (
    <div className="pt-4 w-max">
      <div className="my-4 px-4 inline sticky left-0 font-semibold">
        <span className={"font-black text-[rgb(252,82,0)] text-lg"}>STiMi</span>{" "}
        - Last {selectedGroups.length} weeks
      </div>

      <BarChart data={daysData} title={"Days on"} tickInterval={1} />

      <BarChart data={TimeData} title={"Minutes moving"} tickInterval={60} />
    </div>
  );
};

export default Bars;

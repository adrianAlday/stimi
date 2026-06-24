import { DateTime } from "luxon";
import BarChart from "./BarChart";

type Activity = {
  sportType: string;
  startDateLocal: string;
  date: string;
  movingTime: number;
};

type BarsProps = {
  activities: Activity[];
};

const Bars = ({ activities }: BarsProps) => {
  const now = DateTime.now();

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
  // go back at least 8, 16 weeks?
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
  const getLabels = (week: string) => {
    const date = DateTime.fromISO(week);
    const label = date.toFormat("L/d");
    const [month, day] = label.split("/");
    const sublabel =
      month === "1" && Number(day) <= 7 ? date.toFormat("yyyy") : undefined;

    return {
      label,
      sublabel,
    };
  };
  const daysData = groupedActivitiesEntries.map(([week, activities]) => ({
    ...getLabels(week),
    value: new Set(activities.map((activity) => activity.date)).size,
  }));
  const TimeData = groupedActivitiesEntries.map(([week, activities]) => ({
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
      <div className="my-4 inline sticky left-4 font-semibold">
        Last {groupedActivitiesEntries.length} weeks
      </div>

      <BarChart data={daysData} title={"Days on"} tickInterval={1} />

      <BarChart data={TimeData} title={"Moving time"} tickInterval={60} />
    </div>
  );
};

export default Bars;

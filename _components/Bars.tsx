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
  const daysData = groupedActivitiesEntries.map(([week, activities]) => ({
    label: DateTime.fromISO(week).toFormat("LL/dd"),
    value: new Set(activities.map((activity) => activity.date)).size,
  }));
  const TimeData = groupedActivitiesEntries.map(([week, activities]) => ({
    label: DateTime.fromISO(week).toFormat("LL/dd"),
    value: Math.floor(
      activities.reduce(
        (accumulator, activity) => accumulator + activity.movingTime,
        0,
      ) / 60,
    ),
  }));

  return (
    <div>
      <div>
        <BarChart
          data={daysData}
          yAxisLabel="Days on / week"
          yAxisTickInterval={1}
          yAxisUnit="day"
        />

        <BarChart
          data={TimeData}
          yAxisLabel="Moving time / week"
          yAxisTickInterval={60}
          yAxisUnit="min"
        />
      </div>
    </div>
  );
};

export default Bars;

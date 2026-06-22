import { DateTime } from "luxon";

type BarsProps = {
  activities: [{ [key: string]: string }];
};

const Bars = ({ activities }: BarsProps) => {
  const now = DateTime.now();

  const filteredActivities = activities
    .filter((activity) => activity.sport_type.includes("Run"))
    .sort((a, b) => a.start_date_local.localeCompare(b.start_date_local));
  const processedActivities = filteredActivities.map((activity) => {
    const date = DateTime.fromISO(activity.start_date_local, {
      zone: "UTC",
    });
    const startOfWeek = date.startOf("week").toISODate() as string;

    return {
      startOfWeek,
      ...activity,
    };
  });

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
  const groupedActivities = {} as {
    [key: string]: { [key: string]: string }[];
  };
  weeks.forEach((week) => {
    groupedActivities[week.toISODate() as string] = [];
  });
  processedActivities.forEach((activity) => {
    groupedActivities[activity.startOfWeek] = [
      ...groupedActivities[activity.startOfWeek],
      activity,
    ];
  });

  return (
    <div>
      <div>
        <div></div>

        <div></div>
      </div>

      {/* {JSON.stringify(groupedActivities)} */}
    </div>
  );
};

export default Bars;

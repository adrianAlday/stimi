"use client";

import { DateTime } from "luxon";
import BarChart, { DataPoint } from "./BarChart";
import Link from "next/link";
import Image from "next/image";
import SignupButton from "./SignupButton";
import { weeksToShow } from "@/app/_utils/data";

type Activity = {
  sportType: string;
  startDateLocal: string;
  movingTime: number;
};

type BarsProps = {
  pathId: string;
  userIsAdmin: boolean;
  demoUrl?: string;
  profile: string;
  activities: Activity[];
};

const Bars = ({
  pathId,
  userIsAdmin,
  demoUrl,
  profile,
  activities,
}: BarsProps) => {
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
  const lastWeek = now.startOf("week");
  const firstWeek = DateTime.min(
    lastWeek.minus({ weeks: weeksToShow }),
    ...(processedActivities[0]
      ? [DateTime.fromISO(processedActivities[0].startOfWeek)]
      : []),
  );
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
  const selectedGroups = groupedActivitiesEntries
    .slice(groupedActivitiesEntries.length > 1 ? 1 : 0)
    .reverse()
    .slice(0, userIsAdmin ? undefined : weeksToShow)
    .reverse();

  const years = Object.entries(
    selectedGroups.reduce(
      (accumulator, element) => {
        const week = element[0].split("-")[0];

        accumulator[week] = accumulator[week] ? accumulator[week] + 1 : 1;

        return accumulator;
      },
      {} as { [key: string]: number },
    ),
  );

  const getLabels = (week: string) => ({
    labelValue: week,
    label: DateTime.fromISO(week).toFormat("L/d"),
  });

  const weeksToLookBack = 2;
  const timeGoalRamp = 10;

  const timeData = selectedGroups
    .map(([week, activities]) => ({
      ...getLabels(week),
      value: Math.floor(
        activities.reduce(
          (accumulator, activity) => accumulator + activity.movingTime,
          0,
        ) / 60,
      ),
    }))
    .reduce((accumulator, week, index) => {
      const previousWeeks = accumulator.toReversed().slice(0, weeksToLookBack);
      const lastWeek = previousWeeks[0];

      const goalValue =
        index === 0
          ? timeGoalRamp
          : lastWeek.value >= lastWeek.goalValue
            ? lastWeek.goalValue + timeGoalRamp
            : previousWeeks.every(
                  (previousWeek) => previousWeek.value < previousWeek.goalValue,
                )
              ? Math.max(lastWeek.goalValue - timeGoalRamp, timeGoalRamp)
              : lastWeek.goalValue;

      return [...accumulator, { ...week, goalValue }];
    }, [] as DataPoint[]);

  const maximumRequestedTimePerDay = 90;
  const minimumDaysGoal = 2;
  const maximumDaysGoal = 7;

  const daysData = selectedGroups
    .map(([week, activities]) => ({
      ...getLabels(week),
      value: new Set(
        activities.map(
          (activity) => (activity as Activity & { date: string }).date,
        ),
      ).size,
    }))
    .map((week, index) => {
      const goalValue = Math.min(
        Math.max(
          Math.ceil(timeData[index].goalValue / maximumRequestedTimePerDay),
          minimumDaysGoal,
        ),
        maximumDaysGoal,
      );

      return {
        ...week,
        goalValue,
      };
    });

  const longData = selectedGroups
    .map(([week, activities]) => ({
      ...getLabels(week),
      value: Math.floor(
        Math.max(0, ...activities.map((activity) => activity.movingTime)) / 60,
      ),
    }))
    .reduce((accumulator, week, index) => {
      const previousWeeks = accumulator.toReversed().slice(0, weeksToLookBack);
      const lastWeek = previousWeeks[0];

      const goalValue =
        index === 0
          ? timeGoalRamp
          : lastWeek.value >= lastWeek.goalValue
            ? lastWeek.goalValue + timeGoalRamp
            : previousWeeks.every(
                  (previousWeek) => previousWeek.value < previousWeek.goalValue,
                )
              ? Math.max(lastWeek.goalValue - timeGoalRamp, timeGoalRamp)
              : lastWeek.goalValue;

      return [...accumulator, { ...week, goalValue }];
    }, [] as DataPoint[]);

  const columnWidth = 48 - (48 * 0.2) / selectedGroups.length;

  const scrollContainerId = "scroll";

  return (
    <div
      className="w-dvw h-dvh overflow-x-auto overflow-y-auto scrollbar-none overscroll-x-none overscroll-y-none overscroll-none flex justify-center-safe"
      id={scrollContainerId}
    >
      <div className="w-max">
        <div className="mt-3 pb-2 px-4 inline-block sticky left-0 w-dvw font-semibold">
          <div className="flex items-center">
            <Link href={"/"}>
              <div
                className={
                  // "font-black text-[rgb(252,82,0)] text-2xl"
                  "font-black text-[rgb(66,133,244)] text-2xl"
                }
              >
                STiMi
              </div>
            </Link>

            {/* <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-4 size-[18px]"
            >
              <path
                d="M8.688 0C8.025 0 7.38.215 6.85.613l-3.32 2.49-2.845.948A1 1 0 000 5c0 1.579.197 2.772.567 3.734.376.978.907 1.654 1.476 2.223.305.305.6.567.886.82.785.697 1.5 1.33 2.159 2.634 1.032 2.57 2.37 4.748 4.446 6.27C11.629 22.218 14.356 23 18 23c2.128 0 3.587-.553 4.549-1.411a4.378 4.378 0 001.408-2.628c.152-.987-.389-1.787-.967-2.25l-3.892-3.114a1 1 0 01-.329-.477l-3.094-9.726A2 2 0 0013.769 2h-1.436a2 2 0 00-1.2.4l-.57.428-.516-1.803A1.413 1.413 0 008.688 0zM8.05 2.213c.069-.051.143-.094.221-.127l1.168 4.086L12.333 4h1.436l.954 3H12v2h3.36l.318 1H13v2h3.314l.55 1.726a3 3 0 00.984 1.433l3.106 2.485c-.77.19-1.778.356-2.954.356-1.97 0-3.178-.431-4.046-1.087-.895-.677-1.546-1.675-2.251-3.056-.224-.437-.45-.907-.688-1.403C9.875 10.08 8.444 7.1 5.531 4.102zM3.743 5.14c2.902 2.858 4.254 5.664 5.441 8.126.25.517.49 1.018.738 1.502.732 1.432 1.55 2.777 2.827 3.74C14.053 19.495 15.72 20 18 20c1.492 0 2.754-.23 3.684-.479a2.285 2.285 0 01-.467.575c-.5.446-1.435.904-3.217.904-3.356 0-5.629-.718-7.284-1.931-1.663-1.22-2.823-3.028-3.788-5.44a1.012 1.012 0 00-.034-.076c-.853-1.708-1.947-2.673-2.79-3.417a14.61 14.61 0 01-.647-.593c-.431-.431-.775-.88-1.024-1.527-.21-.545-.367-1.271-.417-2.3z"
                fill="currentColor"
              />
            </svg> */}

            <div className="ml-2 grow">Weekly Stimulus</div>

            {/* <Link
              href={`https://www.strava.com/athletes/${pathId}`}
              target="_blank"
              className="relative size-10"
            >
              <Image
                src={profile}
                alt={"profile"}
                fill
                className="rounded-3xl bg-[rgba(255,255,255,0.33)] p-[1px]"
              />
            </Link> */}

            {demoUrl ? (
              <Link href={"/message"}>
                <svg
                  viewBox="0 0 11.8789 10.3945"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-8"
                >
                  <g>
                    <rect
                      height="10.3555"
                      opacity="0"
                      width="11.8789"
                      x="0"
                      y="0"
                    />
                    <path
                      d="M11.3164 4.55078C11.3164 7.05078 8.90625 9.10156 5.40234 9.10156C5.29297 9.10156 5.1875 9.09375 5.07812 9.08203C5.00781 9.08203 4.9375 9.10156 4.85156 9.16406C3.97656 9.75 2.58594 10.3516 2.00391 10.3516C1.62891 10.3516 1.53516 10.0547 1.73047 9.80469C1.92578 9.55859 2.37891 9.04297 2.63672 8.60938C2.67969 8.52734 2.65625 8.45312 2.57422 8.41016C0.988281 7.57422 0 6.15625 0 4.55078C0 2.03516 2.51172 0 5.66016 0C8.80469 0 11.3164 2.03516 11.3164 4.55078ZM7.33594 4.58594C7.33594 4.98047 7.65625 5.30078 8.05078 5.30078C8.44531 5.30078 8.76953 4.98047 8.76953 4.58594C8.76953 4.1875 8.44531 3.86719 8.05078 3.86719C7.65625 3.86719 7.33594 4.1875 7.33594 4.58594ZM4.94141 4.58594C4.94141 4.98047 5.26172 5.30078 5.66016 5.30078C6.05469 5.30078 6.375 4.98047 6.375 4.58594C6.375 4.1875 6.05469 3.86719 5.66016 3.86719C5.26172 3.86719 4.94141 4.1875 4.94141 4.58594ZM2.54688 4.58594C2.54688 4.98047 2.87109 5.30078 3.26562 5.30078C3.66016 5.30078 3.98047 4.98047 3.98047 4.58594C3.98047 4.1875 3.65625 3.86719 3.26562 3.86719C2.87109 3.86719 2.54688 4.1875 2.54688 4.58594Z"
                      fill="currentColor"
                      fillOpacity="0.85"
                    />
                  </g>
                </svg>
              </Link>
            ) : (
              <Link href={`/people/${pathId}/settings`}>
                <svg
                  viewBox="0 0 26.4668 26.1094"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-8"
                >
                  <g>
                    <rect
                      height="26.1094"
                      opacity="0"
                      width="26.4668"
                      x="0"
                      y="0"
                    />
                    <path
                      d="M11.8594 26.0977L14.2559 26.0977C15.3398 26.0977 16.2188 25.4062 16.459 24.375L16.8867 22.5117L17.0859 22.4414L18.7148 23.4375C19.6289 23.9941 20.7188 23.8477 21.4863 23.0801L23.1445 21.4395C23.9355 20.6543 24.0469 19.5527 23.4902 18.6562L22.4824 17.0449L22.5527 16.8633L24.4043 16.418C25.4297 16.1777 26.1152 15.293 26.1152 14.2148L26.1152 11.918C26.1152 10.8457 25.4355 9.9668 24.4043 9.71484L22.5645 9.26367L22.4883 9.07031L23.4961 7.45898C24.0527 6.5625 23.9473 5.4668 23.1504 4.67578L21.4922 3.0293C20.7305 2.26758 19.6406 2.10352 18.7266 2.67188L17.0977 3.66797L16.8867 3.58594L16.459 1.72266C16.2188 0.685547 15.3398 0 14.2559 0L11.8594 0C10.7754 0 9.89648 0.697266 9.65625 1.72266L9.22266 3.58594L9.01172 3.66797L7.38867 2.67188C6.47461 2.11523 5.37891 2.26758 4.61719 3.0293L2.96484 4.67578C2.16797 5.4668 2.05664 6.5625 2.61914 7.45898L3.62109 9.07031L3.55078 9.26367L1.71094 9.71484C0.667969 9.97266 0 10.8457 0 11.918L0 14.2148C0 15.293 0.685547 16.1777 1.71094 16.418L3.5625 16.8633L3.62695 17.0449L2.625 18.6562C2.0625 19.5527 2.17969 20.6543 2.9707 21.4395L4.62305 23.0801C5.39062 23.8477 6.48633 23.9941 7.40039 23.4375L9.02344 22.4414L9.22266 22.5117L9.65625 24.375C9.89648 25.4062 10.7754 26.0977 11.8594 26.0977ZM12.334 23.4492C12.1406 23.4492 12.0469 23.3613 12.0176 23.1914L11.3379 20.3379C10.5469 20.1855 9.75586 19.8516 9.07617 19.4062L6.56836 20.9414C6.43359 21.041 6.28711 21.0352 6.16406 20.8945L5.15039 19.8867C5.02148 19.7578 5.02734 19.623 5.10938 19.4824L6.66211 16.9863C6.24609 16.3066 5.91797 15.5391 5.75391 14.748L2.90039 14.0801C2.73047 14.0508 2.64258 13.957 2.64258 13.7637L2.64258 12.3633C2.64258 12.1641 2.72461 12.082 2.90039 12.0469L5.74805 11.373C5.92383 10.5645 6.25781 9.76758 6.65039 9.12891L5.10352 6.63281C5.01562 6.48633 5.00391 6.35156 5.13281 6.2168L6.1582 5.2207C6.28711 5.0918 6.41602 5.08594 6.56836 5.17383L9.05859 6.69141C9.63867 6.31055 10.5176 5.94727 11.3379 5.75391L12.0176 2.90625C12.0469 2.73633 12.1406 2.64844 12.334 2.64844L13.7812 2.64844C13.9746 2.64844 14.0625 2.73633 14.0918 2.90625L14.7832 5.76562C15.6035 5.94727 16.3711 6.28125 17.0449 6.69727L19.5234 5.18555C19.6875 5.09766 19.8047 5.09766 19.9453 5.23242L20.959 6.22852C21.0938 6.36328 21.082 6.49805 20.9941 6.64453L19.459 9.12891C19.8516 9.76172 20.1855 10.5645 20.3555 11.3613L23.2148 12.0469C23.3848 12.082 23.4727 12.1641 23.4727 12.3633L23.4727 13.7637C23.4727 13.957 23.373 14.0508 23.2148 14.0801L20.3496 14.7598C20.1855 15.5332 19.8633 16.3242 19.4473 16.9863L20.9824 19.4707C21.0703 19.6113 21.082 19.7461 20.9473 19.875L19.9395 20.8828C19.8047 21.0234 19.6641 21.0234 19.5234 20.9297L17.0449 19.4062C16.3359 19.8516 15.6387 20.1621 14.7832 20.3379L14.0918 23.1914C14.0625 23.3613 13.9746 23.4492 13.7812 23.4492ZM13.0488 17.4551C15.4863 17.4551 17.4551 15.4863 17.4551 13.0488C17.4551 10.6113 15.4863 8.64258 13.0488 8.64258C10.6172 8.64258 8.64258 10.6113 8.64258 13.0488C8.64258 15.4863 10.6172 17.4551 13.0488 17.4551ZM13.0488 15.0996C11.918 15.0996 10.998 14.1855 10.998 13.0488C10.998 11.9121 11.918 10.998 13.0488 10.998C14.1855 10.998 15.0996 11.9121 15.0996 13.0488C15.0996 14.1855 14.1855 15.0996 13.0488 15.0996Z"
                      fill="currentColor"
                      fillOpacity="0.85"
                    />
                  </g>
                </svg>
              </Link>
            )}
          </div>
        </div>

        <div className="z-2 py-1 px-4 sticky top-0 bg-[rgb(20,20,20)]">
          <div className="opacity-33 font-semibold">
            <div
              className="flex"
              style={{
                marginLeft: 7,
              }}
            >
              {years.map(([year, count]) => (
                <div key={year} style={{ width: columnWidth * count }}>
                  <div className="inline-block sticky left-4 pr-4 font-semibold">
                    {year}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex"
              style={{
                marginLeft: 4,
              }}
            >
              {selectedGroups.map((week) => {
                const { labelValue, label } = getLabels(week[0]);

                return (
                  <div
                    key={labelValue}
                    className="text-center"
                    style={{ width: columnWidth }}
                  >
                    <div>{label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="-my-1 pb-1">
          <BarChart
            data={daysData}
            title={"Days on"}
            tickInterval={2}
            yMax={7}
            scrollContainerId={scrollContainerId}
          />

          <BarChart
            data={timeData}
            title={"Time moving"}
            tickInterval={
              (Math.floor(
                Math.max(
                  ...timeData.flatMap((dataPoint) => [
                    dataPoint.value,
                    dataPoint.goalValue,
                  ]),
                ) /
                  7 /
                  1.25 /
                  30,
              ) || 1) * 30
            }
            valueFormatterType={"toHoursAndMinutes"}
          />

          <BarChart
            data={longData}
            title={"Longest day"}
            tickInterval={
              (Math.floor(
                Math.max(
                  ...longData.flatMap((dataPoint) => [
                    dataPoint.value,
                    dataPoint.goalValue,
                  ]),
                ) /
                  7 /
                  30,
              ) || 1) * 30
            }
            valueFormatterType={"toHoursAndMinutes"}
          />
        </div>

        {demoUrl && (
          <div className="px-4 pb-2 inline-block sticky left-0 bottom-0 w-dvw">
            <div className="flex justify-center">
              <SignupButton
                url={demoUrl}
                className="w-[calc(100dvw-2*16px)] max-w-[400px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bars;

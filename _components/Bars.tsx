type BarsProps = {
  activities: [{ [key: string]: string }];
};

const Bars = ({ activities }: BarsProps) => {
  console.log(activities);

  return <div>{JSON.stringify(activities)}</div>;
};

export default Bars;

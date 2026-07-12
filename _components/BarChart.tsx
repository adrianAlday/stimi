"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export type DataPoint = {
  labelValue: string;
  label: string;
  value: number;
  goalValue: number;
};

type BarChartProps = {
  title: string;
  data: DataPoint[];
  tickInterval: number;
  valueFormatterType?: string;
  scrollContainerId?: string;
};

const BarChart = ({
  title,
  data,
  tickInterval,
  valueFormatterType,
  scrollContainerId,
}: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const maxValue = Math.max(...data.flatMap((d) => [d.value, d.goalValue]));

  const height = 48 + 20 * Math.ceil(maxValue / tickInterval);
  const columnWidth = 48;
  const width = 48 + columnWidth * data.length;

  const margin = { left: 0, top: 40, right: 48, bottom: 12 };

  useEffect(() => {
    if (!svgRef.current || data.length === 0) {
      return;
    }

    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.labelValue))
      .range([0, innerWidth])
      .padding(20 / 100);

    const yScale = d3
      .scaleLinear()
      .domain([0, Math.min(Math.ceil(maxValue / tickInterval) * tickInterval)])
      .range([innerHeight, 0]);

    const xAxis = d3
      .axisBottom(xScale)
      .tickSizeOuter(0)
      .tickFormat(() => "");
    const xAxisGroup = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);
    xAxisGroup.selectAll(".tick line").remove();
    xAxisGroup.select(".domain").remove();
    xAxisGroup
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.33)")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .attr("font-family", "Montserrat");

    const valueFormatter =
      valueFormatterType === "toHoursAndMinutes"
        ? (value: number) => {
            const hours = Math.floor(value / 60);
            const minutes = Math.floor(value % 60);

            return `${hours}:${minutes.toString().padStart(2, "0")}`;
          }
        : (value: number) => value.toLocaleString();

    const yAxis = d3
      .axisRight(yScale)
      .tickSize(0)
      .tickValues(d3.range(0, maxValue + tickInterval, tickInterval))
      .tickFormat((d) => valueFormatter(Number(d)));
    g.append("g")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(yAxis)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll("text")
          .attr("fill", "rgba(255, 255, 255, 0.1)")
          .attr("font-size", "16px")
          .attr("font-weight", "300")
          .attr("font-family", "Montserrat"),
      );

    const yAxisGrid = d3
      .axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickValues(d3.range(0, maxValue + tickInterval, tickInterval));
    g.append("g")
      .attr("class", "grid-lines")
      .call(yAxisGrid)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke-width", 1)
          .attr("stroke", "rgba(255, 255, 255, 0.1)")
          .attr("stroke-dasharray", "4,4"),
      );

    const timeUnit = 1000;
    // time chunks
    // 0-1 scroll and bar sequential delay
    // 1-2 last bar draw
    // 2-3 finish line draw
    // 3-4 goal color change

    const barDrawDelay = 1 * timeUnit;
    const barDrawDelayUnit = barDrawDelay / data.length;
    const barDrawDuration = 1 * timeUnit;

    const lineDrawDelay = 0 * timeUnit;
    const lineDrawDuration = barDrawDelay + barDrawDuration + 1 * timeUnit;

    const goalColorDelay = lineDrawDelay + lineDrawDuration;
    const goalColorDuration = 1 * timeUnit;

    const defs = svg.append("defs");

    // const barColor = "252, 82, 0";
    const barBaseColor = "66, 133, 244";
    const barTopColor = `rgba(${barBaseColor}, 1.0)`;
    const barBottomColor = `rgba(${barBaseColor}, 0.33)`;

    const orangeBarGradient = defs
      .append("linearGradient")
      .attr("id", "orange-bar-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
    orangeBarGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", barBottomColor);
    orangeBarGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", barTopColor);

    const lastBarGradientId = `${title
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase()}-last-bar-gradient`;
    const lastBarGradientIdSelector = `#${lastBarGradientId}`;
    const lastBarGradient = defs
      .append("linearGradient")
      .attr("id", lastBarGradientId)
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
    lastBarGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", barBottomColor);
    lastBarGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", barTopColor);

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.labelValue) as number)
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.value))
      .attr("rx", 8)
      .attr("fill", "url(#orange-bar-gradient)")
      .attr("y", innerHeight)
      .attr("height", 0)
      .transition()
      .delay((_d, index) => index * barDrawDelayUnit)
      .duration(barDrawDuration)
      .ease(d3.easeCubicInOut)
      .attr("y", (d) => yScale(d.value))
      .attr("height", (d) => innerHeight - yScale(d.value));

    const lineGenerator = d3
      .line<(typeof data)[0]>()
      .x((d) => (xScale(d.labelValue) as number) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.goalValue as number))
      .curve(d3.curveMonotoneX);

    const path = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "rgb(15,157,88)")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("d", lineGenerator);

    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .delay(lineDrawDelay)
      .duration(lineDrawDuration)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0);

    const goalEnd = data[data.length - 1];
    const goalEndX =
      (xScale(goalEnd.labelValue) as number) + xScale.bandwidth() / 2 + 12;
    const goalEndY = yScale(goalEnd.goalValue as number);

    const labelGroup = g
      .append("text")
      .attr("opacity", 0)
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .attr("font-family", "Montserrat")
      .attr("fill", "rgb(15,157,88)");

    const labelHeightAboveBar = 8;

    labelGroup
      .append("tspan")
      .text("Goal:")
      .attr("x", goalEndX + 12)
      .attr("y", goalEndY - labelHeightAboveBar - 20);

    labelGroup
      .append("tspan")
      .text(valueFormatter(goalEnd.goalValue as number))
      .attr("x", goalEndX + 12)
      .attr("y", goalEndY - labelHeightAboveBar);

    labelGroup
      .transition()
      .delay(goalColorDelay)
      .duration(goalColorDuration)
      .ease(d3.easeCubicInOut)
      .attr("opacity", 1);

    g.selectAll(".value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .text(0)
      .attr(
        "x",
        (d) => (xScale(d.labelValue) as number) + xScale.bandwidth() / 2,
      )
      .attr("y", innerHeight)
      .attr("opacity", 0)
      .attr("text-anchor", "middle")
      .attr("fill", "rgb(255,255,255)")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .attr("pointer-events", "none")
      .transition()
      .delay((_d, index) => index * barDrawDelayUnit)
      .duration(barDrawDuration)
      .ease(d3.easeCubicInOut)
      .attr("y", (d) => yScale(d.value) - labelHeightAboveBar)
      .attr("opacity", 1)
      .tween("text", (d) => {
        const interpolator = d3.interpolateRound(0, d.value);

        return function (time) {
          this.textContent = valueFormatter(interpolator(time));
        };
      });

    const lastIndex = data.length - 1;
    const lastDataPoint = data[lastIndex];
    const goalMet = lastDataPoint.value >= lastDataPoint.goalValue;

    g.selectAll(".value-label")
      .filter((_d, index) => index === lastIndex)
      .transition()
      .delay(goalColorDelay)
      .duration(goalColorDuration)
      .ease(d3.easeCubicInOut)

      .attr("fill", goalMet ? "rgb(15,157,88)" : "rgb(219,68,55)");

    g.selectAll(".bar")
      .filter((_d, index) => index === lastIndex)
      .attr("fill", `url(${lastBarGradientIdSelector})`);
    defs
      .select(lastBarGradientIdSelector)
      .selectAll("stop")
      .transition()
      .delay(goalColorDelay)
      .duration(goalColorDuration)
      .ease(d3.easeCubicInOut)
      .attr("stop-color", (_d, i) =>
        goalMet
          ? i === 0
            ? "rgba(15,157,88, 0.33)"
            : "rgba(15,157,88, 1.0)"
          : i === 0
            ? "rgba(219,68,55, 0.33)"
            : "rgba(219,68,55, 1.0)",
      );
    if (scrollContainerId) {
      const scrollContainer = document.getElementById(scrollContainerId);
      if (scrollContainer) {
        scrollContainer.scrollTo({
          left: scrollContainer.scrollWidth,
          behavior: "smooth",
        });
      }
    }
  }, []);

  return (
    <div className="my-4 px-4 w-max">
      <div className="inline-block sticky left-4 font-semibold">{title}</div>

      <svg ref={svgRef} height={height} width={width} />
    </div>
  );
};

export default BarChart;

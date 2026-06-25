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
  years: [string, number][];
};

const BarChart = ({
  title,
  data,
  tickInterval,
  valueFormatterType,
  years,
}: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const height =
    48 +
    24 *
      Math.ceil(
        Math.max(...data.map((dataPoint) => dataPoint.value)) / tickInterval,
      );
  const columnWidth = 48;
  const yearsColumnWidth = 47.91;
  const width = 48 + columnWidth * data.length;

  const margin = { left: 0, top: 32, right: 48, bottom: 24 };

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

    const maxValue = Math.max(
      ...data.map((d) => Math.max(d.value, d.goalValue)),
    );

    const yScale = d3
      .scaleLinear()
      .domain([0, Math.min(Math.ceil(maxValue / tickInterval) * tickInterval)])
      .range([innerHeight, 0]);

    const xAxis = d3
      .axisBottom(xScale)
      .tickSizeOuter(0)
      .tickFormat((labelValue) => {
        const dataPoint = data.find((d) => d.labelValue === labelValue);

        return dataPoint ? dataPoint.label : labelValue;
      });

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

    const timeUnit = 700;
    // time chunks
    // 0-1 bar sequential delay
    // 1-2 bar sequential delay
    // 2-3 last bar draw
    // 3-4 finish line draw
    // 4-5 goal color change

    const barDrawDelayUnit = (2 * timeUnit) / data.length;

    const defs = svg.append("defs");

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
      .attr("stop-color", "rgba(252, 82, 0, 0.33)");
    orangeBarGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(252, 82, 0, 1.0)");

    const redBarGradient = defs
      .append("linearGradient")
      .attr("id", "red-bar-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
    redBarGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(219,68,55, 0.33)");
    redBarGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(219,68,55, 1.0)");

    const greenBarGradient = defs
      .append("linearGradient")
      .attr("id", "green-bar-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
    greenBarGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(15,157,88, 0.33)");
    greenBarGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(15,157,88, 1.0)");

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
      .duration(timeUnit)
      .ease(d3.easeCubicOut)
      .delay((_d, index) => index * barDrawDelayUnit)
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
      .duration(timeUnit * 4)
      .ease(d3.easeCubicOut)
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
      .delay(timeUnit * 4)
      .duration(timeUnit)
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
      .duration(timeUnit)
      .ease(d3.easeCubicOut)
      .delay((_d, index) => index * barDrawDelayUnit)
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
      .delay(timeUnit * 4)
      .duration(timeUnit)
      .attr("fill", goalMet ? "rgb(15,157,88)" : "rgb(219,68,55)");

    g.selectAll(".bar")
      .filter((_d, index) => index === lastIndex)
      .transition()
      .delay(timeUnit * 4)
      .duration(timeUnit)
      .attr(
        "fill",
        goalMet ? "url(#green-bar-gradient)" : "url(#red-bar-gradient)",
      );

    window.scrollTo({
      left: document.documentElement.scrollWidth,
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="my-4 px-4 w-max">
      <div className="inline-block sticky left-4 font-semibold">{title}</div>

      <svg ref={svgRef} height={height} width={width} />

      <div
        className="flex opacity-33"
        style={{
          marginLeft: margin.left + 8,
          width: yearsColumnWidth * data.length,
        }}
      >
        {years.map(([year, count]) => (
          <div key={year} style={{ width: yearsColumnWidth * count }}>
            <div className="inline-block sticky left-4 pr-4 font-semibold">
              {year}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;

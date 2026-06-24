"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type BarChartProps = {
  title: string;
  data: { label: string; sublabel?: string; value: number }[];
  tickInterval: number;
};

const BarChart = ({ title, data, tickInterval }: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const height =
    48 +
    24 *
      Math.ceil(
        Math.max(...data.map((dataPoint) => dataPoint.value)) / tickInterval,
      );
  const width = 48 + 48 * data.length;

  const margin = { left: 0, top: 32, right: 48, bottom: 48 };

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
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(20 / 100);

    const maxValue = d3.max(data, (d) => d.value) ?? 0;

    const yScale = d3
      .scaleLinear()
      .domain([0, Math.min(Math.ceil(maxValue / tickInterval) * tickInterval)])
      .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    const xAxisGroup = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);
    xAxisGroup.selectAll(".tick line").remove();
    xAxisGroup.select(".domain").remove();
    xAxisGroup
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "100");
    xAxisGroup.selectAll(".tick").each(function (labelString) {
      const dataPoint = data.find((d) => d.label === labelString);

      if (dataPoint?.sublabel) {
        d3.select(this)
          .append("text")
          .attr("y", 40)
          .style("text-anchor", "middle")
          .attr("fill", "rgb(255,255,255)")
          .attr("font-size", "16px")
          .attr("font-weight", "600")
          .text(dataPoint.sublabel);
      }
    });

    const yAxis = d3
      .axisRight(yScale)
      .tickSize(0)
      .tickValues(d3.range(0, maxValue + tickInterval, tickInterval))
      .tickFormat(d3.format("d"));
    g.append("g")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(yAxis)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll("text")
          .attr("fill", "rgba(255, 255, 255, 0.1)")
          .attr("font-size", "16px")
          .attr("font-weight", "100"),
      );

    const yAxisGrid = d3
      .axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(() => "")
      .tickValues(d3.range(0, maxValue + tickInterval, tickInterval));
    g.append("g")
      .attr("class", "grid-lines")
      .call(yAxisGrid)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", "rgba(255, 255, 255, 0.1)")
          .attr("stroke-dasharray", "4,4"),
      );

    const drawTransitionTime = 700;
    const drawTransitionDelay = 50;

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "bar-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(252, 82, 0, 0.33)");
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(252, 82, 0, 1.0)");

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.label) as number)
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.value))
      .attr("rx", 6)
      .attr("fill", "url(#bar-gradient)")
      .attr("y", innerHeight)
      .attr("height", 0)
      .transition()
      .duration(drawTransitionTime)
      .ease(d3.easeCubicOut)
      .delay((_d, index) => index * drawTransitionDelay)
      .attr("y", (d) => yScale(d.value))
      .attr("height", (d) => innerHeight - yScale(d.value));

    g.selectAll(".value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .text(0)
      .attr("x", (d) => (xScale(d.label) as number) + xScale.bandwidth() / 2)
      .attr("y", innerHeight)
      .attr("opacity", 0)
      .attr("text-anchor", "middle")
      .attr("fill", "rgb(255,255,255)")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .attr("pointer-events", "none")
      .transition()
      .duration(drawTransitionTime)
      .ease(d3.easeCubicOut)
      .delay((_d, index) => index * drawTransitionDelay)
      .attr("y", (d) => yScale(d.value) - 8)
      .attr("opacity", 1)
      .tween("text", (d) => {
        const interpolator = d3.interpolateRound(0, d.value);

        return function (time) {
          this.textContent = interpolator(time) as unknown as string;
        };
      });

    window.scrollTo({
      left: document.documentElement.scrollWidth,
      top: 0,
      behavior: "smooth",
    });
  }, [data]);

  return (
    <div className="my-4 px-4 w-max">
      <div className="inline sticky left-4 font-semibold">{title}</div>

      <svg ref={svgRef} height={height} width={width} />
    </div>
  );
};

export default BarChart;

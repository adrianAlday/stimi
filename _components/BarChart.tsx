"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type BarChartProps = {
  data: { label: string; value: number }[];
  title: string;
  tickInterval: number;
};

const BarChart = ({ data, title, tickInterval }: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const height = 280;
  const width = 50 * data.length;

  useEffect(() => {
    if (!svgRef.current || data.length === 0) {
      return;
    }

    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();

    const margin = { left: 0, top: 32, right: 40, bottom: 24 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(20 / 100);

    const maxValue = d3.max(data, (d) => d.value) ?? 0;

    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .nice()
      .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((g) => g.selectAll(".tick line").remove())
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("font-size", "16px");

    const yAxis = d3
      .axisRight(yScale)
      .tickValues(d3.range(0, maxValue + tickInterval, tickInterval))
      .tickFormat(d3.format("d"));

    g.append("g")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(yAxis)
      .call((g) =>
        g
          .selectAll("text")
          .attr("font-size", "16px")
          .attr("fill", "rgb(255,255,255)"),
      );

    const defaultOpacity = 1.0;
    const hoverOpacity = 0.7;

    const drawTransitionTime = 700;
    const drawTransitionDelay = 50;
    const hoverTransisitonTime = 50;

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
      .attr("fill", "rgb(252, 82, 0)")
      .attr("opacity", defaultOpacity)
      .on("mouseenter", function (_event, _d) {
        d3.select(this)
          .transition()
          .duration(hoverTransisitonTime)
          .attr("opacity", hoverOpacity);
      })
      .on("mouseleave", function (_event, _d) {
        d3.select(this)
          .transition()
          .duration(hoverTransisitonTime)
          .attr("opacity", defaultOpacity);
      })
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
      .text((d) => d.value)
      .attr("x", (d) => (xScale(d.label) as number) + xScale.bandwidth() / 2)
      .attr("y", innerHeight)
      .attr("opacity", 0)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("fill", "rgb(255,255,255)")
      .attr("pointer-events", "none")
      .transition()
      .duration(drawTransitionTime)
      .ease(d3.easeCubicOut)
      .delay((_d, index) => index * drawTransitionDelay)
      .attr("y", (d) => yScale(d.value) - 8)
      .attr("opacity", defaultOpacity);

    window.scrollTo({
      left: document.documentElement.scrollWidth,
      top: 0,
      behavior: "smooth",
    });
  }, [data]);

  return (
    <div className="my-4 px-4 w-max">
      <div className="inline sticky left-4">{title}</div>

      <svg ref={svgRef} height={height} width={width} />
    </div>
  );
};

export default BarChart;

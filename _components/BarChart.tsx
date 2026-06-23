"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type BarChartProps = {
  data: { label: string; value: number }[];
  yAxisLabel: string;
  yAxisTickInterval: number;
};

const BarChart = ({ data, yAxisLabel, yAxisTickInterval }: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const width = 50 * data.length;
    const height = 400;
    const margin = { top: 32, right: 16, bottom: 32, left: 64 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) ?? 0])
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

    const maxValue = d3.max(data, (d) => d.value) ?? 0;

    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(d3.range(0, maxValue + yAxisTickInterval, yAxisTickInterval))
      .tickFormat(d3.format("d"));

    g.append("g")
      .call(yAxis)
      .call((g) =>
        g
          .selectAll("text")
          .attr("font-size", "16px")
          .attr("fill", "rgb(255,255,255)"),
      )
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 16)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "rgb(255,255,255)")
      .attr("font-size", "16px")
      .text(yAxisLabel);

    const defaultOpacity = 1.0;
    const drawTransitionTime = 800;
    const drawTransitionDelay = 100;
    const hoverTransisitonTime = 100;

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
          .attr("opacity", 0.7);
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
      .attr("opacity", 1);
  }, [data]);

  return (
    <div className="w-full p-4 relative">
      <svg ref={svgRef} />
    </div>
  );
};

export default BarChart;

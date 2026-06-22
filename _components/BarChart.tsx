"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type BarChartProps = {
  data: { label: string; value: number }[];
  yAxisLabel: string;
  yAxisTickInterval: number;
  yAxisUnit: string;
};

const BarChart = ({
  data,
  yAxisLabel,
  yAxisTickInterval,
  yAxisUnit,
}: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const width = 50 * data.length;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
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

    const xAxis = d3.axisBottom(xScale);
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "middle");

    const maxValue = d3.max(data, (d) => d.value) ?? 0;

    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(d3.range(0, maxValue + yAxisTickInterval, yAxisTickInterval))
      .tickFormat(d3.format("d"));

    g.append("g")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 10)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "rgb(255,255,255)")
      .attr("font-size", "12px")
      .text(yAxisLabel);

    const tooltip = d3.select(tooltipRef.current);

    const clickLabel = g
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "rgb(255,255,255)")
      .attr("opacity", 0)
      .attr("pointer-events", "none");

    const defaultOpacity = 1.0;

    const bars = g
      .selectAll(".bar")
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
        d3.select(this).transition().duration(200).attr("opacity", 0.7);

        tooltip.style("opacity", 1).style("visibility", "visible");
      })
      .on("mousemove", function (event, d) {
        const [x, y] = d3.pointer(event, svgRef.current);

        tooltip
          .html(
            `<strong>${d.label}</strong>: ${d.value} ${yAxisUnit}${d.value === 1 ? "" : "s"}`,
          )
          .style("left", `${x + 15}px`)
          .style("top", `${y - 15}px`);
      })
      .on("mouseleave", function (_event, _d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", defaultOpacity);

        tooltip.style("opacity", 0).style("visibility", "hidden");
      })
      .on("click", function (_event, d) {
        const xPos = (xScale(d.label) as number) + xScale.bandwidth() / 2;

        const yPos = yScale(d.value) - 10;

        clickLabel
          .text(d.value)
          .attr("x", xPos)
          .attr("y", yPos + 10)
          .transition()
          .duration(200)
          .attr("y", yPos)
          .attr("opacity", 1);
      });

    bars
      .attr("y", innerHeight)
      .attr("height", 0)
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .delay((_d, index) => index * 100)
      .attr("y", (d) => yScale(d.value))
      .attr("height", (d) => innerHeight - yScale(d.value));
  }, [data]);

  return (
    <div className="w-full p-4 relative">
      <svg ref={svgRef} />

      <div
        ref={tooltipRef}
        className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded shadow-lg pointer-events-none"
        style={{
          opacity: 0,
          visibility: "hidden",
          transition: "opacity 0.2s",
        }}
      />
    </div>
  );
};

export default BarChart;

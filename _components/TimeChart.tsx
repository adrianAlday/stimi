"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type TimeChartProps = {
  data: {
    label: string;
    value: number;
  }[];
};

const TimeChart = ({ data }: TimeChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = (400 / 8) * data.length - margin.left - margin.right;
    const height = 600 / 2 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .range([height, 0]);

    const yAxis = d3.axisLeft(y).ticks(7).tickFormat(d3.format("d"));
    svg.append("g").call(yAxis).classed("text-gray-500 text-xs");

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#4b5563")
      .text("Moving minutes per week")
      .classed("text-xs font-medium");

    const tooltip = d3.select(tooltipRef.current);

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.label) || 0)
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.value))
      .attr("fill", "#3b82f6")
      .attr("rx", 4)
      .attr("y", height)
      .attr("height", 0)
      .on("mouseover", function (_event, d) {
        d3.select(this).attr("opacity", 0.85);
        tooltip
          .style("opacity", 1)
          .html(`${d.value} min${d.value === 1 ? "" : "s"}`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.layerX + 15}px`)
          .style("top", `${event.layerY - 40}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("opacity", 1);
        tooltip.style("opacity", 0);
      })
      .on("click", function (_event, d) {
        const parentGroup = d3.select(this.parentNode as SVGGElement);
        const hasLabel = !parentGroup.select("text.bar-label").empty();

        svg.selectAll("text.bar-label").remove();
        svg.selectAll("rect").attr("fill", "#3b82f6");

        if (!hasLabel) {
          d3.select(this).attr("fill", "#2563eb");
          parentGroup
            .append("text")
            .attr("class", "bar-label")
            .attr(
              "x",
              parseFloat(d3.select(this).attr("x")) + x.bandwidth() / 2,
            )
            .attr("y", y(d.value) - 8)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "600")
            .style("fill", "#1f2937")
            // .text(d);
            .html(`${d.value} min${d.value === 1 ? "" : "s"}`);
        }
      })
      .transition()
      .ease(d3.easeCubicOut)
      .duration(800)
      .delay((_, index) => index * 50)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => height - y(d.value));
  });

  return (
    <div>
      <div
        ref={tooltipRef}
        className="absolute z-10 pointer-events-none bg-gray-900 text-white text-xs rounded px-2.5 py-1.5 opacity-0 transition-opacity duration-150 shadow-md font-sans"
        style={{ transform: "translate(-50%, -50%)" }}
      />

      <svg ref={svgRef} />
    </div>
  );
};

export default TimeChart;

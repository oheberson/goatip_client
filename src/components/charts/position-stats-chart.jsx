"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { positionChartConfig } from "./chart-utils";

export function PositionStatsChart({ data }) {
  return (
    <ChartContainer
      config={positionChartConfig}
      className="min-h-[200px] h-[400px] w-full"
    >
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="averageScore"
          tickFormatter={(value) => value.toFixed(1)}
        />
        <YAxis
          type="category"
          dataKey="position"
          width={50}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => [
                `${value.toFixed(2)} pontos`,
                "Média por Posição",
              ]}
              labelFormatter={(label) => `Posição: ${label}`}
            />
          }
        />
        <Bar
          dataKey="averageScore"
          fill="var(--color-averageScore)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

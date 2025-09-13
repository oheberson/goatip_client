"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Shield, ChevronsUp } from "lucide-react";
import { STAT_CATEGORIES } from "@/lib/constants";

const CATEGORY_CONFIG = {
  attacking: {
    name: "Ataque",
    icon: Target,
    color: "hsl(var(--primary))",
  },
  defensive: {
    name: "Defesa",
    icon: Shield,
    color: "hsl(var(--primary))",
  },
  gameplay: {
    name: "Jogo",
    icon: ChevronsUp,
    color: "hsl(var(--primary))",
  },
};

const chartConfig = {
  categoryScore: {
    label: "Pontos da Categoria",
    color: "hsl(var(--primary))",
  },
};

export function Top10PlayersChart({ players }) {
  const [selectedCategory, setSelectedCategory] = useState("attacking");

  // Get current category config first
  const currentCategory = CATEGORY_CONFIG[selectedCategory];

  // Calculate category scores for each player
  const playersWithCategoryScores = players.map((player) => {
    const categoryScore = STAT_CATEGORIES[selectedCategory].stats.reduce(
      (sum, statName) => {
        return sum + (player[statName] || 0);
      },
      0
    );

    return {
      ...player,
      categoryScore,
      displayName:
        player.player.length > 15
          ? `${player.player.substring(0, 12)}...`
          : player.player,
    };
  });

  // Get top 10 players for selected category
  const top10Players = playersWithCategoryScores
    .sort((a, b) => b.categoryScore - a.categoryScore)
    .slice(0, 10);

  // Prepare chart data (keep original order - highest scores first)
  const chartData = top10Players.map((player, index) => ({
    rank: index + 1,
    player: player.displayName,
    team: player.team,
    position: player.pos,
    categoryScore: player.categoryScore,
    fullName: player.player,
  }));

  // Dynamic chart config based on selected category
  const dynamicChartConfig = {
    categoryScore: {
      label: "Pontos da Categoria",
      color: currentCategory.color,
    },
  };

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(CATEGORY_CONFIG).map(([key, category]) => {
          const Icon = category.icon;
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Chart */}
      <ChartContainer
        config={dynamicChartConfig}
        className="min-h-[200px] h-[400px] w-full"
      >
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, "dataMax"]}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <YAxis
            type="category"
            dataKey="player"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => value}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => [
                  `${value.toFixed(0)} pontos`,
                  currentCategory.name,
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="space-y-1">
                        <div className="font-semibold">{data.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.team} • {data.position}
                        </div>
                      </div>
                    );
                  }
                  return label;
                }}
              />
            }
          />
          <Bar
            dataKey="categoryScore"
            fill="hsl(var(--primary))"
            radius={[0, 4, 4, 0]}
          >
            <LabelList
              dataKey="team"
              position="insideLeft"
              offset={8}
              fill="#fff"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

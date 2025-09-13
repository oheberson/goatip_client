"use client";

import { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Target, Shield, ChevronsUp } from "lucide-react";
import { STAT_CATEGORIES, STATS_MAP } from "@/lib/constants";

const RADAR_CATEGORY_CONFIG = {
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

// Available positions (excluding GK)
const POSITIONS = ["ATA", "MEI", "ZAG", "LAT"];

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
};

export function PositionRadarChart({ players }) {
  const [selectedCategory, setSelectedCategory] = useState("attacking");

  // Get current category config first
  const currentCategory = RADAR_CATEGORY_CONFIG[selectedCategory];

  // Function to format stat names for display
  const formatStatName = (statName) => {
    const translatedStatName = STATS_MAP[statName];
    return translatedStatName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Function to calculate radar data for a specific position
  const calculatePositionRadarData = (position) => {
    const positionPlayers = players.filter((player) => player.pos === position);

    if (positionPlayers.length === 0) {
      return [];
    }

    const categoryStats = STAT_CATEGORIES[selectedCategory].stats;

    const radarData = categoryStats.map((statName) => {
      let totalStat = 0;

      // Special handling for team_total_goals_conceded to avoid double counting
      if (statName === "team_total_goals_conceded") {
        // Group by team and sum only once per team
        const teamGroups = {};
        positionPlayers.forEach((player) => {
          if (!teamGroups[player.team]) {
            teamGroups[player.team] = player[statName] || 0;
          }
        });
        totalStat = Object.values(teamGroups).reduce((sum, teamGoals) => sum + teamGoals, 0);
      } else {
        // Normal stat - sum all players
        totalStat = positionPlayers.reduce((sum, player) => {
          return sum + (player[statName] || 0);
        }, 0);
      }

      return {
        stat: formatStatName(statName),
        total: totalStat,
        fullStatName: statName,
      };
    });

    return radarData;
  };

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(RADAR_CATEGORY_CONFIG).map(([key, category]) => {
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

      <div className="w-full p-6">
        <Carousel className="w-full">
          <CarouselContent>
            {POSITIONS.map((position, index) => {
              const radarData = calculatePositionRadarData(position);

              return (
                <CarouselItem key={position}>
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        Posição: {position}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {`${index + 1}/${POSITIONS.length}`}
                      </p>
                    </div>

                    {/* Radar Chart */}
                    <ChartContainer
                      config={chartConfig}
                      className="h-[400px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis
                            dataKey="stat"
                            tick={{ fontSize: 12 }}
                          />

                          <Radar
                            name="Total"
                            dataKey="total"
                            stroke="var(--color-total)"
                            fill="var(--color-total)"
                            fillOpacity={0.3}
                            strokeWidth={2}
                            dot={{ r: 2 }}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value, name) => [
                                  `${value.toFixed(0)}`,
                                  "Total",
                                ]}
                                labelFormatter={(label) =>
                                  `Estatística: ${label}`
                                }
                              />
                            }
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartContainer>

                    {/* Position Stats Summary */}
                    <div className="text-center text-sm text-muted-foreground">
                      {radarData.length > 0 ? (
                        <p>
                          {players.filter((p) => p.pos === position).length}{" "}
                          jogador(es) {position}
                        </p>
                      ) : (
                        <p>Nenhum jogador encontrado para esta posição</p>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}

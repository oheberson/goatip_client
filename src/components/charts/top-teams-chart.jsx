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
import { Target, Shield, ChevronsUp, Trophy } from "lucide-react";
import { STAT_CATEGORIES } from "@/lib/constants";

const TEAM_CATEGORY_CONFIG = {
  general: {
    name: "Geral",
    icon: Trophy,
    color: "hsl(var(--primary))",
  },
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
  teamScore: {
    label: "Pontos do Time",
    color: "hsl(var(--primary))",
  },
};

export function TopTeamsChart({ players }) {
  const [selectedCategory, setSelectedCategory] = useState("general");

  // Get current category config first
  const currentCategory = TEAM_CATEGORY_CONFIG[selectedCategory];

  // Group players by team
  const teamGroups = {};
  players.forEach((player) => {
    const team = player.team;
    if (!teamGroups[team]) {
      teamGroups[team] = [];
    }
    teamGroups[team].push(player);
  });

  // Calculate team scores for each category
  const teamsWithScores = Object.entries(teamGroups).map(
    ([teamName, teamPlayers]) => {
      let teamScore = 0;
      let playerCount = teamPlayers.length;

      if (selectedCategory === "general") {
        // For "Geral" category, use weighted_fantasy_score average
        teamScore =
          teamPlayers.reduce(
            (sum, player) => sum + (player.weighted_fantasy_score || 0),
            0
          ) / playerCount;
      } else {
        // For specific categories, sum all category stats for all players
        const categoryStats = STAT_CATEGORIES[selectedCategory].stats;
        teamScore = teamPlayers.reduce((sum, player) => {
          const playerCategoryScore = categoryStats.reduce(
            (playerSum, statName) => {
              return playerSum + (player[statName] || 0);
            },
            0
          );
          return sum + playerCategoryScore;
        }, 0);
      }

      return {
        team: teamName,
        score: teamScore,
        playerCount: playerCount,
        displayName:
          teamName.length > 12 ? `${teamName.substring(0, 10)}...` : teamName,
      };
    }
  );

  // Sort teams with balanced ranking (player count first, then score)
  const chartData = teamsWithScores
    .sort((a, b) => {
      // First priority: Player count (more players = better)
      if (b.playerCount !== a.playerCount) {
        return b.playerCount - a.playerCount;
      }
      // Second priority: Score (higher score = better)
      return b.score - a.score;
    })
    .map((team, index) => ({
      rank: index + 1,
      team: team.displayName,
      fullName: team.team,
      score: team.score,
      playerCount: team.playerCount,
    }));

  // Dynamic chart config based on selected category
  const dynamicChartConfig = {
    teamScore: {
      label: selectedCategory === "general" ? "Pontos Médios" : "Pontos Totais",
      color: currentCategory.color,
    },
  };

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(TEAM_CATEGORY_CONFIG).map(([key, category]) => {
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

      <p className="text-muted-foreground text-xs">
        *Times com mais jogadores dentro do ranking têm prioridade
      </p>

      {/* Chart */}
      <ChartContainer
        config={dynamicChartConfig}
        className="min-h-[200px] h-[800px] w-full"
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
            dataKey="team"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => value}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => [
                  `${value.toFixed(2)} pontos`,
                  selectedCategory === "general"
                    ? "Média Geral"
                    : currentCategory.name,
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="space-y-1">
                        <div className="font-semibold">{data.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.playerCount} jogadores
                        </div>
                      </div>
                    );
                  }
                  return label;
                }}
              />
            }
          />
          <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
            <LabelList
              dataKey="rank"
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

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function TipsWeeklyChart({
  tip,
  type = "teams",
  mode: externalMode,
  onModeChange,
}) {
  const { isSubscribed, isFreeTrial } = useAuth();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [altLine, setAltLine] = useState(tip?.average || 0);
  const [internalMode, setInternalMode] = useState("over"); // "over" or "under"

  // Use external mode if provided, otherwise use internal
  const mode = externalMode !== undefined ? externalMode : internalMode;
  const setMode = onModeChange || setInternalMode;

  useEffect(() => {
    if (!tip) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const playerName = type === "players" ? tip.player : null;
        const data = await api.tips.getTeamStatByWeek(
          tip.tournament,
          tip.team,
          tip.variable,
          playerName,
          isSubscribed,
          isFreeTrial
        );
        setChartData(data);
        // Initialize alt line with tip average if available, otherwise calculate from data
        if (data?.data && data.data.length > 0) {
          const avg =
            tip?.average ||
            data.data.reduce((sum, item) => sum + item.total, 0) /
              data.data.length;
          setAltLine(avg);
        } else if (tip?.average) {
          setAltLine(tip.average);
        }
      } catch (err) {
        console.error("Failed to fetch weekly stats:", err);
        setError("Falha ao carregar dados do gráfico");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tip, type, isSubscribed, isFreeTrial]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!chartData?.data || chartData.data.length === 0) {
      return {
        average: 0,
        overCount: 0,
        underCount: 0,
        total: 0,
        overPercentage: 0,
        underPercentage: 0,
      };
    }

    const total = chartData.data.reduce((sum, item) => sum + item.total, 0);
    const average = total / chartData.data.length;
    const overCount = chartData.data.filter(
      (item) => item.total > altLine
    ).length;
    const underCount = chartData.data.filter(
      (item) => item.total < altLine
    ).length;
    const overPercentage = (overCount / chartData.data.length) * 100;
    const underPercentage = (underCount / chartData.data.length) * 100;

    return {
      average,
      overCount,
      underCount,
      total: chartData.data.length,
      overPercentage,
      underPercentage,
    };
  }, [chartData, altLine]);

  // Prepare chart data with colors based on mode and alt line
  const chartDataWithColors = useMemo(() => {
    if (!chartData?.data) return [];

    return chartData.data.map((item, index) => {
      const isOver = item.total > altLine;
      const isUnder = item.total < altLine;

      // Determine color based on mode
      let color;
      if (mode === "over") {
        color = isOver ? "#10b981" : "#f87171"; // green for over, salmon for under
      } else {
        color = isUnder ? "#10b981" : "#f87171"; // green for under, salmon for over
      }

      return {
        ...item,
        weekDisplay: `Sem ${item.week}`, // For display on X-axis
        weekNumber: item.week, // Original week number for tooltip
        color,
      };
    });
  }, [chartData, altLine, mode]);

  // Calculate Y-axis domain
  const yAxisDomain = useMemo(() => {
    if (!chartData?.data || chartData.data.length === 0) return [0, 10];

    const maxValue = Math.max(...chartData.data.map((item) => item.total));
    const minValue = Math.min(...chartData.data.map((item) => item.total));

    // Add some padding
    const padding = Math.max(1, Math.ceil(maxValue * 0.1));
    const max = Math.ceil(maxValue + padding);
    const min = Math.max(0, Math.floor(minValue - padding));

    // Round to nice numbers
    const step = max <= 10 ? 1 : max <= 30 ? 5 : 10;
    const roundedMax = Math.ceil(max / step) * step;

    return [min, roundedMax];
  }, [chartData]);

  // Calculate slider range based on actual data, not y-axis domain
  const sliderMin = useMemo(() => {
    if (!chartData?.data || chartData.data.length === 0) return 0;
    const min = Math.min(...chartData.data.map((item) => item.total));
    return Math.max(0, Math.floor(min * 0.5));
  }, [chartData]);

  const sliderMax = useMemo(() => {
    if (!chartData?.data || chartData.data.length === 0) return 10;
    const max = Math.max(...chartData.data.map((item) => item.total));
    return Math.ceil(max * 1.5);
  }, [chartData]);

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !chartData) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            {error || "Sem dados disponíveis"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const minValue = Math.max(0, Math.floor(yAxisDomain[0]));
  const maxValue = Math.ceil(yAxisDomain[1]);
  const step = maxValue <= 10 ? 1 : maxValue <= 30 ? 5 : 10;

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        {/* Chart */}
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={chartDataWithColors}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted-foreground))"
                opacity={0.2}
              />
              <XAxis
                dataKey="weekDisplay"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                domain={yAxisDomain}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                ticks={Array.from(
                  { length: Math.floor((maxValue - minValue) / step) + 1 },
                  (_, i) => minValue + i * step
                )}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm p-3 shadow-lg">
                        <div className="space-y-2">
                          <div className="font-semibold text-sm">
                            Semana {data.weekNumber || data.week}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Total:{" "}
                            </span>
                            <span className="font-medium">{data.total}</span>
                          </div>
                          {data.opponent && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Adversário:{" "}
                              </span>
                              <span className="font-medium">
                                {data.opponent}
                              </span>
                            </div>
                          )}
                          {data.is_home !== undefined && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Mando:{" "}
                              </span>
                              <span className="font-medium">
                                {data.is_home ? "Em casa" : "Fora"}
                              </span>
                            </div>
                          )}
                          {data.min !== undefined && data.min !== null && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Minutos:{" "}
                              </span>
                              <span className="font-medium">{data.min}</span>
                            </div>
                          )}
                          {data.is_starter !== undefined && data.is_starter !== null && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Titular:{" "}
                              </span>
                              <span className="font-medium">
                                {data.is_starter === 1 || data.is_starter === true ? "Sim" : "Não"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              />
              <ReferenceLine
                y={stats.average}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                opacity={0.5}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartDataWithColors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <ReferenceLine
                y={altLine}
                stroke="white"
                strokeWidth={2}
                label={{
                  value: `${altLine.toFixed(1)}`,
                  position: "top",
                  fill: "white",
                  fontSize: 11,
                  offset: 5,
                }}
                isFront={true}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Line Section */}
        <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Histórico de Média
              </p>
              <p className="text-lg font-bold">{stats.average.toFixed(1)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">
                {mode === "over" ? "Over Win %" : "Under Win %"}
              </p>
              <p className="text-lg font-bold">
                {mode === "over" ? stats.overCount : stats.underCount}/
                {stats.total} (
                {mode === "over"
                  ? stats.overPercentage.toFixed(1)
                  : stats.underPercentage.toFixed(1)}
                %)
              </p>
            </div>
          </div>
        </div>

        {/* Alternate Line Slider Section */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Alt. Line</p>
              <p className="text-lg font-bold">{altLine.toFixed(1)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">
                {mode === "over" ? "Over Win %" : "Under Win %"}
              </p>
              <p className="text-lg font-bold">
                {mode === "over" ? stats.overCount : stats.underCount}/
                {stats.total} (
                {mode === "over"
                  ? stats.overPercentage.toFixed(1)
                  : stats.underPercentage.toFixed(1)}
                %)
              </p>
            </div>
          </div>
          <div className="mb-2">
            <Slider
              value={altLine}
              onValueChange={setAltLine}
              min={sliderMin}
              max={sliderMax}
              step={0.5}
            />
          </div>
          <div className="flex justify-center">
            <Button
              variant={mode === "over" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("over")}
              className="mr-2"
            >
              Over
            </Button>
            <Button
              variant={mode === "under" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("under")}
            >
              Under
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

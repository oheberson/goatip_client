"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  STATS_MAP,
  TOURNAMENTS_MAP_NAMES,
  PLAYER_STATS_THRESHOLDS,
} from "@/lib/constants";
import { TrendingUp, TrendingDown, X } from "lucide-react";
import { Questions } from "@/components/questions";
import { TipsWeeklyChart } from "@/components/tips-weekly-chart";

function LikelihoodTag({ value, label }) {
  // Convert value to percentage for color calculation
  const percentage = value * 100;
  const decimalOdds = (1 / value).toFixed(2);

  // Determine color based on likelihood value
  let bgColor, textColor, borderColor;

  if (percentage >= 90) {
    // Very high likelihood - bright green
    bgColor = "bg-green-100 dark:bg-green-900/20";
    textColor = "text-green-800 dark:text-green-200";
    borderColor = "border-green-300 dark:border-green-700";
  } else if (percentage >= 80) {
    // High likelihood - green
    bgColor = "bg-green-50 dark:bg-green-900/10";
    textColor = "text-green-700 dark:text-green-300";
    borderColor = "border-green-200 dark:border-green-800";
  } else if (percentage >= 70) {
    // Good likelihood - yellow-green
    bgColor = "bg-yellow-100 dark:bg-yellow-900/20";
    textColor = "text-yellow-800 dark:text-yellow-200";
    borderColor = "border-yellow-300 dark:border-yellow-700";
  } else if (percentage >= 60) {
    // Moderate likelihood - yellow
    bgColor = "bg-yellow-50 dark:bg-yellow-900/10";
    textColor = "text-yellow-700 dark:text-yellow-300";
    borderColor = "border-yellow-200 dark:border-yellow-800";
  } else {
    // Low likelihood - red
    bgColor = "bg-red-50 dark:bg-red-900/10";
    textColor = "text-red-700 dark:text-red-300";
    borderColor = "border-red-200 dark:border-red-800";
  }

  return (
    <div
      className={`flex flex-col text-xs items-center gap-2 px-3 py-2 rounded-lg border ${bgColor} ${textColor} ${borderColor}`}
    >
      <div className="flex justify-center items-center w-full flex-row gap-2 mx-4">
        <span className="text-xs font-bold">{`${label} ${percentage.toFixed(
          0
        )}%`}</span>
      </div>
      <div className="flex justify-center items-center w-full">
        <span className="text-sm font-bold">{decimalOdds}</span>
      </div>
    </div>
  );
}

export function TipsDrawer({ tip, isOpen, onClose, type = "teams" }) {
  const [mode, setMode] = useState("over"); // "over" or "under"

  if (!tip) return null;

  const formatStatName = (statName) => {
    const translatedStatName = STATS_MAP[statName];
    return translatedStatName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const overTips = tip.next_match_over_likelihood || {};
  const underTips = tip.next_match_under_likelihood || {};

  const overTipsArray = Object.entries(overTips).map(([line, likelihood]) => ({
    line,
    likelihood,
  }));

  const underTipsArray = Object.entries(underTips).map(
    ([line, likelihood]) => ({
      line,
      likelihood,
    })
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-bold">
              {type === "teams" ? tip.team : tip.player}
            </DrawerTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {formatStatName(tip.variable)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {type === "teams"
                ? TOURNAMENTS_MAP_NAMES[tip.tournament]
                : tip.team}
            </span>
            <Questions
              questionsText={[
                "As odds apresentadas são com base na probabilidade calculada. O método utilizado é a Distribuição de Poisson com base na média então ponderado pela frequência da ocorrência da estatística.",
                "Você encontrará valor quando houver discrepância entre a odd apresentada aqui e pela casa de apostas.",
              ]}
            />
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4 flex-1 overflow-y-auto">
          {/* Tips List - Only for teams */}
          {type == "teams" && (
            <div className="space-y-4">
              <div>
                <h3 className={`font-semibold mb-3 ${
                  mode === "over" 
                    ? "text-green-700 dark:text-green-300" 
                    : "text-red-700 dark:text-red-300"
                }`}>
                  {mode === "over" ? "Dicas Over" : "Dicas Under"}
                </h3>
                {(mode === "over" ? overTipsArray : underTipsArray).length > 0 ? (
                  <div className="space-y-3">
                    {(mode === "over" ? overTipsArray : underTipsArray).map((tipItem, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                Linha: {tipItem.line}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {mode === "over" ? "Over" : "Under"} {tipItem.line}{" "}
                                {formatStatName(tip.variable).toLowerCase()}
                              </p>
                            </div>
                            <LikelihoodTag
                              value={tipItem.likelihood}
                              label="Probabilidade"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      {mode === "over" ? (
                        <>
                          <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            Nenhuma dica over disponível
                          </p>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            Nenhuma dica under disponível
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          {/* Opponent's Info */}
          {type == "teams" && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">
                  Informações sobre o adversário
                </h4>
                <div className="flex flex-col text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      Quando {tip.is_home ? "jogando fora" : "em casa"} os
                      oponentes de {tip.opponent} têm em média
                    </p>
                    <div className="flex">
                      <p className="font-black">
                        {tip.opponent_avg_against?.toFixed(1)}
                      </p>
                      &nbsp;
                      <p>{formatStatName(tip.variable)}</p>
                    </div>
                  </div>
                  <br />
                  <div>
                    <p className="text-muted-foreground">
                      A média de {tip.team}{" "}
                      {tip.is_home ? "em casa" : "jogando fora"} é
                    </p>
                    <div className="flex">
                      <p className="font-black">{tip.average.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Informações Adicionais</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Máximo</p>
                  <p className="font-medium">{tip.max}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mínimo</p>
                  <p className="font-medium">{tip.min}</p>
                </div>
                {type == "players" && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Jogos nesse mando</p>
                      <p className="font-medium">
                        {tip.player_total_games} (
                        {(tip.player_presence * 100).toFixed(2)}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {`Jogos de ${tip.team} nesse mando`}
                      </p>
                      <p className="font-medium">
                        {tip.team_total_games_this_mando}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        Linha mínima analisada
                      </p>
                      <p className="font-medium">
                        {`>= ${PLAYER_STATS_THRESHOLDS[tip.variable]}`}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Stats Chart */}
          <TipsWeeklyChart tip={tip} type={type} mode={mode} onModeChange={setMode} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

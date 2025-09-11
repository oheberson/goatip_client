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
import { STAT_CATEGORIES } from "@/lib/constants";
import { Target, Shield, ChevronsUp } from "lucide-react";

const ICON_MAP = {
  Target,
  Shield,
  ChevronsUp,
};

export function PlayerStatsDrawer({ player, isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState("attacking");

  if (!player) return null;

  const formatStatName = (statName) => {
    return statName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatValue = (statName) => {
    return player[statName]?.toFixed(1) || "0.0";
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="text-xl font-bold">
            {player.player}
          </DrawerTitle>
          <div className="flex justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{player.team}</span>
              <Badge variant="secondary">{player.pos}</Badge>
              <Badge>{player.weighted_fantasy_score?.toFixed(1)}</Badge>
            </div>

            <p className="text-muted-foreground text-xs">Últ. 8 Rodadas</p>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4">
          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {Object.entries(STAT_CATEGORIES).map(([key, category]) => {
              const Icon = ICON_MAP[category.icon];
              return (
                <Button
                  key={key}
                  variant={activeCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(key)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {STAT_CATEGORIES[activeCategory].stats.map((statName) => (
              <div
                key={statName}
                className="text-center p-3 bg-muted/50 rounded-lg"
              >
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {formatStatName(statName)}
                </div>
                <div className="text-lg font-bold">
                  {getStatValue(statName)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

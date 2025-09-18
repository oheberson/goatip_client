"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowDownUp } from "lucide-react";
import { STATS_MAP } from "@/lib/constants";

const SORTABLE_STATS = [
  "weighted_fantasy_score",
  "games_played",
  "goals",
  "assists",
  "off_target_shot",
  "saved_shot",
  "woodwork_shot",
  "tackles",
  "interceptions",
  "saves",
  "goals_against",
  "team_total_goals_conceded",
  "fouls_commited",
  "fouls_drawn",
  "yellow_cards",
  "red_cards",
  "offsides",
  "penalties_lost",
  "penalties_saved",
  "wrong_passes",
];

export function PlayerSortDialog({ 
  isOpen, 
  onOpenChange, 
  currentSort, 
  onSortChange 
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const dialogOpen = isOpen !== undefined ? isOpen : internalOpen;
  const setDialogOpen = onOpenChange || setInternalOpen;

  const handleSortSelect = (sortKey) => {
    onSortChange(sortKey);
    setDialogOpen(false);
  };

  const hasActiveSort = () => {
    return currentSort !== "weighted_fantasy_score" && currentSort !== null;
  };

  const formatStatName = (statName) => {
    const translatedStatName = STATS_MAP[statName];
    return translatedStatName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // If no isOpen prop is provided, render as trigger button (old interface)
  if (isOpen === undefined) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-2 ${
              hasActiveSort() ? "border-primary bg-primary/5" : ""
            }`}
          >
            <ArrowDownUp className="w-4 h-4" />
            Ordenar
            {hasActiveSort() && (
              <div className="w-2 h-2 bg-primary rounded-full ml-1" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ordenar por</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {SORTABLE_STATS.map((statKey) => (
              <Button
                key={statKey}
                variant={currentSort === statKey ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleSortSelect(statKey)}
              >
                {formatStatName(statKey) || statKey}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Controlled dialog interface (new interface)
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ordenar por</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {SORTABLE_STATS.map((statKey) => (
            <Button
              key={statKey}
              variant={currentSort === statKey ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleSortSelect(statKey)}
            >
              {formatStatName(statKey) || statKey}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

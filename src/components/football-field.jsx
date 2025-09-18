"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTeamColors } from "@/lib/constants";
import { formatPlayerName } from "../lib/utils";

// Formation configurations
const FORMATION_CONFIGS = {
  "4-3-3": { defense: 4, midfield: 3, attack: 3 },
  "4-4-2": { defense: 4, midfield: 4, attack: 2 },
  "3-4-3": { defense: 3, midfield: 4, attack: 3 },
  "4-5-1": { defense: 4, midfield: 5, attack: 1 },
  "3-5-2": { defense: 3, midfield: 5, attack: 2 },
  "5-3-2": { defense: 5, midfield: 3, attack: 2 },
  "5-4-1": { defense: 5, midfield: 4, attack: 1 },
};

// Position types
const POSITION_TYPES = {
  GOL: "Goalkeeper",
  ZAG: "Defender",
  LAT: "Lateral",
  MEI: "Midfielder",
  ATA: "Attacker",
};

export function FootballField({
  formation,
  selectedPlayers = {},
  onPositionClick,
  onRemovePlayer,
  playersData = null,
  benchPlayers = {},
  onBenchClick,
  onRemoveBenchPlayer,
}) {
  const [hoveredPosition, setHoveredPosition] = useState(null);

  // Get formation configuration
  const config = FORMATION_CONFIGS[formation] || FORMATION_CONFIGS["4-3-3"];

  // Calculate position limits
  const getPositionLimits = () => {
    const limits = {
      GOL: 1,
      ZAG: 0,
      LAT: 0,
      MEI: config.midfield,
      ATA: config.attack,
    };

    if (config.defense >= 4) {
      limits.ZAG = 2; // Center backs
      limits.LAT = 2; // Laterals
    } else {
      limits.ZAG = config.defense; // Only center backs
    }

    return limits;
  };

  const positionLimits = getPositionLimits();

  // Get bench position limits based on formation
  const getBenchLimits = () => {
    const benchLimits = {
      GOL: 1,
      ZAG: 1,
      LAT: 1,
      MEI: 1,
      ATA: 1,
    };

    // For 3-5-2 and 3-4-3 formations, no LAT bench position
    if (formation === "3-5-2" || formation === "3-4-3") {
      benchLimits.LAT = 0;
    }

    return benchLimits;
  };

  const benchLimits = getBenchLimits();

  // Count current players by position
  const getCurrentPlayerCount = (positionType) => {
    return Object.values(selectedPlayers).filter(
      (player) => player.position === positionType
    ).length;
  };

  // Count current bench players by position
  const getCurrentBenchCount = (positionType) => {
    return Object.values(benchPlayers).filter(
      (player) => player.position === positionType
    ).length;
  };

  // Check if position is available
  const isPositionAvailable = (positionType) => {
    return getCurrentPlayerCount(positionType) < positionLimits[positionType];
  };

  // Check if a specific slot is available
  const isSlotAvailable = (positionKey) => {
    return !selectedPlayers[positionKey];
  };

  // Check if there are available slots for a position type
  const hasAvailableSlots = (positionType) => {
    const currentCount = getCurrentPlayerCount(positionType);
    const maxCount = positionLimits[positionType] || 0;
    return currentCount < maxCount;
  };

  // Check if bench position is available
  const isBenchPositionAvailable = (positionType) => {
    return getCurrentBenchCount(positionType) < benchLimits[positionType];
  };

  // Get position type for a given position
  const getPositionType = (row, index, totalInRow) => {
    if (row === 3) return "GOL"; // Goalkeeper row

    if (row === 0) {
      // Defense row
      if (config.defense >= 4) {
        return index === 0 || index === totalInRow - 1 ? "LAT" : "ZAG";
      }
      return "ZAG";
    }

    if (row === 1) return "MEI"; // Midfield row
    if (row === 2) return "ATA"; // Attack row

    return "ZAG";
  };

  // Generate position buttons for a row
  const renderPositionRow = (rowIndex, count, rowLabel) => {
    const positions = [];
    const positionTypeCounters = {}; // Track slot numbers per position type

    for (let i = 0; i < count; i++) {
      const positionType = getPositionType(rowIndex, i, count);

      // Initialize counter for this position type if not exists
      if (!positionTypeCounters[positionType]) {
        positionTypeCounters[positionType] = 0;
      }

      // Increment counter for this position type
      positionTypeCounters[positionType]++;

      const positionKey = `${positionType}-${positionTypeCounters[positionType]}`;
      const isAvailable = hasAvailableSlots(positionType);
      const currentPlayer = selectedPlayers[positionKey];

      positions.push(
        <div
          key={positionKey}
          className="relative flex flex-col items-center"
          onMouseEnter={() => setHoveredPosition(positionKey)}
          onMouseLeave={() => setHoveredPosition(null)}
        >
          {currentPlayer ? (
            <div className="relative">
              <div
                className="w-12 h-12 border-2 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: getTeamColors(
                    currentPlayer.teamName || currentPlayer.teamShortName
                  ).gradient,
                  color: getTeamColors(
                    currentPlayer.teamName || currentPlayer.teamShortName
                  ).textColor,
                  borderColor: getTeamColors(
                    currentPlayer.teamName || currentPlayer.teamShortName
                  ).borderColor,
                }}
              >
                {currentPlayer.teamShortName || "T"}
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full"
                onClick={() => onRemovePlayer(positionKey)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant={isAvailable ? "default" : "secondary"}
              disabled={!isAvailable}
              className="w-12 h-12 rounded-full p-0"
              onClick={() => onPositionClick(positionKey, positionType)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}

          {/* Position label or player name underneath each button */}
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2 text-xs font-black text-center max-w-16">
            {currentPlayer
              ? formatPlayerName(currentPlayer.name)
              : positionType}
          </div>

          {/* Player name on hover */}
          {hoveredPosition === positionKey && currentPlayer && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              {currentPlayer.name}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={rowIndex}
        className="flex justify-center items-center space-x-8 mb-8"
      >
        {positions}
      </div>
    );
  };

  // Render bench positions
  const renderBenchRow = () => {
    const benchPositions = ["GOL", "ZAG", "LAT", "MEI", "ATA"];

    return (
      <div className="flex justify-center items-center space-x-6 mt-4">
        {benchPositions.map((positionType) => {
          const benchKey = `bench-${positionType}`;
          const isAvailable = isBenchPositionAvailable(positionType);
          const currentPlayer = benchPlayers[benchKey];

          return (
            <div
              key={benchKey}
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredPosition(benchKey)}
              onMouseLeave={() => setHoveredPosition(null)}
            >
              {currentPlayer ? (
                <div className="relative">
                  <div
                    className="w-10 h-10 border-2 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: getTeamColors(
                        currentPlayer.teamName || currentPlayer.teamShortName
                      ).gradient,
                      color: getTeamColors(
                        currentPlayer.teamName || currentPlayer.teamShortName
                      ).textColor,
                      borderColor: getTeamColors(
                        currentPlayer.teamName || currentPlayer.teamShortName
                      ).borderColor,
                    }}
                  >
                    {currentPlayer.teamShortName || "T"}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-4 h-4 p-0 rounded-full"
                    onClick={() => onRemoveBenchPlayer(benchKey)}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant={isAvailable ? "outline" : "secondary"}
                  disabled={!isAvailable}
                  className="w-10 h-10 rounded-full p-0"
                  onClick={() => onBenchClick(benchKey, positionType)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              )}

              {/* Position label or player name underneath each button */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-black text-center max-w-12 overflow-hidden">
                {currentPlayer
                  ? formatPlayerName(currentPlayer.name)
                  : positionType}
              </div>

              {/* Player name on hover */}
              {hoveredPosition === benchKey && currentPlayer && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {currentPlayer.name}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Get players by position for debug
  const getPlayersByPosition = () => {
    const playersByPos = {
      goalkeepers: [],
      defenders: [],
      laterals: [],
      midfielders: [],
      attackers: [],
    };

    // Main team players
    Object.entries(selectedPlayers).forEach(([key, player]) => {
      if (player.position === "GOL") playersByPos.goalkeepers.push(player);
      else if (player.position === "ZAG") playersByPos.defenders.push(player);
      else if (player.position === "LAT") playersByPos.laterals.push(player);
      else if (player.position === "MEI") playersByPos.midfielders.push(player);
      else if (player.position === "ATA") playersByPos.attackers.push(player);
    });

    return playersByPos;
  };

  const playersByPosition = getPlayersByPosition();

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="relative">
          {/* Football Field SVG */}
          <div className="relative w-full max-w-md mx-auto">
            <img
              src="/football-field.svg"
              alt="Football Field"
              className="w-full h-auto brightness-75"
            />

            {/* Formation Overlay */}
            <div className="absolute inset-0 flex flex-col gap-8 justify-between py-8 px-4">
              {/* Attack Row (Top) */}
              {renderPositionRow(2, config.attack, "Attack")}

              {/* Midfield Row (Middle) */}
              {renderPositionRow(1, config.midfield, "Midfield")}

              {/* Defense Row (Bottom) */}
              {renderPositionRow(0, config.defense, "Defense")}

              {/* Goalkeeper Row (Very Bottom) */}
              <div className="flex justify-center items-center mt-2">
                {renderPositionRow(3, 1, "")}
              </div>
            </div>
          </div>

          {/* Bench Row */}
          <div className="my-10">
            <div className="text-center mb-2">
              <div className="text-sm font-medium text-muted-foreground">
                Banco de Reservas
              </div>
            </div>
            {renderBenchRow()}
          </div>

          {/*
          <div className="mt-4 text-center">
            <div className="text-sm font-medium">{formation} Formation</div>
            <div className="text-xs text-muted-foreground mt-1">
              {Object.entries(positionLimits).map(([pos, limit]) => (
                <span key={pos} className="mr-2">
                  {POSITION_TYPES[pos]}: {getCurrentPlayerCount(pos)}/{limit}
                </span>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Bench: {Object.entries(benchLimits).map(([pos, limit]) => (
                <span key={pos} className="mr-2">
                  {POSITION_TYPES[pos]}: {getCurrentBenchCount(pos)}/{limit}
                </span>
              ))}
            </div>
          </div> */}
        </div>
      </Card>

      {/* Debug Card */}
      {/* <Card className="p-4">
        <div className="text-sm font-medium mb-3">Debug - Selected Players</div>
        <div className="space-y-2 text-xs">
          <div>
            <span className="font-medium">Goalkeepers:</span>{" "}
            {playersByPosition.goalkeepers.map((p) => p.name).join(", ") ||
              "None"}
          </div>
          <div>
            <span className="font-medium">Defenders:</span>{" "}
            {playersByPosition.defenders.map((p) => p.name).join(", ") ||
              "None"}
          </div>
          <div>
            <span className="font-medium">Laterals:</span>{" "}
            {playersByPosition.laterals.map((p) => p.name).join(", ") || "None"}
          </div>
          <div>
            <span className="font-medium">Midfielders:</span>{" "}
            {playersByPosition.midfielders.map((p) => p.name).join(", ") ||
              "None"}
          </div>
          <div>
            <span className="font-medium">Attackers:</span>{" "}
            {playersByPosition.attackers.map((p) => p.name).join(", ") ||
              "None"}
          </div>
        </div>
      </Card> */}
    </div>
  );
}

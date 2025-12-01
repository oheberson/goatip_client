"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { STATS_MAP } from "@/lib/constants";
import { Filter, X, Search } from "lucide-react";
import { formatPlayerName } from "@/lib/utils";

export function TipsFilter({
  currentView = "teams",
  availableVariables = [],
  availableTeams = [],
  availablePlayers = [],
  playerTeamMap = new Map(),
  availableMatchups = [],
  selectedVariables = [],
  selectedTeams = [],
  selectedPlayers = [],
  selectedMatchups = [],
  selectedStarter = null,
  onVariablesChange,
  onTeamsChange,
  onPlayersChange,
  onMatchupsChange,
  onStarterChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [playerSearchTerm, setPlayerSearchTerm] = useState("");

  // Helper function to get team abbreviation
  const getTeamAbbreviation = (teamName) => {
    if (!teamName) return "";
    return teamName.substring(0, 3).toUpperCase();
  };

  const formatStatName = (statName) => {
    const translatedStatName = STATS_MAP[statName];

    return translatedStatName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleVariableToggle = (variable) => {
    if (selectedVariables.includes(variable)) {
      onVariablesChange(selectedVariables.filter((v) => v !== variable));
    } else {
      onVariablesChange([...selectedVariables, variable]);
    }
  };

  const handleTeamToggle = (team) => {
    if (selectedTeams.includes(team)) {
      onTeamsChange(selectedTeams.filter((t) => t !== team));
    } else {
      onTeamsChange([...selectedTeams, team]);
    }
  };

  const handleMatchupToggle = (matchup) => {
    if (selectedMatchups.includes(matchup)) {
      onMatchupsChange(selectedMatchups.filter((m) => m !== matchup));
    } else {
      onMatchupsChange([...selectedMatchups, matchup]);
    }
  };

  const handlePlayerSelect = (player) => {
    if (!selectedPlayers.includes(player)) {
      onPlayersChange([...selectedPlayers, player]);
      setPlayerSearchTerm("");
    }
  };

  const handlePlayerRemove = (player) => {
    onPlayersChange(selectedPlayers.filter((p) => p !== player));
  };

  const filteredPlayers = useMemo(() => {
    if (!playerSearchTerm) return [];
    const term = playerSearchTerm.toLowerCase();
    return availablePlayers
      .filter((player) => player.toLowerCase().includes(term))
      .filter((player) => !selectedPlayers.includes(player))
      .slice(0, 10); // Limit to 10 suggestions
  }, [playerSearchTerm, availablePlayers, selectedPlayers]);

  const handleStarterToggle = (value) => {
    if (selectedStarter === value) {
      onStarterChange(null); // Deselect if already selected
    } else {
      onStarterChange(value);
    }
  };

  const clearAllFilters = () => {
    onVariablesChange([]);
    onTeamsChange([]);
    onPlayersChange([]);
    onMatchupsChange([]);
    onStarterChange(null);
    setPlayerSearchTerm("");
  };

  const hasActiveFilters =
    selectedVariables.length > 0 ||
    selectedTeams.length > 0 ||
    selectedPlayers.length > 0 ||
    selectedMatchups.length > 0 ||
    selectedStarter !== null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtrar
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {selectedVariables.length +
                selectedTeams.length +
                selectedPlayers.length +
                selectedMatchups.length +
                (selectedStarter !== null ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtrar Dicas
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Limpar tudo
              </Button>
            )}
          </DialogTitle>
          <DialogDescription className="flex justify-start">
            {currentView === "teams"
              ? "Selecione as variáveis, times e partidas para filtrar as dicas"
              : "Selecione as variáveis e jogadores para filtrar as dicas"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Variables Section */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Variáveis</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableVariables.map((variable) => (
                <div key={variable} className="flex items-center space-x-2">
                  <Checkbox
                    id={`variable-${variable}`}
                    checked={selectedVariables.includes(variable)}
                    onCheckedChange={() => handleVariableToggle(variable)}
                  />
                  <label
                    htmlFor={`variable-${variable}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {formatStatName(variable)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Teams Section */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Times</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableTeams.map((team) => (
                <div key={team} className="flex items-center space-x-2">
                  <Checkbox
                    id={`team-${team}`}
                    checked={selectedTeams.includes(team)}
                    onCheckedChange={() => handleTeamToggle(team)}
                  />
                  <label
                    htmlFor={`team-${team}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {team}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Partidas Section */}
          {availableMatchups.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-sm">Partidas</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableMatchups.map((matchup) => (
                  <div key={matchup} className="flex items-center space-x-2">
                    <Checkbox
                      id={`matchup-${matchup}`}
                      checked={selectedMatchups.includes(matchup)}
                      onCheckedChange={() => handleMatchupToggle(matchup)}
                    />
                    <label
                      htmlFor={`matchup-${matchup}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {matchup}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Players Search Section - Only for players view */}
          {currentView === "players" && (
            <div>
              <h3 className="font-semibold mb-3 text-sm">Jogadores</h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar jogador..."
                  value={playerSearchTerm}
                  onChange={(e) => setPlayerSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {filteredPlayers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredPlayers.map((player) => {
                      const team = playerTeamMap.get(player);
                      const teamAbbr = team ? getTeamAbbreviation(team) : "";
                      return (
                        <div
                          key={player}
                          onClick={() => handlePlayerSelect(player)}
                          className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                        >
                          {formatPlayerName(player)}
                          {teamAbbr && (
                            <span className="text-muted-foreground ml-1">
                              ({teamAbbr})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {selectedPlayers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPlayers.map((player) => (
                    <Badge
                      key={player}
                      variant="secondary"
                      className="text-xs flex items-center gap-1"
                    >
                      {formatPlayerName(player)}
                      <button
                        onClick={() => handlePlayerRemove(player)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Titular Section - Only for players view */}
          {currentView === "players" && (
            <div>
              <h3 className="font-semibold mb-3 text-sm">Titular</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="starter-yes"
                    checked={selectedStarter === true}
                    onCheckedChange={() => handleStarterToggle(true)}
                  />
                  <label
                    htmlFor="starter-yes"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Sim
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="starter-no"
                    checked={selectedStarter === false}
                    onCheckedChange={() => handleStarterToggle(false)}
                  />
                  <label
                    htmlFor="starter-no"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Não
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-2">Filtros Ativos:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedVariables.map((variable) => (
                  <Badge
                    key={`active-var-${variable}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {formatStatName(variable)}
                    <button
                      onClick={() => handleVariableToggle(variable)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedTeams.map((team) => (
                  <Badge
                    key={`active-team-${team}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {team}
                    <button
                      onClick={() => handleTeamToggle(team)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedPlayers.map((player) => (
                  <Badge
                    key={`active-player-${player}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {formatPlayerName(player)}
                    <button
                      onClick={() => handlePlayerRemove(player)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedMatchups.map((matchup) => (
                  <Badge
                    key={`active-matchup-${matchup}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {matchup}
                    <button
                      onClick={() => handleMatchupToggle(matchup)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedStarter !== null && (
                  <Badge
                    key="active-starter"
                    variant="secondary"
                    className="text-xs"
                  >
                    Titular: {selectedStarter === true ? "Sim" : "Não"}
                    <button
                      onClick={() => onStarterChange(null)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

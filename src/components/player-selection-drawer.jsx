"use client";

import { useState, useEffect } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  CircleCheck,
  Cross,
  OctagonX,
  BadgeQuestionMark,
  CircleSlash,
  ArrowDownUp,
  ChartNoAxesColumn,
  CirclePlus,
  Minus,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { PlayerFilterDialog } from "@/components/player-filter-dialog";
import { PlayerSortDialog } from "@/components/player-sort-dialog";
import { PlayerStatsDrawer } from "@/components/player-stats-drawer";
import {
  getPlayerFiltersFromStorage,
  setPlayerFiltersToStorage,
  clearPlayerFiltersFromStorage,
  getPlayerSortFromStorage,
  setPlayerSortToStorage,
  clearPlayerSortFromStorage,
} from "@/lib/localStorage-utils";
import { mapPlayerName, TEAM_NAME_MAPPING, mapTeamName } from "@/lib/constants";
import { analyzeTeamScoringLikelihood } from "@/lib/team-scoring-analysis";

const POSITION_TYPES = {
  GK: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  MEI: "Meia",
  ATA: "Atacante",
};

export function PlayerSelectionDrawer({
  isOpen,
  onClose,
  positionType,
  playersData,
  onSelectPlayer,
  onRemovePlayer,
  selectedPlayers = {},
  bestPlayersData = null,
  formation = "4-3-3",
  selectedPosition = null,
  benchPlayers = {},
  detailedMatchesData,
  sgDetails = null,
  tournamentData = null,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [filters, setFilters] = useState({
    teams: [],
    statuses: [],
  });
  const [sortOption, setSortOption] = useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [statsDrawerOpen, setStatsDrawerOpen] = useState(false);
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState(null);
  const [activeTab, setActiveTab] = useState("normal"); // "normal" or "recommendations"
  const [recommendationsResult, setRecommendationsResult] = useState(null);
  const [goalTimingRecommendations, setGoalTimingRecommendations] =
    useState(null);
  const [sgRecommendations, setSgRecommendations] = useState(null);

  const getUniqueValues = (key) => {
    if (!playersData?.players) {
      return [];
    }
    const values = [
      ...new Set(
        playersData.players.map((player) => player[key]).filter(Boolean)
      ),
    ];
    return values.sort();
  };

  useEffect(() => {
    if (!detailedMatchesData || detailedMatchesData.length === 0) return;

    const uniqueTeams = getUniqueValues("teamName").map(mapTeamName);

    // Use our new analysis function to get team scoring likelihood
    const teamScoringAnalysis = analyzeTeamScoringLikelihood(
      detailedMatchesData,
      uniqueTeams
    );

    // Set the recommendations result with the new format
    setRecommendationsResult(teamScoringAnalysis);

    // Keep the old goal timing recommendations for backward compatibility
    // but simplify the structure
    const recommendationsGoalTiming = detailedMatchesData
      .map((match) => {
        const mandante = mapTeamName(match.mandante_name);
        const visitante = mapTeamName(match.visitante_name);

        if (
          !uniqueTeams.includes(mandante) ||
          !uniqueTeams.includes(visitante)
        ) {
          return null;
        }

        // Extract timing insights using our utility function
        const extractTimingInsights = (matchData, prefix) => {
          const scored = {};
          const against = {};
          const timingRegex = new RegExp(
            `^${prefix}\\.goals_timing\\.(\\d+ - \\d+)\\.(scored|against)$`
          );

          Object.entries(matchData).forEach(([key, value]) => {
            const match = key.match(timingRegex);
            if (!match) return;

            const interval = match[1];
            const type = match[2];
            const numValue = parseInt(value, 10);

            if (type === "scored") {
              scored[interval] = (scored[interval] || 0) + numValue;
            } else if (type === "against") {
              against[interval] = (against[interval] || 0) + numValue;
            }
          });

          const totalScored = Object.values(scored).reduce((a, b) => a + b, 0);
          const totalAgainst = Object.values(against).reduce(
            (a, b) => a + b,
            0
          );

          let topScoredPeriod = null;
          let topScoredValue = 0;
          for (const [interval, val] of Object.entries(scored)) {
            if (val > topScoredValue) {
              topScoredValue = val;
              topScoredPeriod = interval;
            }
          }

          let topAgainstPeriod = null;
          let topAgainstValue = 0;
          for (const [interval, val] of Object.entries(against)) {
            if (val > topAgainstValue) {
              topAgainstValue = val;
              topAgainstPeriod = interval;
            }
          }

          return {
            top_scored_period: topScoredPeriod,
            top_scored_percentage:
              totalScored > 0 ? topScoredValue / totalScored : 0,
            top_against_period: topAgainstPeriod,
            top_against_percentage:
              totalAgainst > 0 ? topAgainstValue / totalAgainst : 0,
          };
        };

        return {
          mandante,
          visitante,
          overall: {
            mandante: extractTimingInsights(match, "overall_mandante_infos"),
            visitante: extractTimingInsights(match, "overall_visitante_infos"),
          },
          detalhado: {
            mandante: extractTimingInsights(match, "detalhado_mandante_infos"),
            visitante: extractTimingInsights(
              match,
              "detalhado_visitante_infos"
            ),
          },
        };
      })
      .filter(Boolean);

    setGoalTimingRecommendations(recommendationsGoalTiming);
  }, [detailedMatchesData, playersData]);

  // Analyze SG recommendations based on clean sheets data
  useEffect(() => {
    if (!sgDetails || !Array.isArray(sgDetails) || !playersData?.players)
      return;

    // Get unique teams from players data and determine home/away status
    const getTeamContext = () => {
      const teamContext = {};

      // Get all matches from tournamentData to determine home/away status
      if (tournamentData?.matches) {
        tournamentData.matches.forEach((match) => {
          if (match.firstTeamName) {
            teamContext[mapTeamName(match.firstTeamLongName)] = "home";
          }
          if (match.secondTeamName) {
            teamContext[mapTeamName(match.secondTeamLongName)] = "away";
          }
        });
      }

      return teamContext;
    };

    const teamContext = getTeamContext();

    // Analyze clean sheets data
    const analyzeCleanSheets = (sgData, teamContext) => {
      return sgData
        .map((team) => {
          const teamName = team.team;
          const isHome = teamContext[teamName] === "home";
          const isAway = teamContext[teamName] === "away";

          let weightedCleanSheetPercentage = 0;
          let context = "unknown";

          if (isHome) {
            // For home teams, weight home performance more heavily
            const homePercentage = team["home_clean_sheet_%"] || 0;
            const totalPercentage = team["total_clean_sheet_%"] || 0;
            weightedCleanSheetPercentage =
              (homePercentage * 1.2 + totalPercentage) / 2;

            context = "home";
          } else if (isAway) {
            // For away teams, weight away performance more heavily
            const awayPercentage = team["away_clean_sheet_%"] || 0;
            const totalPercentage = team["total_clean_sheet_%"] || 0;
            weightedCleanSheetPercentage =
              (awayPercentage * 1.2 + totalPercentage) / 2;
            context = "away";
          } else {
            // If context is unknown, use total percentage
            weightedCleanSheetPercentage = team["total_clean_sheet_%"] || 0;
            context = "total";
          }

          return {
            team: teamName,
            context: context,
            clean_sheet_percentage: weightedCleanSheetPercentage,
            home_clean_sheets: team.home_clean_sheets,
            home_games: team.home_games,
            home_clean_sheet_percentage: team["home_clean_sheet_%"],
            away_clean_sheets: team.away_clean_sheets,
            away_games: team.away_games,
            away_clean_sheet_percentage: team["away_clean_sheet_%"],
            total_clean_sheets: team.total_clean_sheets,
            total_games: team.total_games,
            total_clean_sheet_percentage: team["total_clean_sheet_%"],
          };
        })
        .sort((a, b) => b.clean_sheet_percentage - a.clean_sheet_percentage);
    };

    const sgAnalysis = analyzeCleanSheets(sgDetails, teamContext);

    setSgRecommendations(sgAnalysis);
  }, [sgDetails, playersData, tournamentData]);

  // Formation configuration
  const FORMATION_CONFIGS = {
    "4-3-3": { defense: 4, midfield: 3, attack: 3 },
    "4-4-2": { defense: 4, midfield: 4, attack: 2 },
    "3-4-3": { defense: 3, midfield: 4, attack: 3 },
    "4-5-1": { defense: 4, midfield: 5, attack: 1 },
    "3-5-2": { defense: 3, midfield: 5, attack: 2 },
    "5-3-2": { defense: 5, midfield: 3, attack: 2 },
    "5-4-1": { defense: 5, midfield: 4, attack: 1 },
  };

  // Get position limits based on formation
  const getPositionLimits = () => {
    const config = FORMATION_CONFIGS[formation] || FORMATION_CONFIGS["4-3-3"];
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

  // Check if this is a bench position
  const isBenchPosition =
    selectedPosition && selectedPosition.startsWith("bench-");

  // Get position limits - different for bench vs main team
  const getPositionLimitsForContext = () => {
    if (isBenchPosition) {
      // Bench positions are always 1 player per position
      return 1;
    } else {
      // Main team positions use formation limits
      return positionLimits[positionType] || 0;
    }
  };

  const maxPlayersForPosition = getPositionLimitsForContext();

  // Count selected players for current position (context-specific)
  const getSelectedPlayersForPosition = () => {
    if (isBenchPosition) {
      // For bench positions, check if the specific bench slot is filled
      return selectedPosition && benchPlayers[selectedPosition]
        ? [benchPlayers[selectedPosition]]
        : [];
    } else {
      // For main team positions, count all players of this position type
      return Object.values(selectedPlayers).filter(
        (player) => player.position === positionType
      );
    }
  };

  const selectedPlayersForPosition = getSelectedPlayersForPosition();
  const currentCount = selectedPlayersForPosition.length;
  const canAddMore = currentCount < maxPlayersForPosition;

  // Load filters and sort from localStorage on component mount
  useEffect(() => {
    const savedFilters = getPlayerFiltersFromStorage();
    if (savedFilters) {
      setFilters(savedFilters);
    }

    const savedSort = getPlayerSortFromStorage();
    if (savedSort) {
      setSortOption(savedSort);
    }
  }, []);

  // Helper function to calculate total shots
  const calculateTotalShots = (player) => {
    const scouts = player.scouts?.total || {};
    return (
      (scouts.FD || 0) + (scouts.FF || 0) + (scouts.FT || 0) + (scouts.FB || 0)
    );
  };

  // Helper function to get scout value safely
  const getScoutValue = (player, key) => {
    return player.scouts?.total?.[key] || 0;
  };

  // Helper function to check if player has stats available
  const hasPlayerStats = (player) => {
    if (!bestPlayersData || !Array.isArray(bestPlayersData)) {
      return false;
    }

    // Map player name from players API to best-players API format
    const mappedPlayerName = mapPlayerName(player.name);

    return bestPlayersData.some(
      (bestPlayer) =>
        bestPlayer.player === mappedPlayerName &&
        bestPlayer.team ===
          (TEAM_NAME_MAPPING[player.teamName]
            ? TEAM_NAME_MAPPING[player.teamName]
            : player.teamName)
    );
  };

  // Filter and sort players by position, search term, filters, and sort option
  useEffect(() => {
    if (!playersData || !positionType) {
      setFilteredPlayers([]);
      return;
    }

    let filtered = playersData.players?.filter((player) => {
      // Filter by position type
      const matchesPosition = player.position === positionType;

      // Filter by search term
      const matchesSearch =
        !searchTerm ||
        player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.teamName?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by teams
      const matchesTeams =
        !filters.teams?.length || filters.teams.includes(player.teamName);

      // Filter by status
      const matchesStatus =
        !filters.statuses?.length || filters.statuses.includes(player.status);

      return matchesPosition && matchesSearch && matchesTeams && matchesStatus;
    });

    // Apply sorting based on sort option
    if (sortOption) {
      filtered.sort((a, b) => {
        let valueA, valueB;

        switch (sortOption) {
          case "expensive":
            valueA = a.price || 0;
            valueB = b.price || 0;
            return valueB - valueA; // Descending
          case "cheapest":
            valueA = a.price || 0;
            valueB = b.price || 0;
            return valueA - valueB; // Ascending
          case "average":
            valueA = a.average || 0;
            valueB = b.average || 0;
            return valueB - valueA; // Descending
          case "shots":
            valueA = calculateTotalShots(a);
            valueB = calculateTotalShots(b);
            return valueB - valueA; // Descending
          case "saves":
            valueA = getScoutValue(a, "DS");
            valueB = getScoutValue(b, "DS");
            return valueB - valueA; // Descending
          case "sg":
            valueA = getScoutValue(a, "SG");
            valueB = getScoutValue(b, "SG");
            return valueB - valueA; // Descending
          case "tackles":
            valueA = getScoutValue(a, "DE");
            valueB = getScoutValue(b, "DE");
            return valueB - valueA; // Descending
          case "interceptions":
            valueA = getScoutValue(a, "IR");
            valueB = getScoutValue(b, "IR");
            return valueB - valueA; // Descending
          case "offsides":
            valueA = getScoutValue(a, "I");
            valueB = getScoutValue(b, "I");
            return valueB - valueA; // Descending
          case "wrong_passes":
            valueA = getScoutValue(a, "PE");
            valueB = getScoutValue(b, "PE");
            return valueB - valueA; // Descending
          case "goals":
            valueA = getScoutValue(a, "G");
            valueB = getScoutValue(b, "G");
            return valueB - valueA; // Descending
          default:
            return 0;
        }
      });
    } else {
      // Default sort by name
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    setFilteredPlayers(filtered);
  }, [playersData, positionType, searchTerm, filters, sortOption]);

  const handleSelectPlayer = (player) => {
    onSelectPlayer(player);

    // Only close drawer if all slots for this position are filled
    if (currentCount + 1 >= maxPlayersForPosition) {
      onClose();
    }
  };

  const handleRemovePlayer = (player) => {
    if (onRemovePlayer) {
      onRemovePlayer(player);
    }
  };

  const handleOpenStats = (player) => {
    if (!bestPlayersData || !Array.isArray(bestPlayersData)) {
      return;
    }

    // Map player name from players API to best-players API format
    const mappedPlayerName = mapPlayerName(player.name);

    const matchingPlayer = bestPlayersData.find(
      (bestPlayer) =>
        bestPlayer.player === mappedPlayerName &&
        bestPlayer.team ===
          (TEAM_NAME_MAPPING[player.teamName]
            ? TEAM_NAME_MAPPING[player.teamName]
            : player.teamName)
    );

    if (matchingPlayer) {
      setSelectedPlayerForStats(matchingPlayer);
      setStatsDrawerOpen(true);
    }
  };

  const handleCloseStats = () => {
    setStatsDrawerOpen(false);
    setSelectedPlayerForStats(null);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Save to localStorage
    if (newFilters.teams?.length === 0 && newFilters.statuses?.length === 0) {
      clearPlayerFiltersFromStorage();
    } else {
      setPlayerFiltersToStorage(newFilters);
    }
  };

  const handleSortChange = (newSortOption) => {
    setSortOption(newSortOption);
    // Save to localStorage
    if (!newSortOption) {
      clearPlayerSortFromStorage();
    } else {
      setPlayerSortToStorage(newSortOption);
    }
  };

  const isPlayerSelected = (player) => {
    // Check if player is selected anywhere (main team or bench)
    const isInMainTeam = Object.values(selectedPlayers).some(
      (selected) => selected.id === player.id
    );
    const isInBench = Object.values(benchPlayers).some(
      (selected) => selected.id === player.id
    );

    return isInMainTeam || isInBench;
  };

  const getPlayerSelectionContext = (player) => {
    const isInMainTeam = Object.values(selectedPlayers).some(
      (selected) => selected.id === player.id
    );
    const isInBench = Object.values(benchPlayers).some(
      (selected) => selected.id === player.id
    );

    if (isInMainTeam) return "main";
    if (isInBench) return "bench";
    return null;
  };

  const hasActiveFilters = () => {
    return filters.teams?.length > 0 || filters.statuses?.length > 0;
  };

  const hasActiveSort = () => {
    return sortOption !== null;
  };

  // Get the display value and label for the current sort option
  const getPlayerDisplayValue = (player) => {
    if (!sortOption) {
      // Default: show average with "Average" label
      return {
        value: player.average || 0,
        label: "Média",
        formatted: player.average ? player.average.toFixed(2) : "0.00",
      };
    }

    let value, label, formatted;

    switch (sortOption) {
      case "expensive":
      case "cheapest":
        value = player.price || 0;
        label = "";
        formatted = `$${value.toLocaleString()}`;
        break;
      case "average":
        value = player.average || 0;
        label = "Média";
        formatted = value.toFixed(2);
        break;
      case "shots":
        value = calculateTotalShots(player);
        label = "Finalizações";
        formatted = value.toString();
        break;
      case "saves":
        value = getScoutValue(player, "DS");
        label = "Defesas";
        formatted = value.toString();
        break;
      case "sg":
        value = getScoutValue(player, "SG");
        label = "SG";
        formatted = value.toString();
        break;
      case "tackles":
        value = getScoutValue(player, "DE");
        label = "Desarmes";
        formatted = value.toString();
        break;
      case "interceptions":
        value = getScoutValue(player, "IR");
        label = "Interceptações";
        formatted = value.toString();
        break;
      case "offsides":
        value = getScoutValue(player, "I");
        label = "Impedimentos";
        formatted = value.toString();
        break;
      case "wrong_passes":
        value = getScoutValue(player, "PE");
        label = "Passes Errados";
        formatted = value.toString();
        break;
      case "goals":
        value = getScoutValue(player, "G");
        label = "Gols";
        formatted = value.toString();
        break;
      default:
        value = player.average || 0;
        label = "Média";
        formatted = value.toFixed(2);
    }

    return { value, label, formatted };
  };

  const displayPlayerStatus = (playerStatus) => {
    if (playerStatus === "Provável")
      return (
        <span className="text-green-500">
          <CircleCheck />
        </span>
      );
    else if (playerStatus === "Contudido")
      return (
        <span className="text-red-450">
          <Cross />
        </span>
      );
    else if (playerStatus === "Dúvida")
      return (
        <span>
          <BadgeQuestionMark />
        </span>
      );
    else if (playerStatus === "Suspenso")
      return (
        <span>
          <OctagonX />
        </span>
      );
    return <CircleSlash />;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Selecionar</DrawerTitle>
          <DrawerDescription>
            {`Selecione o jogador para ${
              POSITION_TYPES[positionType] || "a posição"
            }`}
          </DrawerDescription>
          {isBenchPosition ? (
            <div className="mt-2 text-sm text-muted-foreground">
              {currentCount === 0 ? (
                <span className="text-orange-600">
                  Vaga disponível no banco
                </span>
              ) : (
                <span className="text-green-600">Vaga preenchida no banco</span>
              )}
            </div>
          ) : maxPlayersForPosition > 1 ? (
            <div className="mt-2 text-sm text-muted-foreground">
              {currentCount} de {maxPlayersForPosition} selecionados
              {currentCount < maxPlayersForPosition && (
                <span className="text-green-600 ml-2">
                  • {maxPlayersForPosition - currentCount} vaga(s)
                  disponível(is)
                </span>
              )}
            </div>
          ) : null}
        </DrawerHeader>

        <div className="px-4 pb-4">
          {/* Tab Buttons */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={activeTab === "normal" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("normal")}
              className="flex-1"
            >
              Jogadores
            </Button>
            <Button
              variant={activeTab === "recommendations" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("recommendations")}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white border-primary shadow-lg"
            >
              <Star className="w-5 h-5 mr-2" />
              Recomendações
            </Button>
          </div>

          {activeTab == "normal" && (
            <>
              {/* Search Input, Sort Button, and Filter Button */}
              <div className="flex space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortDialogOpen(true)}
                  className={`px-3 ${
                    hasActiveSort() ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <ArrowDownUp className="w-4 h-4" />
                  {hasActiveSort() && (
                    <div className="w-2 h-2 bg-primary rounded-full ml-1" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterDialogOpen(true)}
                  className={`px-3 ${
                    hasActiveFilters() ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {hasActiveFilters() && (
                    <div className="w-2 h-2 bg-primary rounded-full ml-1" />
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Players List */}
          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {activeTab === "normal" ? (
              // Normal List
              filteredPlayers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "No players found matching your search"
                    : "No players available for this position"}
                </div>
              ) : (
                filteredPlayers.map((player) => (
                  <Card
                    key={player.id}
                    className={`transition-colors ${
                      isPlayerSelected(player)
                        ? "bg-muted border-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Left Column - Player Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">
                            <span className="flex items-center gap-2">
                              {player.name || "Unknown Player"}
                              <span className="text-muted-foreground">
                                {displayPlayerStatus(player.status)}
                              </span>
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {player.teamName || "Unknown Team"} •{" "}
                            {player.position || positionType}
                          </div>
                          {(() => {
                            const displayData = getPlayerDisplayValue(player);
                            return (
                              <div className="flex items-center gap-2">
                                <div className="text-lg font-semibold text-muted-foreground">
                                  {displayData.formatted}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {displayData.label}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Right Column - Action Buttons */}
                        <div className="flex flex-col gap-2 items-center">
                          {hasPlayerStats(player) && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenStats(player)}
                              className="p-2 h-12 w-12 size-12"
                              title="View detailed statistics"
                            >
                              <ChartNoAxesColumn className="w-12 h-12 text-primary" />
                            </Button>
                          )}
                          {isPlayerSelected(player) ? (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemovePlayer(player)}
                              className="p-2 h-12 w-12 size-12"
                              title={`Remove player from ${
                                getPlayerSelectionContext(player) === "main"
                                  ? "starting eleven"
                                  : "bench"
                              }`}
                            >
                              <Minus className="w-12 h-12 text-red-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleSelectPlayer(player)}
                              disabled={!canAddMore}
                              className="p-2 h-12 w-12 size-12"
                              title={
                                canAddMore
                                  ? `Add player to ${
                                      isBenchPosition
                                        ? "bench"
                                        : "starting eleven"
                                    }`
                                  : `All ${maxPlayersForPosition} slots filled`
                              }
                            >
                              <CirclePlus
                                className={`w-12 h-12 ${
                                  canAddMore
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )
            ) : (
              // Recommendations List
              <div className="w-full">
                {/* Team Scoring Likelihood Analysis */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-4 text-center">
                    Times Prováveis de Marcar
                  </h3>
                  {recommendationsResult && recommendationsResult.length > 0 ? (
                    <div className="space-y-3">
                      {recommendationsResult.slice(0, 10).map((team, index) => (
                        <Card
                          key={team.team}
                          className={`${
                            index === 0
                              ? "border-green-500 bg-green-50 dark:bg-green-950"
                              : index === 1
                              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                              : index === 2
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-950"
                              : "border-gray-200"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-semibold">{team.team}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Melhor momento: {team.moment_for_scoring}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">
                                  {team.likely_goals}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  gols esperados
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma análise de times disponível
                    </div>
                  )}
                </div>

                {/* SG Recommendations */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-4 text-center">
                    Times Menos Prováveis de Levar Gols (SG)
                  </h3>
                  {sgRecommendations && sgRecommendations.length > 0 ? (
                    <div className="space-y-3">
                      {sgRecommendations.slice(0, 10).map((team, index) => (
                        <Card
                          key={team.team}
                          className={`${
                            index === 0
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                              : index === 1
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                              : index === 2
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                              : "border-gray-200"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-semibold">{team.team}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {team.context === "home"
                                      ? "Jogando em casa"
                                      : team.context === "away"
                                      ? "Jogando fora"
                                      : "Contexto geral"}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">
                                  {(team.clean_sheet_percentage || 0).toFixed(
                                    1
                                  )}
                                  %
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  chance de SG
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                              <div className="text-center">
                                <div className="font-medium">Casa</div>
                                <div>
                                  {(
                                    team.home_clean_sheet_percentage || 0
                                  ).toFixed(1)}
                                  %
                                </div>
                                <div>
                                  ({team.home_clean_sheets || 0}/
                                  {team.home_games || 0})
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">Fora</div>
                                <div>
                                  {(
                                    team.away_clean_sheet_percentage || 0
                                  ).toFixed(1)}
                                  %
                                </div>
                                <div>
                                  ({team.away_clean_sheets || 0}/
                                  {team.away_games || 0})
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">Total</div>
                                <div>
                                  {(
                                    team.total_clean_sheet_percentage || 0
                                  ).toFixed(1)}
                                  %
                                </div>
                                <div>
                                  ({team.total_clean_sheets || 0}/
                                  {team.total_games || 0})
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma análise de SG disponível
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <Button variant="outline" className="w-full mt-4" onClick={onClose}>
            Cancel
          </Button>
        </div>

        {/* Filter Dialog */}
        <PlayerFilterDialog
          isOpen={filterDialogOpen}
          onOpenChange={setFilterDialogOpen}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          playersData={playersData}
        />

        {/* Sort Dialog */}
        <PlayerSortDialog
          isOpen={sortDialogOpen}
          onOpenChange={setSortDialogOpen}
          currentSort={sortOption}
          onSortChange={handleSortChange}
        />
      </DrawerContent>

      {/* Player Stats Drawer */}
      <PlayerStatsDrawer
        player={selectedPlayerForStats}
        isOpen={statsDrawerOpen}
        onClose={handleCloseStats}
      />
    </Drawer>
  );
}

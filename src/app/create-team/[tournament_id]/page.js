"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Users, Save, Plus, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-utils";
import {
  getTournamentFromStorage,
  getBestPlayersFromStorage,
  setBestPlayersToStorage,
  hasValidBestPlayersData,
  saveFormationToStorage,
  getFormationFromStorage,
  getSavedTeamNames,
  deleteFormationFromStorage,
} from "@/lib/localStorage-utils";
import { TOURNAMENTS, mapTeamName } from "@/lib/constants";
import { FootballField } from "@/components/football-field";
import { PlayerSelectionDrawer } from "@/components/player-selection-drawer";
import { TeamNameDialog } from "@/components/team-name-dialog";

export default function CreateTeamPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const tournamentId = resolvedParams.tournament_id;
  const [teamName, setTeamName] = useState("");
  const [formation, setFormation] = useState("4-3-3");
  const [loading, setLoading] = useState(false);
  const [tournamentData, setTournamentData] = useState(null);
  const [tournamentLoading, setTournamentLoading] = useState(true);
  const [tournamentError, setTournamentError] = useState(null);
  const [playersData, setPlayersData] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState({});
  const [benchPlayers, setBenchPlayers] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedPositionType, setSelectedPositionType] = useState(null);
  const [teamAnalysis, setTeamAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [bestPlayersData, setBestPlayersData] = useState(null);
  const [bestPlayersLoading, setBestPlayersLoading] = useState(false);

  // Formation management state
  const [savedTeamNames, setSavedTeamNames] = useState([]);
  const [selectedSavedTeam, setSelectedSavedTeam] = useState("");
  const [teamNameDialogOpen, setTeamNameDialogOpen] = useState(false);
  const [isLoadingFormation, setIsLoadingFormation] = useState(false);

  // Check if all required positions are filled
  const isFormationComplete = () => {
    const FORMATION_CONFIGS = {
      "4-3-3": { defense: 4, midfield: 3, attack: 3 },
      "4-4-2": { defense: 4, midfield: 4, attack: 2 },
      "3-4-3": { defense: 3, midfield: 4, attack: 3 },
      "4-5-1": { defense: 4, midfield: 5, attack: 1 },
      "3-5-2": { defense: 3, midfield: 5, attack: 2 },
      "5-3-2": { defense: 5, midfield: 3, attack: 2 },
      "5-4-1": { defense: 5, midfield: 4, attack: 1 },
    };

    const config = FORMATION_CONFIGS[formation] || FORMATION_CONFIGS["4-3-3"];
    const limits = {
      GOL: 1,
      ZAG: 0,
      LAT: 0,
      MEI: config.midfield,
      ATA: config.attack,
    };

    if (config.defense >= 4) {
      limits.ZAG = 2;
      limits.LAT = 2;
    } else {
      limits.ZAG = config.defense;
    }

    // Check if all required positions are filled
    for (const [positionType, requiredCount] of Object.entries(limits)) {
      const currentCount = Object.values(selectedPlayers).filter(
        (player) => player.position === positionType
      ).length;

      if (currentCount < requiredCount) {
        return false;
      }
    }

    return true;
  };

  // Load saved team names when component mounts
  useEffect(() => {
    const teamNames = getSavedTeamNames(tournamentId);
    setSavedTeamNames(teamNames);
  }, [tournamentId]);

  // Save formation
  const handleSaveFormation = (teamName) => {
    if (!isFormationComplete()) {
      return;
    }

    const formationData = {
      formation,
      selectedPlayers: { ...selectedPlayers },
      benchPlayers: { ...benchPlayers },
      timestamp: Date.now(),
    };

    const success = saveFormationToStorage(
      tournamentId,
      teamName,
      formationData
    );
    if (success) {
      // Update saved team names list
      const updatedTeamNames = getSavedTeamNames(tournamentId);
      setSavedTeamNames(updatedTeamNames);
      setTeamNameDialogOpen(false);
    }
  };

  // Load formation
  const handleLoadFormation = (teamName) => {
    if (!teamName) return;

    setIsLoadingFormation(true);
    const formationData = getFormationFromStorage(tournamentId, teamName);

    if (formationData) {
      // Update formation
      setFormation(formationData.formation);

      // Clear current selections
      setSelectedPlayers({});
      setBenchPlayers({});

      // Load players with proper slot assignment
      setTimeout(() => {
        // Load main team players
        const newSelectedPlayers = {};
        Object.entries(formationData.selectedPlayers).forEach(
          ([slotKey, player]) => {
            newSelectedPlayers[slotKey] = player;
          }
        );
        setSelectedPlayers(newSelectedPlayers);

        // Load bench players
        const newBenchPlayers = {};
        Object.entries(formationData.benchPlayers).forEach(
          ([slotKey, player]) => {
            newBenchPlayers[slotKey] = player;
          }
        );
        setBenchPlayers(newBenchPlayers);

        setIsLoadingFormation(false);
      }, 100);
    } else {
      setIsLoadingFormation(false);
    }
  };

  // Delete formation
  const handleDeleteFormation = (teamName) => {
    if (window.confirm(`Deseja deletar o time"${teamName}"?`)) {
      const success = deleteFormationFromStorage(tournamentId, teamName);
      if (success) {
        const updatedTeamNames = getSavedTeamNames(tournamentId);
        setSavedTeamNames(updatedTeamNames);
        if (selectedSavedTeam === teamName) {
          setSelectedSavedTeam("");
        }
      }
    }
  };

  const formations = [
    { value: "4-3-3", label: "4-3-3" },
    { value: "4-4-2", label: "4-4-2" },
    { value: "3-4-3", label: "3-4-3" },
    { value: "4-5-1", label: "4-5-1" },
    { value: "3-5-2", label: "3-5-2" },
    { value: "5-3-2", label: "5-3-2" },
    { value: "5-4-1", label: "5-4-1" },
  ];

  // Function to fetch best players data for available tournaments
  const fetchBestPlayersData = async (tournamentId, matches) => {
    // Check if this tournament is in our available tournaments
    if (!TOURNAMENTS[tournamentId]) {
      return;
    }

    // Check if we have valid cached data
    // if (hasValidBestPlayersData(tournamentId)) {
    //   const cachedData = getBestPlayersFromStorage(tournamentId);
    //   setBestPlayersData(cachedData);
    //   return;
    // }

    try {
      setBestPlayersLoading(true);

      // Extract unique team names from matches
      const teamNames = new Set();
      matches.forEach((match) => {
        if (match.firstTeamLongName) {
          teamNames.add(mapTeamName(match.firstTeamLongName));
        }
        if (match.secondTeamLongName) {
          teamNames.add(mapTeamName(match.secondTeamLongName));
        }
      });

      if (teamNames.size === 0) {
        console.log("No team names found in matches");
        return;
      }

      // Fetch best players data
      const teamsArray = Array.from(teamNames);
      console.log("Fetching best players for teams:", teamsArray);

      const data = await api.analytics.getBestPlayersByTeams(teamsArray);
      setBestPlayersData(data.data || data);

      // Cache the data
      setBestPlayersToStorage(tournamentId, data.data || data);
    } catch (error) {
      console.error("Failed to fetch best players data:", error);
    } finally {
      setBestPlayersLoading(false);
    }
  };

  useEffect(() => {
    const loadTournamentData = async () => {
      try {
        setTournamentLoading(true);
        setTournamentError(null);

        if (!tournamentId) {
          setTournamentError("No tournament ID provided");
          return;
        }

        // Get tournament data from localStorage
        const tournament = getTournamentFromStorage(tournamentId);

        if (!tournament) {
          setTournamentError(
            "Tournament not found. Please go back to matches and try again."
          );
          return;
        }

        setTournamentData(tournament);
        console.log("Loaded tournament data:", tournament);

        // Fetch best players data if tournament is available
        await fetchBestPlayersData(tournamentId, tournament.matches || []);

        // Fetch players data for this tournament
        console.log("fetching players with>>", tournament.matches[0]?.id);
        const playersData = await api.players.getByTournament(
          tournamentId,
          tournament.matches[0]?.id
        );
        setPlayersData(playersData);
      } catch (error) {
        console.error("Error loading tournament data:", error);
        setTournamentError("Failed to load tournament data");
      } finally {
        setTournamentLoading(false);
      }
    };

    loadTournamentData();
  }, [tournamentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || !tournamentData) return;

    try {
      setLoading(true);
      const teamData = {
        name: teamName,
        formation: formation,
        players: [],
        tournamentId: tournamentData.id,
        tournamentName: tournamentData.championshipName,
        created_at: new Date().toISOString(),
      };

      await api.fantasyTeams.create(teamData);

      // Redirect to teams page after successful creation
      router.push("/teams");
    } catch (error) {
      console.error("Failed to create team:", error);
      // For development, still redirect even if API fails
      router.push("/teams");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handlePositionClick = (positionKey, positionType) => {
    setSelectedPosition(positionKey);
    setSelectedPositionType(positionType);
    setDrawerOpen(true);
  };

  const handleSelectPlayer = (player) => {
    if (selectedPosition.startsWith("bench-")) {
      setBenchPlayers((prev) => ({
        ...prev,
        [selectedPosition]: {
          ...player,
          position: selectedPositionType,
        },
      }));
    } else {
      // For main team positions, find the next available slot
      const getNextAvailableSlot = () => {
        const FORMATION_CONFIGS = {
          "4-3-3": { defense: 4, midfield: 3, attack: 3 },
          "4-4-2": { defense: 4, midfield: 4, attack: 2 },
          "3-4-3": { defense: 3, midfield: 4, attack: 3 },
          "4-5-1": { defense: 4, midfield: 5, attack: 1 },
          "3-5-2": { defense: 3, midfield: 5, attack: 2 },
          "5-3-2": { defense: 5, midfield: 3, attack: 2 },
          "5-4-1": { defense: 5, midfield: 4, attack: 1 },
        };

        const config =
          FORMATION_CONFIGS[formation] || FORMATION_CONFIGS["4-3-3"];
        const limits = {
          GOL: 1,
          ZAG: 0,
          LAT: 0,
          MEI: config.midfield,
          ATA: config.attack,
        };

        if (config.defense >= 4) {
          limits.ZAG = 2;
          limits.LAT = 2;
        } else {
          limits.ZAG = config.defense;
        }

        const maxForPosition = limits[selectedPositionType] || 0;

        // Always find the next available slot in order
        for (let i = 1; i <= maxForPosition; i++) {
          const slotKey = `${selectedPositionType}-${i}`;
          if (!selectedPlayers[slotKey]) {
            return slotKey;
          }
        }

        // If no slots available, fallback to the original selectedPosition
        return selectedPosition;
      };

      const slotKey = getNextAvailableSlot();

      setSelectedPlayers((prev) => ({
        ...prev,
        [slotKey]: {
          ...player,
          position: selectedPositionType,
        },
      }));
    }
  };

  const handleRemovePlayer = (positionKey) => {
    setSelectedPlayers((prev) => {
      const newPlayers = { ...prev };
      delete newPlayers[positionKey];
      return newPlayers;
    });
  };

  const handleRemovePlayerByObject = (player) => {
    // Check if it's a bench player first
    const benchPlayerKey = Object.keys(benchPlayers).find(
      (key) => benchPlayers[key] && benchPlayers[key].id === player.id
    );

    if (benchPlayerKey) {
      // Remove from bench players
      setBenchPlayers((prev) => {
        const newBenchPlayers = { ...prev };
        delete newBenchPlayers[benchPlayerKey];
        return newBenchPlayers;
      });
    } else {
      // Remove from main team players
      setSelectedPlayers((prev) => {
        const newPlayers = { ...prev };
        // Find the position key for this player
        Object.keys(newPlayers).forEach((key) => {
          if (newPlayers[key].id === player.id) {
            delete newPlayers[key];
          }
        });
        return newPlayers;
      });
    }
  };

  const handleBenchClick = (benchKey, positionType) => {
    setSelectedPosition(benchKey);
    setSelectedPositionType(positionType);
    setDrawerOpen(true);
  };

  const handleRemoveBenchPlayer = (benchKey) => {
    setBenchPlayers((prev) => {
      const newPlayers = { ...prev };
      delete newPlayers[benchKey];
      return newPlayers;
    });
  };

  const handleFormationChange = (newFormation) => {
    setFormation(newFormation);
    // Clear selected players when formation changes
    setSelectedPlayers({});
    setBenchPlayers({});
    setTeamAnalysis(null); // Clear analysis when formation changes
  };

  // Team analysis function
  const analyzeTeam = () => {
    const analysis = {
      completeness: [],
      positionComposition: {},
      teamDistribution: {},
      expectedScore: 0,
    };

    // Get formation configuration
    const FORMATION_CONFIGS = {
      "4-3-3": { defense: 4, midfield: 3, attack: 3 },
      "4-4-2": { defense: 4, midfield: 4, attack: 2 },
      "3-4-3": { defense: 3, midfield: 4, attack: 3 },
      "4-5-1": { defense: 4, midfield: 5, attack: 1 },
      "3-5-2": { defense: 3, midfield: 5, attack: 2 },
      "5-3-2": { defense: 5, midfield: 3, attack: 2 },
      "5-4-1": { defense: 5, midfield: 4, attack: 1 },
    };

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

    // Get bench limits
    const getBenchLimits = () => {
      const benchLimits = {
        GOL: 1,
        ZAG: 1,
        LAT: 1,
        MEI: 1,
        ATA: 1,
      };

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

    const getCurrentBenchCount = (positionType) => {
      return Object.values(benchPlayers).filter(
        (player) => player.position === positionType
      ).length;
    };

    // 1. Check completeness
    Object.entries(positionLimits).forEach(([pos, limit]) => {
      const currentCount = getCurrentPlayerCount(pos);
      const benchCount = getCurrentBenchCount(pos);
      const benchLimit = benchLimits[pos] || 0;

      if (currentCount < limit) {
        analysis.completeness.push(
          `Faltam ${limit - currentCount} jogador(es) para a posição ${pos}`
        );
      }

      if (benchLimit > 0 && benchCount < benchLimit) {
        analysis.completeness.push(
          `Falta 1 jogador reserva para a posição ${pos}`
        );
      }
    });

    // 2. Position composition analysis
    const getAllPlayersByPosition = () => {
      const players = {
        defense: [],
        midfield: [],
        attack: [],
      };

      // Add main team players
      Object.values(selectedPlayers).forEach((player) => {
        if (
          player.position === "GOL" ||
          player.position === "ZAG" ||
          player.position === "LAT"
        ) {
          players.defense.push(player);
        } else if (player.position === "MEI") {
          players.midfield.push(player);
        } else if (player.position === "ATA") {
          players.attack.push(player);
        }
      });

      // Add bench players
      Object.values(benchPlayers).forEach((player) => {
        if (
          player.position === "GOL" ||
          player.position === "ZAG" ||
          player.position === "LAT"
        ) {
          players.defense.push(player);
        } else if (player.position === "MEI") {
          players.midfield.push(player);
        } else if (player.position === "ATA") {
          players.attack.push(player);
        }
      });

      return players;
    };

    const playersByPosition = getAllPlayersByPosition();

    // Calculate team percentages for each position
    const calculateTeamPercentages = (players) => {
      if (players.length === 0) return {};

      const teamCounts = {};
      players.forEach((player) => {
        const team = player.teamShortName || "Unknown";
        teamCounts[team] = (teamCounts[team] || 0) + 1;
      });

      const percentages = {};
      Object.entries(teamCounts).forEach(([team, count]) => {
        percentages[team] = Math.round((count / players.length) * 100);
      });

      return percentages;
    };

    analysis.positionComposition.defense = calculateTeamPercentages(
      playersByPosition.defense
    );
    analysis.positionComposition.midfield = calculateTeamPercentages(
      playersByPosition.midfield
    );
    analysis.positionComposition.attack = calculateTeamPercentages(
      playersByPosition.attack
    );

    // 3. Overall team distribution analysis
    const allPlayers = [
      ...Object.values(selectedPlayers),
      ...Object.values(benchPlayers),
    ];
    analysis.teamDistribution = calculateTeamPercentages(allPlayers);

    // 4. Expected fantasy score calculation
    const calculatePlayerExpectedScore = (player) => {
      if (!player.scouts?.average) return 0;

      const averages = player.scouts.average;
      let totalScore = 0;
      let statCount = 0;

      Object.values(averages).forEach((value) => {
        if (typeof value === "number") {
          totalScore += value;
          statCount++;
        }
      });

      return statCount > 0 ? totalScore : 0;
    };

    analysis.expectedScore = allPlayers.reduce((total, player) => {
      return total + calculatePlayerExpectedScore(player);
    }, 0);

    return analysis;
  };

  const handleAnalyzeTeam = () => {
    setAnalyzing(true);

    // Simulate analysis delay for better UX
    setTimeout(() => {
      const analysis = analyzeTeam();
      setTeamAnalysis(analysis);
      setAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  G
                </span>
              </div>
              <h1 className="text-xl font-bold">Criar Time</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Tournament Info Card */}
          {tournamentLoading ? (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ) : tournamentError ? (
            <Card className="mb-6 border-destructive">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{tournamentError}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => router.push("/matches")}
                >
                  Back to Matches
                </Button>
              </CardContent>
            </Card>
          ) : tournamentData ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {tournamentData.championshipName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Formation Selector */}
                  <div className="space-y-2">
                    <label htmlFor="formation" className="text-sm font-medium">
                      Formação
                    </label>
                    <select
                      id="formation"
                      value={formation}
                      onChange={(e) => handleFormationChange(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                      {formations.map((form) => (
                        <option key={form.value} value={form.value}>
                          {form.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Saved Teams Dropdown */}
                  {savedTeamNames.length > 0 && (
                    <div className="space-y-2">
                      <label
                        htmlFor="saved-teams"
                        className="text-sm font-medium"
                      >
                        Times Salvos
                      </label>
                      <div className="flex gap-2">
                        <select
                          id="saved-teams"
                          value={selectedSavedTeam}
                          onChange={(e) => {
                            setSelectedSavedTeam(e.target.value);
                            handleLoadFormation(e.target.value);
                          }}
                          className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        >
                          <option value="">Selecione um time salvo...</option>
                          {savedTeamNames.map((teamName) => (
                            <option key={teamName} value={teamName}>
                              {teamName}
                            </option>
                          ))}
                        </select>
                        {selectedSavedTeam && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteFormation(selectedSavedTeam)
                            }
                            className="px-3"
                            title="Deletar time"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => setTeamNameDialogOpen(true)}
                      disabled={!isFormationComplete() || isLoadingFormation}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoadingFormation ? "Carregando..." : "Salvar Time"}
                    </Button>
                    {!isFormationComplete() && (
                      <p className="text-xs text-muted-foreground">
                        Complete todas as posições para salvar
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Football Field */}
          {tournamentData && (
            <FootballField
              formation={formation}
              selectedPlayers={selectedPlayers}
              onPositionClick={handlePositionClick}
              onRemovePlayer={handleRemovePlayer}
              playersData={playersData}
              benchPlayers={benchPlayers}
              onBenchClick={handleBenchClick}
              onRemoveBenchPlayer={handleRemoveBenchPlayer}
            />
          )}

          {/* Create Team Button */}
          <Card className="mt-6">
            <CardContent className="p-4">
              <Button
                onClick={handleAnalyzeTeam}
                className="w-full"
                disabled={analyzing || !tournamentData || tournamentError}
              >
                {analyzing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Analisando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Analisar Time</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis */}
          {teamAnalysis && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Análise do Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 1. Completeness Analysis */}
                {teamAnalysis.completeness.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-orange-600">
                      Posições Incompletas
                    </h4>
                    <ul className="space-y-1">
                      {teamAnalysis.completeness.map((item, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground"
                        >
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 2. Position Composition */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black">Composição por Posição</h4>

                  {/* Defense */}
                  {Object.keys(teamAnalysis.positionComposition.defense)
                    .length > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Defesa:</div>
                      <div className="text-sm text-muted-foreground">
                        {Object.entries(
                          teamAnalysis.positionComposition.defense
                        )
                          .map(([team, percentage]) => `${percentage}% ${team}`)
                          .join(", ")}
                      </div>
                    </div>
                  )}

                  {/* Midfield */}
                  {Object.keys(teamAnalysis.positionComposition.midfield)
                    .length > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Meio-campo:</div>
                      <div className="text-sm text-muted-foreground">
                        {Object.entries(
                          teamAnalysis.positionComposition.midfield
                        )
                          .map(([team, percentage]) => `${percentage}% ${team}`)
                          .join(", ")}
                      </div>
                    </div>
                  )}

                  {/* Attack */}
                  {Object.keys(teamAnalysis.positionComposition.attack).length >
                    0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Ataque:</div>
                      <div className="text-sm text-muted-foreground">
                        {Object.entries(teamAnalysis.positionComposition.attack)
                          .map(([team, percentage]) => `${percentage}% ${team}`)
                          .join(", ")}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Strategic Analysis */}
                <div className="space-y-2">
                  <h4 className="font-black text-sm">Análise Estratégica</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {(() => {
                      const insights = [];
                      const defense = teamAnalysis.positionComposition.defense;
                      const midfield =
                        teamAnalysis.positionComposition.midfield;
                      const attack = teamAnalysis.positionComposition.attack;

                      // Defense analysis
                      const defenseTeams = Object.keys(defense);
                      if (
                        defenseTeams.length === 1 &&
                        defense[defenseTeams[0]] === 100
                      ) {
                        insights.push(
                          `Sua defesa é 100% ${defenseTeams[0]} - você espera que esta seleção não sofra gols.`
                        );
                      } else if (defenseTeams.length > 0) {
                        insights.push(
                          `Defesa diversificada entre ${defenseTeams.join(
                            ", "
                          )} - estratégia equilibrada.`
                        );
                      }

                      // Midfield analysis
                      const midfieldTeams = Object.keys(midfield);
                      if (midfieldTeams.length > 0) {
                        const dominantTeam = Object.entries(midfield).find(
                          ([_, p]) => p >= 66
                        );
                        if (dominantTeam) {
                          insights.push(
                            `Meio-campo dominado por ${dominantTeam[0]} (${dominantTeam[1]}%) - espera-se muitos desarmes e interceptações.`
                          );
                        } else {
                          insights.push(
                            `Meio-campo equilibrado - boa distribuição de responsabilidades.`
                          );
                        }
                      }

                      // Attack analysis
                      const attackTeams = Object.keys(attack);
                      if (
                        attackTeams.length === 1 &&
                        attack[attackTeams[0]] === 100
                      ) {
                        insights.push(
                          `Ataque 100% ${attackTeams[0]} - você espera muitos gols desta seleção.`
                        );
                      } else if (attackTeams.length > 0) {
                        insights.push(
                          `Ataque diversificado - múltiplas fontes de gols.`
                        );
                      }

                      return insights.length > 0
                        ? insights
                        : [
                            "Time ainda em construção - complete as posições para análise completa.",
                          ];
                    })().map((insight, index) => (
                      <div key={index}>• {insight}</div>
                    ))}
                  </div>
                </div>

                {/* 4. Expected Fantasy Score */}
                <div className="space-y-2">
                  <h4 className="font-black text-sm">Pontuação Esperada</h4>
                  <div className="text-sm text-muted-foreground">
                    Pontuação total esperada:{" "}
                    <span className="font-medium text-lg">
                      {teamAnalysis.expectedScore.toFixed(1)}
                    </span>{" "}
                    pontos
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Baseado na média de estatísticas de todos os jogadores
                    selecionados
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Bottom padding */}
      <div className="h-6"></div>

      {/* Player Selection Drawer */}
      <PlayerSelectionDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        positionType={selectedPositionType}
        playersData={playersData}
        onSelectPlayer={handleSelectPlayer}
        onRemovePlayer={handleRemovePlayerByObject}
        selectedPlayers={selectedPlayers}
        bestPlayersData={bestPlayersData}
        formation={formation}
        selectedPosition={selectedPosition}
        benchPlayers={benchPlayers}
      />

      {/* Team Name Dialog */}
      <TeamNameDialog
        isOpen={teamNameDialogOpen}
        onOpenChange={setTeamNameDialogOpen}
        onSave={handleSaveFormation}
        onCancel={() => setTeamNameDialogOpen(false)}
        title="Salvar Time"
        description="Digite um nome para o seu time"
        placeholder="Ex: Time Principal, Time Alternativo..."
        saveButtonText="Salvar"
        cancelButtonText="Cancelar"
      />
    </div>
  );
}

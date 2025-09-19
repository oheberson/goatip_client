"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import DemoWarning from "@/components/demo-warning";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Users,
  Save,
  Plus,
  AlertCircle,
  Loader,
  ArrowBigDownDash,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  getTournamentFromStorage,
  getBestPlayersFromStorage,
  setBestPlayersToStorage,
  hasValidBestPlayersData,
  saveFormationToStorage,
  getFormationFromStorage,
  getSavedTeamNames,
  deleteFormationFromStorage,
  getAllSavedTeams,
  getRandomParamsFromStorage,
  setRandomParamsToStorage,
} from "@/lib/localStorage-utils";
import {
  TOURNAMENTS,
  mapTeamName,
  generateTournamentKey,
} from "@/lib/constants";
import { FootballField } from "@/components/football-field";
import { PlayerSelectionDrawer } from "@/components/player-selection-drawer";
import { TeamNameDialog } from "@/components/team-name-dialog";
import { RandomTeamCard } from "@/components/random-team-card";
import { generateRandomTeam } from "@/lib/random-team-utils";

export default function CreateTeamPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const tournamentId = resolvedParams.tournament_id;
  const { isSubscribed } = useAuth();
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
  const [savedTeamsDropdownOpen, setSavedTeamsDropdownOpen] = useState(false);
  const [tournamentKey, setTournamentKey] = useState(null);
  const [savedRandomParams, setSavedRandomParams] = useState(null);

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
    if (tournamentKey) {
      const teamNames = getSavedTeamNames(tournamentKey);
      setSavedTeamNames(teamNames);

      // Load saved random parameters
      const randomParams = getRandomParamsFromStorage(tournamentKey);
      setSavedRandomParams(randomParams);
    }
  }, [tournamentKey]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        savedTeamsDropdownOpen &&
        !event.target.closest(".saved-teams-dropdown")
      ) {
        setSavedTeamsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [savedTeamsDropdownOpen]);

  // Save formation
  const handleSaveFormation = (teamName) => {
    if (!isFormationComplete() || !tournamentKey) {
      return;
    }

    const formationData = {
      formation,
      selectedPlayers: { ...selectedPlayers },
      benchPlayers: { ...benchPlayers },
      timestamp: Date.now(),
    };

    const success = saveFormationToStorage(
      tournamentKey,
      teamName,
      formationData
    );
    if (success) {
      // Update saved team names list
      const updatedTeamNames = getSavedTeamNames(tournamentKey);
      setSavedTeamNames(updatedTeamNames);
      setTeamNameDialogOpen(false);
    }
  };

  // Load formation
  const handleLoadFormation = (teamName) => {
    if (!teamName || !tournamentKey) return;

    setIsLoadingFormation(true);
    const formationData = getFormationFromStorage(tournamentKey, teamName);

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
    if (window.confirm(`Deseja deletar o time "${teamName}"?`)) {
      const success = deleteFormationFromStorage(tournamentKey, teamName);
      if (success) {
        const updatedTeamNames = getSavedTeamNames(tournamentKey);
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

      const data = await api.analytics.getBestPlayersByTeams(
        teamsArray,
        tournamentId,
        isSubscribed
      );
      setBestPlayersData(data.data || data);

      // Cache the data
      setBestPlayersToStorage(tournamentId, data.data || data);
    } catch (error) {
      console.error("Falha ao buscar dados de jogadores:", error);
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
            "Dados de torneio não encontrados. Volte e recarregue os torneios disponíveis."
          );
          return;
        }

        setTournamentData(tournament);

        // Generate unique tournament key
        const uniqueKey = generateTournamentKey(
          tournamentId,
          tournament.matches || []
        );
        setTournamentKey(uniqueKey);

        // Fetch best players data if tournament is available
        await fetchBestPlayersData(tournamentId, tournament.matches || []);

        // Get the first match for player data
        const firstMatch = tournament.matches?.[0];
        const playersData = await api.players.getByTournament(
          tournamentId,
          firstMatch?.id || 1, // Use round ID if available, fallback to 1
          isSubscribed
        );
        setPlayersData(playersData);
      } catch (error) {
        console.error("Error loading tournament data:", error);
        setTournamentError("Falha ao buscar dados do torneio");
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

      await api.fantasyTeams.create(teamData, isSubscribed);

      // Redirect to teams page after successful creation
      router.push("/teams");
    } catch (error) {
      console.error("Falha ao criar time:", error);
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

  // Team analysis function - analyzes all saved teams
  const analyzeAllTeams = () => {
    if (!tournamentKey) return null;

    const allSavedTeams = getAllSavedTeams(tournamentKey);
    const teamNames = Object.keys(allSavedTeams);

    if (teamNames.length === 0) {
      return {
        totalTeams: 0,
        teams: [],
        overallAnalysis: {
          positionComposition: {},
          teamDistribution: {},
          expectedScore: 0,
        },
        playerDependency: [],
        playerGrouping: {},
      };
    }

    const analysis = {
      totalTeams: teamNames.length,
      teams: [],
      overallAnalysis: {
        positionComposition: {},
        teamDistribution: {},
        expectedScore: 0,
      },
      playerDependency: [],
      playerGrouping: {},
    };

    // Analyze each saved team
    teamNames.forEach((teamName) => {
      const teamData = allSavedTeams[teamName];
      const teamAnalysis = analyzeSingleTeam(teamData, teamName);
      analysis.teams.push(teamAnalysis);
    });

    // Calculate overall analysis
    const allPlayers = [];
    analysis.teams.forEach((team) => {
      allPlayers.push(...team.allPlayers);
    });

    // Overall team distribution
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

    analysis.overallAnalysis.teamDistribution =
      calculateTeamPercentages(allPlayers);

    // Overall expected score
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

    analysis.overallAnalysis.expectedScore = allPlayers.reduce(
      (total, player) => {
        return total + calculatePlayerExpectedScore(player);
      },
      0
    );

    // Player dependency analysis
    analysis.playerDependency = calculatePlayerDependency(
      allSavedTeams,
      teamNames.length
    );

    // Player grouping analysis
    analysis.playerGrouping = calculatePlayerGrouping(allSavedTeams);

    return analysis;
  };

  // Calculate player dependency - how often each player appears across teams
  const calculatePlayerDependency = (allSavedTeams, totalTeams) => {
    const playerCounts = {};

    // Count how many teams each player appears in
    Object.values(allSavedTeams).forEach((teamData) => {
      const allPlayers = [
        ...Object.values(teamData.selectedPlayers),
        ...Object.values(teamData.benchPlayers),
      ];

      // Use a Set to avoid counting the same player multiple times in the same team
      const uniquePlayers = new Set();
      allPlayers.forEach((player) => {
        uniquePlayers.add(player.id);
      });

      uniquePlayers.forEach((playerId) => {
        const player = allPlayers.find((p) => p.id === playerId);
        if (player) {
          const key = `${player.name} (${player.teamShortName})`;
          if (!playerCounts[key]) {
            playerCounts[key] = {
              name: player.name,
              team: player.teamShortName,
              position: player.position,
              count: 0,
              percentage: 0,
            };
          }
          playerCounts[key].count++;
        }
      });
    });

    // Calculate percentages and sort by dependency
    const dependencyList = Object.values(playerCounts).map((player) => ({
      ...player,
      percentage: Math.round((player.count / totalTeams) * 100),
    }));

    return dependencyList.sort((a, b) => b.percentage - a.percentage);
  };

  // Calculate player grouping - find frequent player combinations per position
  const calculatePlayerGrouping = (allSavedTeams) => {
    const positionGroups = {
      GOL: {},
      ZAG: {},
      LAT: {},
      MEI: {},
      ATA: {},
    };

    // Group players by position and find combinations
    Object.values(allSavedTeams).forEach((teamData) => {
      const allPlayers = [
        ...Object.values(teamData.selectedPlayers),
        ...Object.values(teamData.benchPlayers),
      ];

      // Group players by position
      const playersByPosition = {};
      allPlayers.forEach((player) => {
        if (!playersByPosition[player.position]) {
          playersByPosition[player.position] = [];
        }
        playersByPosition[player.position].push(player);
      });

      // For each position, find combinations of 2 or more players
      Object.entries(playersByPosition).forEach(([position, players]) => {
        if (players.length >= 2) {
          // Create all possible combinations of 2 or more players
          const combinations = generateCombinations(players, 2);

          combinations.forEach((combination) => {
            const key = combination
              .map((p) => `${p.name} (${p.teamShortName})`)
              .sort()
              .join(" + ");

            if (!positionGroups[position][key]) {
              positionGroups[position][key] = {
                players: combination,
                count: 0,
                percentage: 0,
              };
            }
            positionGroups[position][key].count++;
          });
        }
      });
    });

    // Calculate percentages and filter out single occurrences
    const totalTeams = Object.keys(allSavedTeams).length;
    const result = {};

    Object.entries(positionGroups).forEach(([position, groups]) => {
      const validGroups = Object.values(groups)
        .filter((group) => group.count > 1)
        .map((group) => ({
          ...group,
          percentage: Math.round((group.count / totalTeams) * 100),
        }))
        .sort((a, b) => b.percentage - a.percentage);

      if (validGroups.length > 0) {
        result[position] = validGroups;
      }
    });

    return result;
  };

  // Helper function to generate combinations
  const generateCombinations = (arr, minSize) => {
    const combinations = [];

    const combine = (start, current) => {
      if (current.length >= minSize) {
        combinations.push([...current]);
      }

      for (let i = start; i < arr.length; i++) {
        current.push(arr[i]);
        combine(i + 1, current);
        current.pop();
      }
    };

    combine(0, []);
    return combinations;
  };

  // Analyze a single team
  const analyzeSingleTeam = (teamData, teamName) => {
    const { formation, selectedPlayers, benchPlayers } = teamData;

    const analysis = {
      teamName,
      formation,
      positionComposition: {},
      teamDistribution: {},
      expectedScore: 0,
      allPlayers: [],
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

    // Completeness check removed - teams can only be saved when complete

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
    analysis.allPlayers = allPlayers;
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
      const analysis = analyzeAllTeams();
      setTeamAnalysis(analysis);
      setAnalyzing(false);
    }, 1000);
  };

  // Handle random team generation
  const handleGenerateRandomTeam = async (randomParams) => {
    try {
      // Save random parameters to localStorage
      if (tournamentKey) {
        setRandomParamsToStorage(tournamentKey, randomParams);
        setSavedRandomParams(randomParams);
      }

      // Generate the random team
      const {
        selectedPlayers: newSelectedPlayers,
        benchPlayers: newBenchPlayers,
      } = generateRandomTeam(playersData, randomParams);

      // Update formation if different
      if (randomParams.formation !== formation) {
        setFormation(randomParams.formation);
      }

      // Clear current selections and set new ones
      setSelectedPlayers(newSelectedPlayers);
      setBenchPlayers(newBenchPlayers);

      // Clear any existing analysis
      setTeamAnalysis(null);
    } catch (error) {
      console.error("Error generating random team:", error);
      alert("Erro ao gerar time aleatório. Tente novamente.");
      throw error; // Re-throw to handle in dialog
    }
  };

  return (
    <ProtectedRoute>
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
                <h1 className="text-xl font-bold">Criar Time Fantasy</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6">
          {/* Demo Warning for non-subscribers */}
          {!isSubscribed && <DemoWarning />}
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
                    Voltar aos Torneios
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
                    {/* Formation and Controls Row */}
                    <div className="flex items-center gap-2">
                      {/* Formation Selector */}
                      <select
                        id="formation"
                        value={formation}
                        onChange={(e) => handleFormationChange(e.target.value)}
                        className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      >
                        {formations.map((form) => (
                          <option key={form.value} value={form.value}>
                            {form.label}
                          </option>
                        ))}
                      </select>

                      {/* Saved Teams Dropdown Trigger */}
                      {savedTeamNames.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSavedTeamsDropdownOpen(!savedTeamsDropdownOpen)
                          }
                          className="px-3"
                          title="Times Salvos"
                        >
                          <ArrowBigDownDash className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Delete Team Button */}
                      {savedTeamNames.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteFormation(selectedSavedTeam)
                          }
                          disabled={!selectedSavedTeam}
                          className="px-3"
                          title="Deletar time"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Save Button */}
                      <Button
                        onClick={() => setTeamNameDialogOpen(true)}
                        disabled={!isFormationComplete() || isLoadingFormation}
                        size="sm"
                        className="px-3"
                        title="Salvar time"
                      >
                        {isLoadingFormation ? (
                          <Loader className="w-4 h-4" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Saved Teams Dropdown */}
                    {savedTeamsDropdownOpen && savedTeamNames.length > 0 && (
                      <div className="saved-teams-dropdown border border-input rounded-md bg-background">
                        <div className="max-h-32 overflow-y-auto">
                          {savedTeamNames.map((teamName) => (
                            <button
                              key={teamName}
                              onClick={() => {
                                setSelectedSavedTeam(teamName);
                                handleLoadFormation(teamName);
                                setSavedTeamsDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                                selectedSavedTeam === teamName
                                  ? "bg-muted font-medium"
                                  : ""
                              }`}
                            >
                              {teamName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Random Team Generation Card */}
            {tournamentData && playersData && (
              <RandomTeamCard
                onGenerateTeam={handleGenerateRandomTeam}
                playersData={playersData}
                tournamentKey={tournamentKey}
                savedRandomParams={savedRandomParams}
              />
            )}

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

            {/* Analyze Teams Button - Only show if teams are saved */}
            {savedTeamNames.length > 0 && (
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
                        <span>
                          Analisando {savedTeamNames.length} time(s)...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>
                          Analisar {savedTeamNames.length} Time(s) Salvos
                        </span>
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Analysis */}
            {teamAnalysis && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Análise de {teamAnalysis.totalTeams} Time(s)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Analysis */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-base">Análise Geral</h3>

                    {/* Overall Team Distribution */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        Distribuição de Times
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {Object.keys(
                          teamAnalysis.overallAnalysis.teamDistribution
                        ).length > 0
                          ? Object.entries(
                              teamAnalysis.overallAnalysis.teamDistribution
                            )
                              .map(
                                ([team, percentage]) => `${percentage}% ${team}`
                              )
                              .join(", ")
                          : "Nenhum jogador selecionado"}
                      </div>
                    </div>

                    {/* Overall Expected Score */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        Pontuação Total Esperada
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-lg">
                          {(
                            teamAnalysis.overallAnalysis.expectedScore.toFixed(
                              1
                            ) / teamAnalysis.totalTeams
                          ).toFixed(1)}
                        </span>{" "}
                        pontos (média de todos os times)
                      </div>
                    </div>
                  </div>

                  {/* Player Dependency Analysis */}
                  {teamAnalysis.playerDependency.length > 0 && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-bold text-base">
                        Dependência de Jogadores
                      </h3>
                      <div className="text-sm text-muted-foreground mb-3">
                        Frequência de cada jogador nos times salvos
                      </div>
                      <div className="space-y-2">
                        {teamAnalysis.playerDependency.map((player, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {player.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {player.team} • {player.position}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-sm">
                                {player.count}/{teamAnalysis.totalTeams}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {player.percentage}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Player Grouping Analysis */}
                  {Object.keys(teamAnalysis.playerGrouping).length > 0 && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-bold text-base">
                        Grupos de Jogadores Frequentes
                      </h3>
                      <div className="text-sm text-muted-foreground mb-3">
                        Jogadores que aparecem juntos frequentemente por posição
                      </div>
                      <div className="space-y-4">
                        {Object.entries(teamAnalysis.playerGrouping).map(
                          ([position, groups]) => (
                            <div key={position} className="space-y-2">
                              <h4 className="font-medium text-sm capitalize">
                                {position === "GOL"
                                  ? "Goleiro"
                                  : position === "ZAG"
                                  ? "Zagueiro"
                                  : position === "LAT"
                                  ? "Lateral"
                                  : position === "MEI"
                                  ? "Meio-campo"
                                  : position === "ATA"
                                  ? "Ataque"
                                  : position}
                              </h4>
                              <div className="space-y-2">
                                {groups.map((group, groupIndex) => (
                                  <div
                                    key={groupIndex}
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">
                                        {group.players
                                          .map((p) => p.name)
                                          .join(" + ")}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {group.players
                                          .map((p) => p.teamShortName)
                                          .join(", ")}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium text-sm">
                                        {group.count}/{teamAnalysis.totalTeams}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {group.percentage}%
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* No grouping message */}
                  {Object.keys(teamAnalysis.playerGrouping).length === 0 &&
                    teamAnalysis.totalTeams > 1 && (
                      <div className="space-y-4 border-t pt-4">
                        <h3 className="font-bold text-base">
                          Grupos de Jogadores Frequentes
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          Nenhum grupo de jogadores frequente encontrado
                        </div>
                      </div>
                    )}
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
    </ProtectedRoute>
  );
}

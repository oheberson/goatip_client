"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DemoWarning from "@/components/demo-warning";
import { MobileMenu } from "@/components/mobile-menu";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Circle, Clock, Calendar, MapPin, MoveRight } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMatchesFromStorage,
  setMatchesToStorage,
  hasValidMatchesData,
} from "@/lib/localStorage-utils";
import { TOURNAMENTS } from "@/lib/constants";

export default function MatchesPage() {
  const router = useRouter();
  const { isSubscribed } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  // Filter matches to only include supported tournaments
  const filterSupportedTournaments = (matchesData) => {
    if (!matchesData || typeof matchesData !== "object") {
      return {};
    }

    const supportedTournamentIds = Object.keys(TOURNAMENTS);
    const filteredMatches = {};

    Object.entries(matchesData).forEach(([tournamentId, tournamentData]) => {
      if (supportedTournamentIds.includes(tournamentId)) {
        filteredMatches[tournamentId] = tournamentData;
      }
    });

    return filteredMatches;
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try to get data from localStorage
      const cachedData = getMatchesFromStorage();
      if (cachedData) {
        console.log("Using cached matches data");
        const filteredCachedData = filterSupportedTournaments(cachedData);
        setMatches(filteredCachedData);
        setLoading(false);
        return;
      }

      // If no cached data, fetch from API
      console.log("Fetching matches from API");
      const data = await api.matches.getAll(isSubscribed);

      // Filter to only include supported tournaments
      const filteredData = filterSupportedTournaments(data);

      // Store in localStorage for future use
      setMatchesToStorage(filteredData);
      setMatches(filteredData);
    } catch (err) {
      console.error("Falha ao buscar partidas:", err);
      setError(`Erro ao carregar partidas. Tente novamente.`);

      // Try to use cached data as fallback even if expired
      const fallbackData = getMatchesFromStorage();
      if (fallbackData) {
        console.log("Using expired cached data as fallback");
        const filteredFallbackData = filterSupportedTournaments(fallbackData);
        setMatches(filteredFallbackData);
        setError(null);
      } else {
        // Mock data for development
        const mockData = {
          brasileiro_2025: {
            championshipName: "Brasileiro 2025",
            matches: [
              {
                id: "brasileiro_2025-123",
                dateTimestamp: 1757011500,
                awayScore: null,
                homeScore: null,
                firstTeamId: "brasileiro_2025-123",
                secondTeamId: "brasileiro_2025-132",
                firstTeamName: "CEA",
                firstTeamLongName: "Ceará",
                secondTeamName: "COR",
                secondTeamLongName: "Corinthians",
              },
              {
                id: "brasileiro_2025-321",
                dateTimestamp: 1757011500,
                awayScore: null,
                homeScore: null,
                firstTeamId: "brasileiro_2025-321",
                secondTeamId: "brasileiro_2025-312",
                firstTeamName: "SPO",
                firstTeamLongName: "São Paulo",
                secondTeamName: "PAL",
                secondTeamLongName: "Palmeiras",
              },
            ],
            rooms: [
              {
                name: "Brasileiro Principal",
                prizes: 50005,
                capacity: -1,
                totalEntrances: 15,
                maxUserLineups: 300,
                guaranteedPrize: 10005,
                roomSeasonality: "DAILY",
                roomId: "0d4dfbf7-9446-441c-a270-29551640721f",
              },
              {
                name: "Ceará x Corinthians",
                prizes: 4005,
                capacity: -1,
                totalEntrances: 0,
                maxUserLineups: 100,
                guaranteedPrize: 4005,
                roomSeasonality: "SINGLE_MATCH",
                roomId: "061cd026-e3dc-442f-a678-a7bbeab3b0aa",
              },
            ],
          },
        };
        const filteredMockData = filterSupportedTournaments(mockData);
        setMatches(filteredMockData);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "live":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "upcoming":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "finished":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString * 1000);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month} ${hours}:${minutes}`;
  };

  const handleTournamentClick = (tournamentId, tournamentInfos) => {
    setSelectedTournament({ id: tournamentId, ...tournamentInfos });
    setDrawerOpen(true);
  };

  return (
    <ProtectedRoute allowDemo={true}>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  G
                </span>
              </div>
              <h1 className="text-xl font-bold">Torneios</h1>
            </div>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Demo Warning for non-subscribers */}
        {!isSubscribed && <DemoWarning />}
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Próximos torneios fantasy</h2>
          {/* <p className="text-muted-foreground">
            Track live scores and upcoming fixtures
          </p> */}
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchMatches} variant="outline">
                Tente novamente
              </Button>
            </CardContent>
          </Card>
        ) : Object.keys(matches).length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Circle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nenhuma partida encontrada</h3>
              <p className="text-muted-foreground">
                Volte e confira partidas disponíveis
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(matches).map(([tournamentId, tournamentInfos]) => (
              <div
                key={tournamentId}
                className="rounded-xl border bg-card text-card-foreground shadow cursor-pointer hover:shadow-md transition-shadow p-4 flex justify-center items-center"
                onClick={() =>
                  handleTournamentClick(tournamentId, tournamentInfos)
                }
              >
                <div className="w-full h-full">
                  <div className="flex flex-row justify-between items-center w-full h-full">
                    <span>{tournamentInfos.championshipName}</span>
                    <span>{/* <MoveRight className="w-5 h-5" /> */}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation />

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>

      {/* Drawer for Matches */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedTournament?.championshipName}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <div className="mb-4">
              <Button
                className="w-full"
                onClick={() => {
                  setDrawerOpen(false);
                  router.push(`/create-team/${selectedTournament.id}`);
                }}
              >
                Conferir detalhes do torneio
              </Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto space-y-4">
              {selectedTournament?.matches?.map((match, match_id) => (
                <Card
                  key={match_id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(match.dateTimestamp)}
                        </span>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium`}
                      >
                        {/* {match.status.toUpperCase()} */}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-center flex-1">
                        <div className="font-semibold text-lg">
                          {match.firstTeamLongName}
                        </div>
                        {match.firstTeamName}
                      </div>
                      <div className="text-muted-foreground mx-4">vs</div>
                      <div className="text-center flex-1">
                        <div className="font-semibold text-lg">
                          {match.secondTeamLongName}
                        </div>
                        {match.secondTeamName}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      </div>
    </ProtectedRoute>
  );
}

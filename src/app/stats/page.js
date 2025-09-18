"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MobileMenu } from "@/components/mobile-menu";
import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { TOURNAMENTS, STATS_MAP } from "@/lib/constants";
import { PlayerStatsDrawer } from "@/components/player-stats-drawer";
import { PlayerSortDialog } from "@/components/player-sort-dialog";
import {
  ViewToggle,
  PositionStatsChart,
  PositionRadarChart,
  Top10PlayersChart,
  TopTeamsChart,
  transformPlayerDataByPosition,
} from "@/components/charts";
import { Trophy, TrendingUp, Users, ArrowDownUp } from "lucide-react";

function PlayerCard({ player, onClick, sortBy = "weighted_fantasy_score" }) {
  const formatStatName = (statName) => {
    const translatedStatName = STATS_MAP[statName];
    return translatedStatName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getDisplayValue = (player, statKey) => {
    const value = player[statKey] || 0;
    const label = formatStatName(statKey) || statKey;

    // Format the value based on the stat type
    let formattedValue;
    if (statKey === "weighted_fantasy_score") {
      formattedValue = value.toFixed(1);
    } else if (statKey === "games_played") {
      formattedValue = value.toString();
    } else if (
      statKey === "goals" ||
      statKey === "assists" ||
      statKey === "saves" ||
      statKey === "tackles" ||
      statKey === "interceptions" ||
      statKey === "yellow_cards" ||
      statKey === "red_cards" ||
      statKey === "offsides" ||
      statKey === "penalties_lost" ||
      statKey === "penalties_saved" ||
      statKey === "wrong_passes"
    ) {
      formattedValue = value.toString();
    } else {
      // For other stats, show with 1 decimal place
      formattedValue = value.toFixed(1);
    }

    return { value, label, formattedValue };
  };

  const displayData = getDisplayValue(player, sortBy);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex gap-2">
                <h3 className="font-bold text-lg">{player.player}</h3>
                <Badge variant="secondary" className="text-xs">
                  {player.pos}
                </Badge>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex justify-between items-center gap-2">
              <p className="text-sm text-muted-foreground mb-2">
                {player.team}
              </p>
              <div className="flex flex-col items-end">
                <p className="text-sm text-muted-foreground mb-2">
                  {displayData.label}
                </p>
                <span className="font-bold text-primary">
                  {displayData.formattedValue}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TournamentSelector({
  tournaments,
  selectedTournament,
  onSelectTournament,
}) {
  return (
    <div className="mb-6 px-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Campeonatos disponíveis
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Object.values(tournaments).map((tournament) => (
          <Button
            key={tournament.id}
            variant={
              selectedTournament === tournament.id ? "default" : "outline"
            }
            size="sm"
            onClick={() => onSelectTournament(tournament.id)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Trophy className="w-4 h-4" />
            {tournament.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTournament, setSelectedTournament] =
    useState("brasileirao_2025");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState("list"); // 'list' or 'dynamic'
  const [sortBy, setSortBy] = useState("weighted_fantasy_score");

  const fetchBestPlayers = async (tournamentId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.analytics.getBestPlayers(tournamentId);
      setPlayers(data.data);
    } catch (err) {
      console.error("Falha ao buscar jogadores:", err);
      setError("Falha ao carregar estatística de jogadores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestPlayers(selectedTournament);
  }, [selectedTournament]);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedPlayer(null);
  };

  const handleTournamentChange = (tournamentId) => {
    setSelectedTournament(tournamentId);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleSortChange = (sortKey) => {
    setSortBy(sortKey);
  };

  // Sort players based on selected criteria
  const sortedPlayers = [...players].sort((a, b) => {
    const aValue = a[sortBy] || 0;
    const bValue = b[sortBy] || 0;

    // For most stats, higher is better, but for some defensive stats, lower is better
    const reverseSortStats = [
      "goals_against",
      "team_total_goals_conceded",
      "fouls_commited",
      "yellow_cards",
      "red_cards",
      "offsides",
      "penalties_lost",
      "wrong_passes",
    ];

    if (reverseSortStats.includes(sortBy)) {
      return aValue - bValue; // Lower is better
    }

    return bValue - aValue; // Higher is better
  });

  // Transform data for charts when in dynamic view
  const positionData =
    currentView === "dynamic" ? transformPlayerDataByPosition(players) : [];

  return (
    <ProtectedRoute>
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
              <h1 className="text-xl font-bold">Stats</h1>
            </div>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <h1 className="font-black px-2 mb-2">Melhores Jogadores</h1>
        {/* Tournament Selector */}
        <TournamentSelector
          tournaments={TOURNAMENTS}
          selectedTournament={selectedTournament}
          onSelectTournament={handleTournamentChange}
        />

        <div className="flex flex-col gap-0 mb-2 -mt-2 px-2 w-full">
          <p className="text-muted-foreground text-xs italic">
            *Dados das últimas 8 rodadas
          </p>
          <p className="text-muted-foreground text-xs italic">
            *Lista de 150 jogadores
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando estatísticas</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <div className="text-destructive mb-2">⚠️</div>
              <p className="text-destructive font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchBestPlayers(selectedTournament)}
                className="mt-3"
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Players List */}
        {!loading && !error && players.length > 0 && (
          <>
            <div
              className={`my-4 px-2 flex flex-row items-center ${
                currentView === "list" ? "justify-between" : "justify-end"
              }`}
            >
              {currentView === "list" && (
                <PlayerSortDialog
                  currentSort={sortBy}
                  onSortChange={handleSortChange}
                />
              )}
              <div className="flex items-center gap-2">
                <ViewToggle
                  currentView={currentView}
                  onViewChange={handleViewChange}
                />
              </div>
            </div>

            {currentView === "list" ? (
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <PlayerCard
                    key={`${player.player}-${index}`}
                    player={player}
                    onClick={() => handlePlayerClick(player)}
                    sortBy={sortBy}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Position Statistics Chart */}
                <Card>
                  <CardContent className="flex flex-col p-6">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold mb-2">
                        Média de Pontos por Posição
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Comparação da pontuação média dos jogadores agrupados
                        por posição
                      </p>
                    </div>
                    <PositionStatsChart data={positionData} />
                  </CardContent>
                </Card>

                {/* Position Radar Analysis Chart */}
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold mb-2">
                        Análise Detalhada por Posição
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Estatísticas que mais contribuem para a pontuação de
                        cada posição
                      </p>
                    </div>
                    <PositionRadarChart players={players} />
                  </CardContent>
                </Card>

                {/* Top 10 Players by Category Chart */}
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold mb-2">
                        Top 10 Jogadores por Categoria
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Ranking dos melhores jogadores em cada categoria de
                        estatísticas
                      </p>
                    </div>
                    <Top10PlayersChart players={players} />
                  </CardContent>
                </Card>

                {/* Top Teams by Category Chart */}
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold mb-2">
                        Ranking dos Times por Categoria
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Comparação dos times em cada categoria de estatísticas
                      </p>
                    </div>
                    <TopTeamsChart players={players} />
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && players.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Players Found</h3>
              <p className="text-muted-foreground">
                No player statistics available for this tournament
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Player Details Drawer */}
      <PlayerStatsDrawer
        player={selectedPlayer}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />

      {/* Bottom Navigation */}
      <Navigation />

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
      </div>
    </ProtectedRoute>
  );
}

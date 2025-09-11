"use client";

import { useState, useEffect } from "react";
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
import { TOURNAMENTS } from "@/lib/constants";
import { PlayerStatsDrawer } from "@/components/player-stats-drawer";
import {
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react";

function PlayerCard({ player, onClick }) {
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
                <p className="text-sm text-muted-foreground mb-2">Méd. Pts.</p>
                <span className="font-bold text-primary">
                  {player.weighted_fantasy_score.toFixed(1)}
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
    <div className="mb-6">
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
    useState("brasileirao-2025");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchBestPlayers = async (tournamentId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.analytics.getBestPlayers(tournamentId);
      setPlayers(data.data);
    } catch (err) {
      console.error("Failed to fetch best players:", err);
      setError("Failed to load player statistics");
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

  return (
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
        {/* Tournament Selector */}
        <TournamentSelector
          tournaments={TOURNAMENTS}
          selectedTournament={selectedTournament}
          onSelectTournament={handleTournamentChange}
        />

        <div className="mb-6">
          <p className="text-muted-foreground text-sm italic">
            Dados das últimas 8 rodadas
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading player statistics...
              </p>
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
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Players List */}
        {!loading && !error && players.length > 0 && (
          <div className="space-y-3">
            {players.map((player, index) => (
              <PlayerCard
                key={`${player.player}-${index}`}
                player={player}
                onClick={() => handlePlayerClick(player)}
              />
            ))}
          </div>
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
  );
}

"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DemoWarning from "@/components/demo-warning";
import { MobileMenu } from "@/components/mobile-menu";
import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { STATS_MAP, TOURNAMENTS_MAP_NAMES } from "@/lib/constants";
import { TipsDrawer } from "@/components/tips-drawer";
import { Questions } from "@/components/questions";
import { TipsFilter } from "@/components/tips-filter";
import { TrendingUp, Users, Trophy, Target } from "lucide-react";
import { formatPlayerName } from "../../lib/utils";

function TipsCard({ tip, onClick, type = "teams" }) {
  const formatStatName = (statName) => {
    const translatedStatName = STATS_MAP[statName];

    return translatedStatName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTournamentName = (tournamentName) => {
    return TOURNAMENTS_MAP_NAMES[tournamentName];
  };

  const getTipsCount = () => {
    const overCount = Object.keys(tip.next_match_over_likelihood || {}).length;
    const underCount = Object.keys(
      tip.next_match_under_likelihood || {}
    ).length;
    return overCount + underCount;
  };

  const tipsCount = getTipsCount();

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
                <h3 className="font-bold text-lg">
                  {type === "teams" ? tip.team : formatPlayerName(tip.player)}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {formatStatName(tip.variable)}
                </Badge>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="flex justify-between items-center gap-2">
              <p className="text-sm text-muted-foreground mb-2">
                {type === "teams"
                  ? formatTournamentName(tip.tournament)
                  : tip.team}
              </p>
              <div className="flex flex-col items-end">
                <p className="text-sm text-muted-foreground mb-2">
                  Média: {tip.average.toFixed(2)}
                </p>
                {tipsCount > 0 ? (
                  <span className="font-bold text-primary">
                    {tipsCount} dicas
                  </span>
                ) : (
                  <span className="font-bold text-primary">
                    Nenhuma sugestão
                  </span>
                )}
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
        {tournaments.map((tournament) => (
          <Button
            key={tournament}
            variant={selectedTournament === tournament ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectTournament(tournament)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Trophy className="w-4 h-4" />
            {TOURNAMENTS_MAP_NAMES[tournament]}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ViewToggle({ currentView, onViewChange }) {
  return (
    <div className="flex bg-muted rounded-lg p-1">
      <Button
        variant={currentView === "teams" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("teams")}
        className="flex items-center gap-2"
      >
        <Target className="w-4 h-4" />
        Times
      </Button>
      <Button
        variant={currentView === "players" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("players")}
        className="flex items-center gap-2"
      >
        <Users className="w-4 h-4" />
        Jogadores
      </Button>
    </div>
  );
}

export default function TipsPage() {
  const { isSubscribed, isFreeTrial } = useAuth();
  const [tipsData, setTipsData] = useState({
    teams: [],
    players: [],
    count: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [currentView, setCurrentView] = useState("teams");
  const [selectedTip, setSelectedTip] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVariables, setSelectedVariables] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);

  // Get unique tournaments from both teams and players data
  const availableTournaments = [
    ...new Set([
      ...tipsData.teams.map((tip) => tip.tournament),
      ...tipsData.players.map((tip) => tip.tournament),
    ]),
  ];

  // Get available variables and teams for the current tournament
  const currentData =
    currentView === "teams" ? tipsData.teams : tipsData.players;
  const tournamentFilteredData = currentData.filter(
    (tip) => !selectedTournament || tip.tournament === selectedTournament
  );

  const availableVariables = [
    ...new Set(tournamentFilteredData.map((tip) => tip.variable)),
  ];

  const availableTeams = [
    ...new Set(tournamentFilteredData.map((tip) => tip.team)),
  ];

  // Get filtered data based on selected tournament, variables, and teams
  const filteredData = tournamentFilteredData.filter((tip) => {
    const variableMatch =
      selectedVariables.length === 0 ||
      selectedVariables.includes(tip.variable);
    const teamMatch =
      selectedTeams.length === 0 || selectedTeams.includes(tip.team);
    return variableMatch && teamMatch;
  });

  const fetchTips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.tips.getTips(isSubscribed, isFreeTrial);
      setTipsData(data);
      // Set default tournament to the first available one
      if (data.teams.length > 0 || data.players.length > 0) {
        const firstTournament = [
          ...new Set([
            ...data.teams.map((tip) => tip.tournament),
            ...data.players.map((tip) => tip.tournament),
          ]),
        ][0];
        setSelectedTournament(firstTournament);
      }
    } catch (err) {
      console.error("Falha ao carregar tips:", err);
      setError("Falha ao carregar tips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const handleTipClick = (tip) => {
    setSelectedTip(tip);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTip(null);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    // Clear filters when switching views
    setSelectedVariables([]);
    setSelectedTeams([]);
  };

  const handleTournamentChange = (tournament) => {
    setSelectedTournament(tournament);
    // Clear filters when changing tournament
    setSelectedVariables([]);
    setSelectedTeams([]);
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
                <h1 className="text-xl font-bold">Tips</h1>
              </div>
              <MobileMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6">
          {/* Demo Warning for non-subscribers */}
          {!isSubscribed && !isFreeTrial && <DemoWarning />}
          <div className="flex items-center gap-2 px-2 mb-2">
            <h1 className="font-black">Dicas de Valor</h1>
            <Questions
              questionsText={[
                "Não é aconselhável fazer múltiplas com todas as seleções apresentadas.",
                "As dicas são baseadas em análises estatísticas de todo o campeonato.",
                "As probabilidades mostradas indicam a confiança na sugestão.",
                "Tenha um método de gestão de banca.",
                "As odds apresentadas são com base na probabilidade calculada. O método utilizado é a Distribuição de Poisson com base na média então ponderado pela frequência da ocorrência da estatística.",
                "Você encontrará valor quando houver discrepância entre a odd apresentada aqui e pela casa de apostas.",
              ]}
            />
          </div>

          {/* Stats Summary */}
          {tipsData.count && (
            <div className="mb-6 px-2">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    Times: {tipsData.count.teams_tips || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    Jogadores: {tipsData.count.players_tips || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    Total: {tipsData.count.total_tips || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tournament Selector */}
          {availableTournaments.length > 0 && (
            <TournamentSelector
              tournaments={availableTournaments}
              selectedTournament={selectedTournament}
              onSelectTournament={handleTournamentChange}
            />
          )}

          {/* Filter and View Toggle */}
          <div className="flex justify-between items-center mb-4 px-2">
            <TipsFilter
              availableVariables={availableVariables}
              availableTeams={availableTeams}
              selectedVariables={selectedVariables}
              selectedTeams={selectedTeams}
              onVariablesChange={setSelectedVariables}
              onTeamsChange={setSelectedTeams}
            />
            <ViewToggle
              currentView={currentView}
              onViewChange={handleViewChange}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando dicas</p>
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
                  onClick={fetchTips}
                  className="mt-3"
                >
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tips List */}
          {!loading && !error && filteredData.length > 0 && (
            <div className="space-y-3">
              {filteredData.map((tip, index) => (
                <TipsCard
                  key={`${currentView}-${index}`}
                  tip={tip}
                  onClick={() => handleTipClick(tip)}
                  type={currentView}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredData.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Nenhuma dica encontrada</h3>
                <p className="text-muted-foreground">
                  Não há dicas disponíveis para o campeonato selecionado
                </p>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Tips Details Drawer */}
        <TipsDrawer
          tip={selectedTip}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          type={currentView}
        />

        {/* Bottom Navigation */}
        <Navigation />

        {/* Bottom padding to account for fixed navigation */}
        <div className="h-20"></div>
      </div>
    </ProtectedRoute>
  );
}

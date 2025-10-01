"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { MobileMenu } from "@/components/mobile-menu";
import { Navigation } from "@/components/navigation";
import { TrialExpirationNotification } from "@/components/trial-expiration-notification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ArrowLeft,
  Search,
  Loader2,
  Trophy,
  Users,
  User,
  BarChart3,
} from "lucide-react";
import { TOURNAMENTS, STATS_MAP } from "@/lib/constants";
import { api } from "@/lib/api";

// Helper function to format stat names
const formatStatName = (statName) => {
  const translatedStatName = STATS_MAP[statName];
  return translatedStatName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function SearchPage() {
  const router = useRouter();
  const { isSubscribed, isFreeTrial } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [selectedTournaments, setSelectedTournaments] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedStats, setSelectedStats] = useState([]);

  // API data
  const [availableTeams, setAvailableTeams] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);

  // Carousel steps
  const steps = [
    {
      id: "tournaments",
      title: "Selecione os Torneios",
      description: "Escolha os torneios que deseja pesquisar",
      icon: Trophy,
    },
    {
      id: "teams",
      title: "Selecione os Times",
      description: "Escolha os times dos torneios selecionados",
      icon: Users,
    },
    {
      id: "players",
      title: "Selecione os Jogadores",
      description: "Escolha os jogadores dos times selecionados",
      icon: User,
    },
    {
      id: "stats",
      title: "Selecione as Estatísticas",
      description: "Escolha as estatísticas que deseja visualizar",
      icon: BarChart3,
    },
  ];

  // Load teams when tournaments change
  useEffect(() => {
    if (selectedTournaments.length > 0) {
      loadAvailableTeams();
    } else {
      setAvailableTeams([]);
      setSelectedTeams([]);
      setAvailablePlayers([]);
      setSelectedPlayers([]);
    }
    console.log("selected tournaments>>", selectedTournaments);
  }, [selectedTournaments]);

  // Load players when teams change
  useEffect(() => {
    if (selectedTeams.length > 0 && selectedTournaments.length > 0) {
      loadAvailablePlayers();
    } else {
      setAvailablePlayers([]);
      setSelectedPlayers([]);
    }
  }, [selectedTeams, selectedTournaments]);

  const loadAvailableTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.search.getAvailableTeams(
        selectedTournaments,
        isSubscribed,
        isFreeTrial
      );
      setAvailableTeams(data.teams || []);
    } catch (err) {
      setError("Erro ao carregar times disponíveis");
      console.error("Error loading teams:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.search.getAvailablePlayers(
        selectedTournaments,
        selectedTeams,
        isSubscribed,
        isFreeTrial
      );
      setAvailablePlayers(data.players || []);
    } catch (err) {
      setError("Erro ao carregar jogadores disponíveis");
      console.error("Error loading players:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentToggle = (tournamentId) => {
    setSelectedTournaments((prev) =>
      prev.includes(tournamentId)
        ? prev.filter((id) => id !== tournamentId)
        : [...prev, tournamentId]
    );
  };

  const handleTeamToggle = (teamName) => {
    setSelectedTeams((prev) =>
      prev.includes(teamName)
        ? prev.filter((name) => name !== teamName)
        : [...prev, teamName]
    );
  };

  const handlePlayerToggle = (playerName) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerName)
        ? prev.filter((name) => name !== playerName)
        : [...prev, playerName]
    );
  };

  const handleStatToggle = (statKey) => {
    setSelectedStats((prev) =>
      prev.includes(statKey)
        ? prev.filter((key) => key !== statKey)
        : [...prev, statKey]
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSearch = () => {
    if (selectedTournaments.length === 0 || selectedStats.length === 0) {
      setError("Selecione pelo menos um torneio e uma estatística");
      return;
    }

    // Build search parameters
    const params = new URLSearchParams();
    params.set('tournaments', selectedTournaments.join(","));
    params.set('columns', selectedStats.join(","));

    if (selectedTeams.length > 0) {
      params.set('teams', selectedTeams.join(","));
    }

    if (selectedPlayers.length > 0) {
      params.set('players', selectedPlayers.join(","));
    }

    // Redirect to results page with search parameters
    router.push(`/search/results?${params.toString()}`);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedTournaments.length > 0;
      case 1:
        return selectedTeams.length > 0;
      case 2:
        return selectedPlayers.length > 0;
      case 3:
        return selectedStats.length > 0;
      default:
        return false;
    }
  };

  const renderTournamentStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {Object.values(
          Object.fromEntries(
            Object.entries(TOURNAMENTS).filter(([key]) => key !== "suco_2025")
          )
        ).map((tournament) => (
          <div
            key={tournament.id}
            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
            onClick={() => handleTournamentToggle(tournament.id)}
          >
            <Checkbox
              checked={selectedTournaments.includes(tournament.id)}
              onChange={() => handleTournamentToggle(tournament.id)}
            />
            <div className="flex-1">
              <h3 className="font-medium">{tournament.name}</h3>
              <p className="text-sm text-muted-foreground">
                Temporada {tournament.season}
              </p>
            </div>
          </div>
        ))}
      </div>
      {selectedTournaments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTournaments.map((tournamentId) => (
            <Badge key={tournamentId} variant="secondary">
              {TOURNAMENTS[tournamentId]?.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  const renderTeamStep = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando times...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {availableTeams.map((team) => (
            <div
              key={team}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => handleTeamToggle(team)}
            >
              <Checkbox
                checked={selectedTeams.includes(team)}
                onChange={() => handleTeamToggle(team)}
              />
              <div className="flex-1">
                <h3 className="font-medium">{team}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedTeams.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTeams.map((team) => (
            <Badge key={team} variant="secondary">
              {team}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  const renderPlayerStep = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando jogadores...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {availablePlayers.map((player) => (
            <div
              key={player}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => handlePlayerToggle(player)}
            >
              <Checkbox
                checked={selectedPlayers.includes(player)}
                onChange={() => handlePlayerToggle(player)}
              />
              <div className="flex-1">
                <h3 className="font-medium">{player}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedPlayers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPlayers.map((player) => (
            <Badge key={player} variant="secondary">
              {player}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  const renderStatsStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(STATS_MAP).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
            onClick={() => handleStatToggle(key)}
          >
            <Checkbox
              checked={selectedStats.includes(key)}
              onChange={() => handleStatToggle(key)}
            />
            <div className="flex-1">
              <h3 className="font-medium">{formatStatName(key)}</h3>
              <p className="text-sm text-muted-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>
      {selectedStats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStats.map((stat) => (
            <Badge key={stat} variant="secondary">
              {formatStatName(stat)}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );


  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderTournamentStep();
      case 1:
        return renderTeamStep();
      case 2:
        return renderPlayerStep();
      case 3:
        return renderStatsStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  G
                </span>
              </div>
              <h1 className="text-xl font-bold">Busca Avançada</h1>
            </div>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <TrialExpirationNotification />

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Passo {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Current Step Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            {React.createElement(steps[currentStep].icon, {
              className: "w-6 h-6 text-primary",
            })}
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-muted-foreground">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Carousel Form */}
        <div className="max-w-2xl mx-auto">
          <Carousel
            className="w-full"
            opts={{
              align: "start",
            }}
          >
            <CarouselContent>
              <CarouselItem>
                <Card>
                  <CardContent className="p-6">
                    {renderCurrentStep()}
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
          </Carousel>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSearch}
                disabled={!canProceed() || loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Próximo
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <Navigation />

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
}

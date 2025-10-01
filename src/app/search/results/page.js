"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileMenu } from "@/components/mobile-menu";
import { Navigation } from "@/components/navigation";
import { TrialExpirationNotification } from "@/components/trial-expiration-notification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { STATS_MAP, TOURNAMENTS, TOURNAMENTS_MAP_NAMES } from "@/lib/constants";
import { api } from "@/lib/api";

// Helper function to format stat names
const formatStatName = (statName) => {
  const translatedStatName = STATS_MAP[statName];
  return translatedStatName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchFilters, setSearchFilters] = useState({});

  useEffect(() => {
    // Get search parameters from URL
    const tournaments = searchParams.get("tournaments");
    const teams = searchParams.get("teams");
    const players = searchParams.get("players");
    const columns = searchParams.get("columns");

    if (!tournaments || !columns) {
      setError("Parâmetros de busca inválidos");
      setLoading(false);
      return;
    }

    // Store filters for display
    setSearchFilters({
      tournaments: tournaments ? tournaments.split(",") : [],
      teams: teams ? teams.split(",") : [],
      players: players ? players.split(",") : [],
      columns: columns ? columns.split(",") : [],
    });

    // Perform the search
    performSearch(tournaments, teams, players, columns);
  }, [searchParams]);

  const performSearch = async (tournaments, teams, players, columns) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        tournaments,
        columns,
      };

      if (teams) {
        params.teams = teams;
      }

      if (players) {
        params.players = players;
      }

      console.log("Search params:", params);
      const data = await api.search.freeSearch(params, true, false); // Using mock data for now
      console.log("Search response:", data);
      setSearchResults(data.data || []);
    } catch (err) {
      setError("Erro ao realizar a busca");
      console.error("Error performing search:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    router.push("/search");
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
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
                  onClick={handleBack}
                  className="p-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    G
                  </span>
                </div>
                <h1 className="text-xl font-bold">Resultados da Busca</h1>
              </div>
              <MobileMenu />
            </div>
          </div>
        </header>

        {/* Loading State */}
        <main className="px-4 py-6">
          <TrialExpirationNotification />
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Buscando resultados...</p>
            </div>
          </div>
        </main>
        <Navigation />
        <div className="h-20"></div>
      </div>
    );
  }

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
                onClick={handleBack}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  G
                </span>
              </div>
              <h1 className="text-xl font-bold">Resultados da Busca</h1>
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

        {/* Results Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Resultados</h2>
          <p className="text-muted-foreground text-lg">
            {searchResults.length} resultado(s) encontrado(s)
          </p>
        </div>

        {/* Search Filters Summary */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-3">Filtros Aplicados:</h3>
          <div className="space-y-2 text-sm">
            {searchFilters.tournaments.length > 0 && (
              <div>
                <span className="font-medium">Torneios:</span>{" "}
                {searchFilters.tournaments
                  .map((el) => TOURNAMENTS[el].name)
                  .join(", ")}
              </div>
            )}
            {searchFilters.teams.length > 0 && (
              <div>
                <span className="font-medium">Times:</span>{" "}
                {searchFilters.teams.join(", ")}
              </div>
            )}
            {searchFilters.players.length > 0 && (
              <div>
                <span className="font-medium">Jogadores:</span>{" "}
                {searchFilters.players.join(", ")}
              </div>
            )}
            {searchFilters.columns.length > 0 && (
              <div>
                <span className="font-medium">Estatísticas:</span>{" "}
                {searchFilters.columns.map(formatStatName).join(", ")}
              </div>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {searchResults.map((result, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{result.player}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">{result.team}</span>
                    <span>•</span>
                    <span>{TOURNAMENTS_MAP_NAMES[result.tournament]}</span>
                    <span>•</span>
                    <span>Total/Média</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {searchFilters.columns.map((stat) => {
                      const totalValue = result[stat] || 0;
                      const gamesPlayed = result.games_played || 1;
                      const avgValue = (totalValue / gamesPlayed).toFixed(2);

                      return (
                        <div
                          key={stat}
                          className="text-center p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="mb-1 flex justify-center items-center">
                            <span className="text-3xl font-bold text-primary">
                              {totalValue}
                            </span>
                            <span className="text-xl font-normal text-muted-foreground ml-1">
                              /{avgValue}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground font-medium">
                            {formatStatName(stat)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Jogos disputados:
                      </span>
                      <span className="font-semibold">
                        {result.games_played || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">
              Nenhum resultado encontrado
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleNewSearch}
            className="min-w-[140px]"
          >
            Nova Busca
          </Button>
          <Button
            variant="outline"
            onClick={handleBack}
            className="min-w-[140px]"
          >
            Voltar
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <Navigation />

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}

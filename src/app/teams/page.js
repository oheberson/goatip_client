"use client";

import { useState, useEffect } from "react";
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
import { Plus, Users, Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-utils";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.teams.getAll();
      setTeams(data);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setError("Failed to load teams. Please try again.");
      // Mock data for development
      setTeams([
        {
          id: 1,
          name: "Champions United",
          formation: "4-3-3",
          players: 11,
          points: 85,
          lastMatch: "W 3-1",
        },
        {
          id: 2,
          name: "Fantasy FC",
          formation: "4-4-2",
          players: 11,
          points: 72,
          lastMatch: "D 1-1",
        },
        {
          id: 3,
          name: "Dream Team",
          formation: "3-5-2",
          players: 11,
          points: 68,
          lastMatch: "L 0-2",
        },
      ]);
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-xl font-bold">Teams</h1>
            </div>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">My Teams</h2>
            <p className="text-muted-foreground">
              Manage your fantasy soccer teams
            </p>
          </div>
          <Link href="/create-team">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Team
            </Button>
          </Link>
        </div>

        {/* Teams List */}
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
              <Button onClick={fetchTeams} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : teams.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No teams yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first fantasy team to get started
              </p>
              <Link href="/create-team">
                <Button>Create Team</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{team.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{team.formation}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Trophy className="w-4 h-4" />
                            <span>{team.points} pts</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{team.lastMatch}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {team.players} players
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation />

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
}

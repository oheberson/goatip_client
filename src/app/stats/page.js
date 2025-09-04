"use client";

import { MobileMenu } from "@/components/mobile-menu";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, Target, Award } from "lucide-react";

export default function StatsPage() {
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track your team performance and player statistics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">85</div>
                  <div className="text-xs text-muted-foreground">Total Points</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-xs text-muted-foreground">Goals Scored</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-xs text-muted-foreground">Clean Sheets</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold">7</div>
                  <div className="text-xs text-muted-foreground">Assists</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon */}
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Detailed Analytics Coming Soon</h3>
            <p className="text-muted-foreground">
              Advanced statistics and performance insights will be available here
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <Navigation />

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
}

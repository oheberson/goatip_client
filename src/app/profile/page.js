"use client";

import { MobileMenu } from "@/components/mobile-menu";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Settings, Trophy, Star } from "lucide-react";

export default function ProfilePage() {
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
              <h1 className="text-xl font-bold">Profile</h1>
            </div>
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Fantasy Manager</h2>
                <p className="text-muted-foreground">Level 5 Manager</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <Star className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-xs text-muted-foreground">Teams</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">85</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">12</div>
              <div className="text-xs text-muted-foreground">Rank</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <Trophy className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium text-sm">First Team</div>
                <div className="text-xs text-muted-foreground">Created your first fantasy team</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Top Scorer</div>
                <div className="text-xs text-muted-foreground">Scored 50+ points in a single match</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Notifications</span>
              <div className="w-10 h-6 bg-primary rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Dark Mode</span>
              <div className="w-10 h-6 bg-muted rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
              </div>
            </div>
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

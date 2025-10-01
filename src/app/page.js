"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { MobileMenu } from "@/components/mobile-menu";
import { Navigation } from "@/components/navigation";
import { TrialExpirationNotification } from "@/components/trial-expiration-notification";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  BarChart3,
  Plus,
  CheckCircle,
  Flag,
  TrendingUp,
  LogIn,
  Search,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user, loading, isSubscribed } = useAuth();
  const router = useRouter();

  // Development mode bypass
  const isDevelopmentMode =
    process.env.NEXT_PUBLIC_ENVIRONMENT === "development";

  console.log("iss dev>>>", isDevelopmentMode);

  useEffect(() => {
    if (!loading) {
      // Skip redirect in development mode
      if (isDevelopmentMode) {
        console.log("🔧 Development mode: Skipping home page redirect");
        return;
      }

      if (!user) {
        router.replace("/subscribe");
      }
      // Removed the redirect for authenticated but non-subscribed users
      // They can now access the home page and explore with demo data
    }
  }, [user, loading, isSubscribed, router, isDevelopmentMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
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
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  G
                </span>
              </div>
              <h1 className="text-xl font-bold">GOATIP</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* <Link href="/auth/login">
                <Button size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link> */}
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Trial Expiration Notification */}
        <TrialExpirationNotification />
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Assistente para Fantasy e Odds de valor
          </h2>
          <p className="text-muted-foreground">
            Melhores decisões para partidas de futebol com análise de dados
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/matches">
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Flag className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Criar Time Fantasy</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Comece a criar seu time
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/stats">
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">Analytics</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Acompanhe dados de jogadores
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/search">
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1">Busca</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Busca Avançada
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tips">
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-1">Tips</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Confira odds de valor
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New team created</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Team optimized</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </main>

      {/* Bottom Navigation */}
      <Navigation />

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Home,
  Users,
  BarChart3,
  User,
  Circle,
  Flag,
  Mail,
  Crown,
  LogOut,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { user, isSubscribed, isFreeTrial, trialInfo, signOut } = useAuth();

  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    /* { icon: Flag, label: "Matches", href: "/matches" }, */
    { icon: BarChart3, label: "Stats", href: "/stats" },
    { icon: User, label: "Tips", href: "/tips" },
  ];

  const handleSubscribe = () => {
    router.push("/subscribe");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                G
              </span>
            </div>
            <span>GOATIP</span>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {/* User Info Section */}
          {user && (
            <div className="space-y-3 pb-4 border-b">
              <h3 className="text-sm font-medium text-muted-foreground">
                Conta
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isSubscribed ? (
                    <>
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        Premium
                      </Badge>
                    </>
                  ) : isFreeTrial ? (
                    <>
                      <Crown className="h-4 w-4 text-blue-500" />
                      <Badge
                        variant="default"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        Teste Grátis ({trialInfo?.daysRemaining || 0} dias)
                      </Badge>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground text-amber-600 dark:text-amber-400" />
                      <Badge variant="secondary">Demo</Badge>
                    </>
                  )}
                </div>
                <div className="w-full flex flex-col gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                  {user && !isSubscribed && (
                    <Button
                      onClick={handleSubscribe}
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 flex-shrink-0"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Assinar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Navegação
            </h3>
            {menuItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  router.push(item.href);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Configurações
            </h3>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home as HomeIcon, TrendingUp, Target, Flag } from "lucide-react";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    {
      icon: HomeIcon,
      label: "Home",
      path: "/",
      active: pathname === "/",
    },
    {
      icon: Flag,
      label: "Torneios",
      path: "/matches",
      active: pathname === "/matches",
    },
    {
      icon: TrendingUp,
      label: "Stats",
      path: "/stats",
      active: pathname === "/stats",
    },
    {
      icon: Target,
      label: "Tips",
      path: "/tips",
      active: pathname === "/tips",
    },
  ];

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-mobile bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={`flex flex-col items-center space-y-1 p-2 h-auto ${
              item.active ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => handleNavigation(item.path)}
          >
            <item.icon className="w-5 h-5" />
            <span className={`text-xs ${item.active ? "font-medium" : ""}`}>
              {item.label}
            </span>
          </Button>
        ))}
      </div>
    </nav>
  );
}

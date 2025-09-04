"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Menu, Home, Users, BarChart3, User, Circle } from "lucide-react";

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

export function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Users, label: "Teams", href: "/teams" },
    { icon: Circle, label: "Matches", href: "/matches" },
    { icon: BarChart3, label: "Stats", href: "/stats" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

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
            <span>Goatip</span>
          </SheetTitle>
          <SheetDescription>Fantasy soccer team helper</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Navigation
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
              Settings
            </h3>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

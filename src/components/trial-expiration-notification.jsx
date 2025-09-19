"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Crown, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export function TrialExpirationNotification() {
  const { isFreeTrial, trialInfo } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not on free trial or if dismissed
  if (!isFreeTrial || !trialInfo || dismissed) {
    return null;
  }

  const daysRemaining = trialInfo.daysRemaining || 0;
  
  // Show different styles based on days remaining
  const getNotificationStyle = () => {
    if (daysRemaining <= 1) {
      return {
        bgColor: "bg-red-50 dark:bg-red-950",
        borderColor: "border-red-200 dark:border-red-800",
        textColor: "text-red-800 dark:text-red-200",
        iconColor: "text-red-600",
        icon: AlertTriangle
      };
    } else if (daysRemaining <= 3) {
      return {
        bgColor: "bg-orange-50 dark:bg-orange-950",
        borderColor: "border-orange-200 dark:border-orange-800",
        textColor: "text-orange-800 dark:text-orange-200",
        iconColor: "text-orange-600",
        icon: Clock
      };
    } else {
      return {
        bgColor: "bg-blue-50 dark:bg-blue-950",
        borderColor: "border-blue-200 dark:border-blue-800",
        textColor: "text-blue-800 dark:text-blue-200",
        iconColor: "text-blue-600",
        icon: Crown
      };
    }
  };

  const style = getNotificationStyle();
  const IconComponent = style.icon;

  const getMessage = () => {
    if (daysRemaining <= 1) {
      return "Seu teste grátis expira hoje! Não perca o acesso às funcionalidades premium.";
    } else if (daysRemaining <= 3) {
      return `Seu teste grátis expira em ${daysRemaining} dias. Inscreva-se agora para continuar aproveitando!`;
    } else {
      return `Você tem ${daysRemaining} dias restantes do seu teste grátis. Explore todas as funcionalidades!`;
    }
  };

  return (
    <Card className={`mb-4 ${style.bgColor} ${style.borderColor} border`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <IconComponent className={`w-5 h-5 mt-0.5 ${style.iconColor}`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${style.textColor} mb-2`}>
                {getMessage()}
              </p>
              <div className="flex gap-2">
                <Button
                  asChild
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Link href="/subscribe">
                    <Crown className="w-4 h-4 mr-1" />
                    Inscrever-se
                  </Link>
                </Button>
                {daysRemaining > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDismissed(true)}
                    className="text-muted-foreground"
                  >
                    Lembrar depois
                  </Button>
                )}
              </div>
            </div>
          </div>
          {daysRemaining > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

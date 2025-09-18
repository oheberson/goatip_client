"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DemoWarning() {
  const router = useRouter();

  const handleSubscribe = () => {
    router.push("/subscribe");
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
            Você está experienciando uma versão demo dessa página
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            Faça upgrade para acessar dados completos e recursos sem restrição.
          </p>
        </div>
        <Button
          onClick={handleSubscribe}
          size="sm"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 flex-shrink-0"
        >
          <Crown className="h-4 w-4 mr-2" />
          Assinar
        </Button>
      </div>
    </div>
  );
}

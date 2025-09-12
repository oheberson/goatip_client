"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SORT_OPTIONS = [
  {
    value: "expensive",
    label: "Mais caro",
    description: "Ordene por preço (maior primeiro)",
  },
  {
    value: "cheapest",
    label: "Mais barato",
    description: "Ordene por preço (menor primeiro)",
  },
  {
    value: "average",
    label: "Média",
    description: "Ordene por média (maior primeiro)",
  },
  {
    value: "shots",
    label: "Chutes",
    description: "Ordene por total de chutes (maior primeiro)",
  },
  {
    value: "goals",
    label: "Gols",
    description: "Ordene por gols (maior primeiro)",
  },
  {
    value: "saves",
    label: "Defesas",
    description: "Ordene por defesas (maior primeiro)",
  },
  {
    value: "sg",
    label: "SG",
    description: "Ordene por SG (mais frequente primeiro)",
  },
  {
    value: "tackles",
    label: "Desarmes",
    description: "Ordene por desarmes (maior primeiro)",
  },
  {
    value: "interceptions",
    label: "Interceptações",
    description: "Ordene por interceptações (maior primeiro)",
  },
  {
    value: "offsides",
    label: "Impedimentos",
    description: "Ordene por impedimentos (maior primeiro)",
  },
  {
    value: "wrong_passes",
    label: "Passes errados",
    description: "Ordene por passes errados (maior primeiro)",
  },
];

export function PlayerSortDialog({
  isOpen,
  onOpenChange,
  sortOption,
  onSortChange,
}) {
  const [localSortOption, setLocalSortOption] = useState(sortOption);

  // Update local sort option when props change
  useEffect(() => {
    setLocalSortOption(sortOption);
  }, [sortOption]);

  const handleSortSelect = (option) => {
    const newSortOption = localSortOption === option ? null : option;
    setLocalSortOption(newSortOption);
  };

  const handleApplySort = () => {
    onSortChange(localSortOption);
    onOpenChange(false);
  };

  const handleClearSort = () => {
    setLocalSortOption(null);
    onSortChange(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ordenar</DialogTitle>
          <DialogDescription>
            Escolha como ordenar os jogadores pelas estatíticas numéricas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sort Options */}
          <div className="space-y-2">
            {SORT_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                  localSortOption === option.value
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted/50 border-border"
                }`}
                onClick={() => handleSortSelect(option.value)}
              >
                <div
                  className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                    localSortOption === option.value
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {localSortOption === option.value && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClearSort}
              className="flex-1"
            >
              Limpar
            </Button>
            <Button onClick={handleApplySort} className="flex-1">
              Aplicar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

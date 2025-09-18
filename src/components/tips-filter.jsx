"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { STATS_MAP } from "@/lib/constants";
import { Filter, X } from "lucide-react";

export function TipsFilter({
  availableVariables = [],
  availableTeams = [],
  selectedVariables = [],
  selectedTeams = [],
  onVariablesChange,
  onTeamsChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatStatName = (statName) => {
    const translatedStatName = STATS_MAP[statName];
    return translatedStatName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleVariableToggle = (variable) => {
    if (selectedVariables.includes(variable)) {
      onVariablesChange(selectedVariables.filter((v) => v !== variable));
    } else {
      onVariablesChange([...selectedVariables, variable]);
    }
  };

  const handleTeamToggle = (team) => {
    if (selectedTeams.includes(team)) {
      onTeamsChange(selectedTeams.filter((t) => t !== team));
    } else {
      onTeamsChange([...selectedTeams, team]);
    }
  };

  const clearAllFilters = () => {
    onVariablesChange([]);
    onTeamsChange([]);
  };

  const hasActiveFilters =
    selectedVariables.length > 0 || selectedTeams.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtrar
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {selectedVariables.length + selectedTeams.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtrar Dicas
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Limpar tudo
              </Button>
            )}
          </DialogTitle>
          <DialogDescription className="flex justify-start">
            Selecione as variáveis e times para filtrar as dicas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Variables Section */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Variáveis</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableVariables.map((variable) => (
                <div key={variable} className="flex items-center space-x-2">
                  <Checkbox
                    id={`variable-${variable}`}
                    checked={selectedVariables.includes(variable)}
                    onCheckedChange={() => handleVariableToggle(variable)}
                  />
                  <label
                    htmlFor={`variable-${variable}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {formatStatName(variable)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Teams Section */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Times</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableTeams.map((team) => (
                <div key={team} className="flex items-center space-x-2">
                  <Checkbox
                    id={`team-${team}`}
                    checked={selectedTeams.includes(team)}
                    onCheckedChange={() => handleTeamToggle(team)}
                  />
                  <label
                    htmlFor={`team-${team}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {team}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-2">Filtros Ativos:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedVariables.map((variable) => (
                  <Badge
                    key={`active-var-${variable}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {formatStatName(variable)}
                    <button
                      onClick={() => handleVariableToggle(variable)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedTeams.map((team) => (
                  <Badge
                    key={`active-team-${team}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {team}
                    <button
                      onClick={() => handleTeamToggle(team)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

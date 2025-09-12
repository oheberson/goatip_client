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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shuffle, Shield, Target, Zap } from "lucide-react";

const FORMATIONS = [
  { value: "4-3-3", label: "4-3-3" },
  { value: "4-4-2", label: "4-4-2" },
  { value: "3-4-3", label: "3-4-3" },
  { value: "4-5-1", label: "4-5-1" },
  { value: "3-5-2", label: "3-5-2" },
  { value: "5-3-2", label: "5-3-2" },
  { value: "5-4-1", label: "5-4-1" },
];

const STRATEGY_OPTIONS = [
  {
    value: "defensivo",
    label: "Defensivo",
    description: "Prioriza desarmes, interceptações, SG e defesas",
    icon: Shield,
    color: "text-blue-600",
  },
  {
    value: "moderado",
    label: "Moderado",
    description: "Seleção balanceada sem prioridades específicas",
    icon: Target,
    color: "text-green-600",
  },
  {
    value: "ofensivo",
    label: "Ofensivo",
    description: "Prioriza finalizações e gols",
    icon: Zap,
    color: "text-red-600",
  },
];

export function RandomTeamDialog({
  isOpen,
  onOpenChange,
  onGenerateTeam,
  playersData,
  tournamentKey,
  savedRandomParams,
}) {
  const [formation, setFormation] = useState("4-3-3");
  const [useBenchStrategy, setUseBenchStrategy] = useState(false);
  const [defenseWithSG, setDefenseWithSG] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [strategy, setStrategy] = useState("moderado");
  const [availableTeams, setAvailableTeams] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load saved parameters when dialog opens
  useEffect(() => {
    if (isOpen && savedRandomParams) {
      setFormation(savedRandomParams.formation || "4-3-3");
      setUseBenchStrategy(savedRandomParams.useBenchStrategy || false);
      setDefenseWithSG(savedRandomParams.defenseWithSG || false);
      setSelectedTeams(savedRandomParams.selectedTeams || []);
      setStrategy(savedRandomParams.strategy || "moderado");
    }
  }, [isOpen, savedRandomParams]);

  // Extract available teams from players data
  useEffect(() => {
    if (playersData?.players) {
      const teams = [...new Set(playersData.players.map(player => player.teamName))].sort();
      setAvailableTeams(teams);
    }
  }, [playersData]);

  const handleTeamToggle = (teamName) => {
    setSelectedTeams(prev => 
      prev.includes(teamName) 
        ? prev.filter(team => team !== teamName)
        : [...prev, teamName]
    );
  };

  const handleSelectAllTeams = () => {
    setSelectedTeams([...availableTeams]);
  };

  const handleDeselectAllTeams = () => {
    setSelectedTeams([]);
  };

  const handleGenerate = async () => {
    if (selectedTeams.length === 0) {
      alert("Selecione pelo menos um time para continuar");
      return;
    }

    setIsGenerating(true);

    const randomParams = {
      formation,
      useBenchStrategy,
      defenseWithSG,
      selectedTeams,
      strategy,
    };

    try {
      await onGenerateTeam(randomParams);
      // Close dialog after successful generation
      onOpenChange(false);
    } catch (error) {
      console.error("Error generating team:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = selectedTeams.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="w-5 h-5" />
            Criar Time Aleatório
          </DialogTitle>
          <DialogDescription>
            Configure os parâmetros para gerar um time automaticamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formation Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Formação</label>
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              {FORMATIONS.map((form) => (
                <option key={form.value} value={form.value}>
                  {form.label}
                </option>
              ))}
            </select>
          </div>

          {/* Strategy Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Estratégia</label>
            <div className="grid grid-cols-1 gap-2">
              {STRATEGY_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-colors ${
                      strategy === option.value
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setStrategy(option.value)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 ${option.color}`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          strategy === option.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}>
                          {strategy === option.value && (
                            <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Team Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Times para Randomizar</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllTeams}
                  className="text-xs"
                >
                  Todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAllTeams}
                  className="text-xs"
                >
                  Nenhum
                </Button>
              </div>
            </div>
            <div className="max-h-32 overflow-y-auto border border-input rounded-md p-2 space-y-2">
              {availableTeams.map((teamName) => (
                <div key={teamName} className="flex items-center space-x-2">
                  <Checkbox
                    id={teamName}
                    checked={selectedTeams.includes(teamName)}
                    onCheckedChange={() => handleTeamToggle(teamName)}
                  />
                  <label
                    htmlFor={teamName}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {teamName}
                  </label>
                </div>
              ))}
            </div>
            {selectedTeams.length === 0 && (
              <p className="text-xs text-destructive">
                Selecione pelo menos um time para continuar
              </p>
            )}
          </div>

          {/* Advanced Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Opções Avançadas</label>
            
            {/* Use Bench Strategy */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useBenchStrategy"
                checked={useBenchStrategy}
                onCheckedChange={setUseBenchStrategy}
              />
              <label htmlFor="useBenchStrategy" className="text-sm cursor-pointer">
                Usar banco de reservas
              </label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              Coloca jogadores com status "nulo" ou "dúvida" no time titular e 
              jogadores mais prováveis no banco
            </p>

            {/* Defense with SG */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="defenseWithSG"
                checked={defenseWithSG}
                onCheckedChange={setDefenseWithSG}
              />
              <label htmlFor="defenseWithSG" className="text-sm cursor-pointer">
                Defesa com SG
              </label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              Seleciona jogadores da defesa (GOL, ZAG, LAT) do mesmo time para 
              maximizar chances de SG (sem gols sofridos)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Gerando Time...
                </>
              ) : (
                <>
                  <Shuffle className="w-4 h-4 mr-2" />
                  Gerar Time
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  CircleCheck,
  Cross,
  OctagonX,
  BadgeQuestionMark,
  CircleSlash,
  ArrowDownUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerFilterDialog } from "@/components/player-filter-dialog";
import { PlayerSortDialog } from "@/components/player-sort-dialog";
import {
  getPlayerFiltersFromStorage,
  setPlayerFiltersToStorage,
  clearPlayerFiltersFromStorage,
  getPlayerSortFromStorage,
  setPlayerSortToStorage,
  clearPlayerSortFromStorage,
} from "@/lib/localStorage-utils";

const POSITION_TYPES = {
  GK: "Goalkeeper",
  ZAG: "Defender",
  LAT: "Lateral",
  MEI: "Midfielder",
  ATA: "Attacker",
};

export function PlayerSelectionDrawer({
  isOpen,
  onClose,
  positionType,
  playersData,
  onSelectPlayer,
  selectedPlayers = {},
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [filters, setFilters] = useState({
    teams: [],
    statuses: [],
  });
  const [sortOption, setSortOption] = useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  // Load filters and sort from localStorage on component mount
  useEffect(() => {
    const savedFilters = getPlayerFiltersFromStorage();
    if (savedFilters) {
      setFilters(savedFilters);
    }

    const savedSort = getPlayerSortFromStorage();
    if (savedSort) {
      setSortOption(savedSort);
    }
  }, []);

  // Helper function to calculate total shots
  const calculateTotalShots = (player) => {
    const scouts = player.scouts?.total || {};
    return (
      (scouts.FD || 0) + (scouts.FF || 0) + (scouts.FT || 0) + (scouts.FB || 0)
    );
  };

  // Helper function to get scout value safely
  const getScoutValue = (player, key) => {
    return player.scouts?.total?.[key] || 0;
  };

  // Filter and sort players by position, search term, filters, and sort option
  useEffect(() => {
    if (!playersData || !positionType) {
      setFilteredPlayers([]);
      return;
    }

    let filtered = playersData.players?.filter((player) => {
      // Filter by position type
      const matchesPosition = player.position === positionType;

      // Filter by search term
      const matchesSearch =
        !searchTerm ||
        player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.teamName?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by teams
      const matchesTeams =
        !filters.teams?.length || filters.teams.includes(player.teamName);

      // Filter by status
      const matchesStatus =
        !filters.statuses?.length || filters.statuses.includes(player.status);

      return matchesPosition && matchesSearch && matchesTeams && matchesStatus;
    });

    // Apply sorting based on sort option
    if (sortOption) {
      filtered.sort((a, b) => {
        let valueA, valueB;

        switch (sortOption) {
          case "expensive":
            valueA = a.price || 0;
            valueB = b.price || 0;
            return valueB - valueA; // Descending
          case "cheapest":
            valueA = a.price || 0;
            valueB = b.price || 0;
            return valueA - valueB; // Ascending
          case "average":
            valueA = a.average || 0;
            valueB = b.average || 0;
            return valueB - valueA; // Descending
          case "shots":
            valueA = calculateTotalShots(a);
            valueB = calculateTotalShots(b);
            return valueB - valueA; // Descending
          case "saves":
            valueA = getScoutValue(a, "DS");
            valueB = getScoutValue(b, "DS");
            return valueB - valueA; // Descending
          case "sg":
            valueA = getScoutValue(a, "SG");
            valueB = getScoutValue(b, "SG");
            return valueB - valueA; // Descending
          case "tackles":
            valueA = getScoutValue(a, "DE");
            valueB = getScoutValue(b, "DE");
            return valueB - valueA; // Descending
          case "interceptions":
            valueA = getScoutValue(a, "IR");
            valueB = getScoutValue(b, "IR");
            return valueB - valueA; // Descending
          case "offsides":
            valueA = getScoutValue(a, "I");
            valueB = getScoutValue(b, "I");
            return valueB - valueA; // Descending
          case "wrong_passes":
            valueA = getScoutValue(a, "PE");
            valueB = getScoutValue(b, "PE");
            return valueB - valueA; // Descending
          case "goals":
            valueA = getScoutValue(a, "G");
            valueB = getScoutValue(b, "G");
            return valueB - valueA; // Descending
          default:
            return 0;
        }
      });
    } else {
      // Default sort by name
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    setFilteredPlayers(filtered);
  }, [playersData, positionType, searchTerm, filters, sortOption]);

  const handleSelectPlayer = (player) => {
    onSelectPlayer(player);
    onClose();
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Save to localStorage
    if (newFilters.teams?.length === 0 && newFilters.statuses?.length === 0) {
      clearPlayerFiltersFromStorage();
    } else {
      setPlayerFiltersToStorage(newFilters);
    }
  };

  const handleSortChange = (newSortOption) => {
    setSortOption(newSortOption);
    // Save to localStorage
    if (!newSortOption) {
      clearPlayerSortFromStorage();
    } else {
      setPlayerSortToStorage(newSortOption);
    }
  };

  const isPlayerSelected = (player) => {
    return Object.values(selectedPlayers).some(
      (selected) => selected.id === player.id
    );
  };

  const hasActiveFilters = () => {
    return filters.teams?.length > 0 || filters.statuses?.length > 0;
  };

  const hasActiveSort = () => {
    return sortOption !== null;
  };

  // Get the display value and label for the current sort option
  const getPlayerDisplayValue = (player) => {
    if (!sortOption) {
      // Default: show average with "Average" label
      return {
        value: player.average || 0,
        label: "Média",
        formatted: player.average ? player.average.toFixed(2) : "0.00",
      };
    }

    let value, label, formatted;

    switch (sortOption) {
      case "expensive":
      case "cheapest":
        value = player.price || 0;
        label = "Price";
        formatted = `$${value.toLocaleString()}`;
        break;
      case "average":
        value = player.average || 0;
        label = "Média";
        formatted = value.toFixed(2);
        break;
      case "shots":
        value = calculateTotalShots(player);
        label = "Finalizações";
        formatted = value.toString();
        break;
      case "saves":
        value = getScoutValue(player, "DS");
        label = "Defesas";
        formatted = value.toString();
        break;
      case "sg":
        value = getScoutValue(player, "SG");
        label = "SG";
        formatted = value.toString();
        break;
      case "tackles":
        value = getScoutValue(player, "DE");
        label = "Desarmes";
        formatted = value.toString();
        break;
      case "interceptions":
        value = getScoutValue(player, "IR");
        label = "Interceptações";
        formatted = value.toString();
        break;
      case "offsides":
        value = getScoutValue(player, "I");
        label = "Impedimentos";
        formatted = value.toString();
        break;
      case "wrong_passes":
        value = getScoutValue(player, "PE");
        label = "Passes Errados";
        formatted = value.toString();
        break;
      case "goals":
        value = getScoutValue(player, "G");
        label = "Gols";
        formatted = value.toString();
        break;
      default:
        value = player.average || 0;
        label = "Média";
        formatted = value.toFixed(2);
    }

    return { value, label, formatted };
  };

  const displayPlayerStatus = (playerStatus) => {
    if (playerStatus === "Provável")
      return (
        <span className="text-green-500">
          <CircleCheck />
        </span>
      );
    else if (playerStatus === "Contudido")
      return (
        <span className="text-red-450">
          <Cross />
        </span>
      );
    else if (playerStatus === "Dúvida")
      return (
        <span>
          <BadgeQuestionMark />
        </span>
      );
    else if (playerStatus === "Suspenso")
      return (
        <span>
          <OctagonX />
        </span>
      );
    return <CircleSlash />;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Selecionar</DrawerTitle>
          <DrawerDescription>
            {`Selecione o jogador para ${
              POSITION_TYPES[positionType] || "a posição"
            }`}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4">
          {/* Search Input, Sort Button, and Filter Button */}
          <div className="flex space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDialogOpen(true)}
              className={`px-3 ${
                hasActiveSort() ? "border-primary bg-primary/5" : ""
              }`}
            >
              <ArrowDownUp className="w-4 h-4" />
              {hasActiveSort() && (
                <div className="w-2 h-2 bg-primary rounded-full ml-1" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterDialogOpen(true)}
              className={`px-3 ${
                hasActiveFilters() ? "border-primary bg-primary/5" : ""
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {hasActiveFilters() && (
                <div className="w-2 h-2 bg-primary rounded-full ml-1" />
              )}
            </Button>
          </div>

          {/* Players List */}
          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm
                  ? "No players found matching your search"
                  : "No players available for this position"}
              </div>
            ) : (
              filteredPlayers.map((player) => (
                <Card
                  key={player.id}
                  className={`cursor-pointer transition-colors ${
                    isPlayerSelected(player)
                      ? "bg-muted border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() =>
                    !isPlayerSelected(player) && handleSelectPlayer(player)
                  }
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          <span className="flex gap-2 my-2">
                            {player.name || "Unknown Player"}
                            <span className="text-muted-foreground w-4 h-4">
                              {displayPlayerStatus(player.status)}
                            </span>
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {player.teamName || "Unknown Team"} •{" "}
                          {player.position || positionType}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          {(() => {
                            const displayData = getPlayerDisplayValue(player);
                            return (
                              <div className="flex flex-row items-center gap-2">
                                <div className="text-xl text-muted-foreground">
                                  {displayData.formatted}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {displayData.label}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      {isPlayerSelected(player) && (
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          Selected
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Close Button */}
          <Button variant="outline" className="w-full mt-4" onClick={onClose}>
            Cancel
          </Button>
        </div>

        {/* Filter Dialog */}
        <PlayerFilterDialog
          isOpen={filterDialogOpen}
          onOpenChange={setFilterDialogOpen}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          playersData={playersData}
        />

        {/* Sort Dialog */}
        <PlayerSortDialog
          isOpen={sortDialogOpen}
          onOpenChange={setSortDialogOpen}
          sortOption={sortOption}
          onSortChange={handleSortChange}
        />
      </DrawerContent>
    </Drawer>
  );
}

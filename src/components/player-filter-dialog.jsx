"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

export function PlayerFilterDialog({
  isOpen,
  onOpenChange,
  filters,
  onFiltersChange,
  playersData,
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Get unique teams and statuses from players data
  const getUniqueValues = (key) => {
    if (!playersData?.players) return [];
    const values = [
      ...new Set(
        playersData.players.map((player) => player[key]).filter(Boolean)
      ),
    ];
    return values.sort();
  };

  const uniqueTeams = getUniqueValues("teamName");
  const uniqueStatuses = getUniqueValues("status");

  const handleTeamToggle = (team) => {
    const newTeams = localFilters.teams?.includes(team)
      ? localFilters.teams.filter((t) => t !== team)
      : [...(localFilters.teams || []), team];

    setLocalFilters((prev) => ({
      ...prev,
      teams: newTeams,
    }));
  };

  const handleStatusToggle = (status) => {
    const newStatuses = localFilters.statuses?.includes(status)
      ? localFilters.statuses.filter((s) => s !== status)
      : [...(localFilters.statuses || []), status];

    setLocalFilters((prev) => ({
      ...prev,
      statuses: newStatuses,
    }));
  };


  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      teams: [],
      statuses: [],
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.teams?.length > 0 ||
      localFilters.statuses?.length > 0
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtro</DialogTitle>
          {/* <DialogDescription>
            Select filters to narrow down your player search
          </DialogDescription> */}
        </DialogHeader>

        <div className="space-y-6">
          {/* Teams Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Times</h3>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {uniqueTeams.map((team) => (
                <div
                  key={team}
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => handleTeamToggle(team)}
                >
                  <div
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                      localFilters.teams?.includes(team)
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {localFilters.teams?.includes(team) && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-sm">{team}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Status</h3>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {uniqueStatuses.map((status) => (
                <div
                  key={status}
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => handleStatusToggle(status)}
                >
                  <div
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                      localFilters.statuses?.includes(status)
                        ? "bg-primary border-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {localFilters.statuses?.includes(status) && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-sm">{status}</span>
                </div>
              ))}
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

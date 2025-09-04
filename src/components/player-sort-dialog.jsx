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
  { value: "expensive", label: "Expensive", description: "Sort by price (highest first)" },
  { value: "cheapest", label: "Cheapest", description: "Sort by price (lowest first)" },
  { value: "average", label: "Average", description: "Sort by average rating (highest first)" },
  { value: "shots", label: "Shots", description: "Sort by total shots (highest first)" },
  { value: "saves", label: "Saves", description: "Sort by saves (highest first)" },
  { value: "sg", label: "SG", description: "Sort by SG (highest first)" },
  { value: "tackles", label: "Tackles", description: "Sort by tackles (highest first)" },
  { value: "interceptions", label: "Interceptions", description: "Sort by interceptions (highest first)" },
  { value: "offsides", label: "Offsides", description: "Sort by offsides (highest first)" },
  { value: "wrong_passes", label: "Wrong Passes", description: "Sort by wrong passes (highest first)" },
  { value: "goals", label: "Goals", description: "Sort by goals (highest first)" },
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
          <DialogTitle>Sort Players</DialogTitle>
          <DialogDescription>
            Choose how to sort the players by numerical parameters
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
              Clear Sort
            </Button>
            <Button onClick={handleApplySort} className="flex-1">
              Apply Sort
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

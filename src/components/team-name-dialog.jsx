"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function TeamNameDialog({
  isOpen,
  onOpenChange,
  onSave,
  onCancel,
  title = "Save Formation",
  description = "Enter a name for your team formation",
  placeholder = "Enter team name...",
  saveButtonText = "Save",
  cancelButtonText = "Cancel",
}) {
  const [teamName, setTeamName] = useState("");

  const handleSave = () => {
    if (teamName.trim()) {
      onSave(teamName.trim());
      setTeamName("");
    }
  };

  const handleCancel = () => {
    setTeamName("");
    onCancel();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            autoFocus
          />
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {cancelButtonText}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!teamName.trim()}
            className="min-w-[80px]"
          >
            {saveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

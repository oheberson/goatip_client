"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shuffle } from "lucide-react";
import { RandomTeamDialog } from "@/components/random-team-dialog";

export function RandomTeamCard({ 
  onGenerateTeam, 
  playersData, 
  tournamentKey, 
  savedRandomParams 
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-4">
          <Button
            onClick={() => setDialogOpen(true)}
            className="w-full"
            variant="outline"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Criar Aleatório
          </Button>
        </CardContent>
      </Card>

      <RandomTeamDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onGenerateTeam={onGenerateTeam}
        playersData={playersData}
        tournamentKey={tournamentKey}
        savedRandomParams={savedRandomParams}
      />
    </>
  );
}

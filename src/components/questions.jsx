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
import { HelpCircle } from "lucide-react";

export function Questions({ questionsText = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!questionsText || questionsText.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full hover:bg-muted"
        >
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Informações Importantes
          </DialogTitle>
          <DialogDescription className="flex justify-start">
            Dicas sobre como usar essa seção:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {questionsText.map((text, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-primary">
                  {index + 1}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}


'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface IncidenceRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimatedIR: number;
  rationale: string;
  sources: string[];
}

export function IncidenceRateModal({
  isOpen,
  onClose,
  estimatedIR,
  rationale,
  sources,
}: IncidenceRateModalProps) {
  const getIRColorClass = (ir: number) => {
    if (ir < 20) return 'text-red-600';
    if (ir >= 20 && ir <= 40) return 'text-amber-500';
    return 'text-green-600';
  };

  const renderSourceItem = (source: string, index: number) => {
    try {
      const url = new URL(source);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return (
          <li key={index}>
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              {source}
            </a>
          </li>
        );
      }
    } catch (_) {
      // Not a valid URL
    }
    return <li key={index}>{source}</li>;
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Incidence Rate Estimate</DialogTitle>
          <DialogDescription>
            Here&apos;s how we estimated the likelihood of your target audience qualifying for this survey, based on your screening criteria and market selections.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow p-6">
          <div className="space-y-6">
            {/* Section 1: Estimated IR */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Estimated IR</p>
              <p className={cn("text-4xl font-bold", getIRColorClass(estimatedIR))}>
                {estimatedIR.toFixed(0)}%
              </p>
            </div>

            {/* Section 2: How This Was Calculated */}
            <div className="space-y-2">
              <h3 className="text-md font-semibold text-foreground">How This Was Calculated</h3>
              <div className="p-3 border rounded-md bg-muted/50 text-sm text-muted-foreground">
                {rationale || "Rationale not available."}
              </div>
            </div>

            {/* Section 3: Supporting Sources */}
            <div className="space-y-2">
              <h3 className="text-md font-semibold text-foreground">Data sources used</h3>
              {sources && sources.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {sources.map(renderSourceItem)}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No specific sources provided for this estimate.</p>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button 
            onClick={onClose}
            className="bg-[hsl(var(--action-button-bg))] text-[hsl(var(--action-button-fg))] hover:bg-[hsl(var(--action-button-bg))] hover:opacity-90"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

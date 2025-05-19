
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

interface SurveyLengthInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SurveyLengthInfoModal({ isOpen, onClose }: SurveyLengthInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Understanding Survey Length Estimate</DialogTitle>
          <DialogDescription>
            The estimated survey length (LOI - Length of Interview) is how long we anticipate it will take an average respondent to complete your survey.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-6">
        <div className="space-y-4 text-sm">
          <p>
            We estimate survey length based on the following:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Number of Questions:</strong> More questions generally mean a longer survey.
            </li>
            <li>
              <strong>Question Types:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-1">
                    <li><strong>Open-text questions:</strong> These typically take the longest for respondents to answer as they require typing out thoughts.</li>
                    <li><strong>Closed-text questions (single/multiple choice):</strong> These are usually quicker to answer.</li>
                    <li><strong>Scale questions:</strong> Rating scales are generally fast.</li>
                    <li><strong>Grid/Matrix questions:</strong> Can take longer if there are many rows/columns.</li>
                    <li><strong>Media questions (Photo/Video):</strong> Time for respondents to capture/upload media is considered.</li>
                </ul>
            </li>
            <li>
              <strong>Complexity of Questions:</strong> Questions requiring significant thought, recall, or complex decision-making can increase completion time.
            </li>
            <li>
              <strong>Survey Logic &amp; Routing:</strong> Complex skip patterns or conditional logic can affect the number of questions any single respondent sees, influencing their individual completion time. The estimate considers an average path.
            </li>
            <li>
              <strong>Introduction and Outro Text:</strong> Reading introductory and concluding remarks also contributes to the overall time.
            </li>
            <li>
              <strong>Respondent Familiarity:</strong> Respondents familiar with the survey topic might answer faster than those who are not. Our estimate assumes an average level of familiarity.
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            <strong>Note:</strong> Keeping surveys concise and engaging is crucial for data quality and respondent cooperation. We aim for an optimal length to balance research needs with respondent experience.
          </p>
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

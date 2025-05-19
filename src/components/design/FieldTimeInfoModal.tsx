
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

interface FieldTimeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FieldTimeInfoModal({ isOpen, onClose }: FieldTimeInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Understanding Estimated Field Time</DialogTitle>
          <DialogDescription>
            Field time is the duration your survey is expected to be live to collect the desired number of responses.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-6">
        <div className="space-y-4 text-sm">
          <p>
            The estimated field time is influenced by several key factors:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Sample Size:</strong> Larger sample sizes naturally require more time to fill.
            </li>
            <li>
              <strong>Incidence Rate (IR):</strong> A lower IR means fewer people in the general population qualify for your survey. This significantly increases the effort and time needed to find eligible respondents.
            </li>
            <li>
              <strong>Market Rarity/Specificity:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-1">
                    <li>Surveys targeting niche demographics or specific international markets can take longer due to smaller available respondent pools.</li>
                    <li>Ease of access to panel respondents in selected markets also plays a role.</li>
                </ul>
            </li>
            <li>
              <strong>Media Use (Photo/Video Questions):</strong> Surveys requiring photo or video uploads might have slightly longer field times as respondents need extra time to prepare and submit media. This can also affect drop-off rates if the task is perceived as too burdensome.
            </li>
            <li>
              <strong>Survey Length &amp; Complexity:</strong> Very long or complex surveys can lead to higher respondent fatigue and drop-off, potentially extending field time to reach quotas.
            </li>
            <li>
              <strong>Time of Year/Week:</strong> Fielding during major holidays or weekends can sometimes impact response rates and, consequently, field time.
            </li>
             <li>
              <strong>Panel Provider Performance:</strong> The efficiency and reach of the panel provider(s) used to source respondents are crucial.
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            <strong>Note:</strong> This estimate is based on typical project parameters. Actual field time can vary. We continuously monitor progress and may adjust strategies to optimize data collection.
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

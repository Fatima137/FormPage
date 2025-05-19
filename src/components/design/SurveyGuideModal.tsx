
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose, // Kept for the X button
  DialogFooter, // Added for the Close button
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Filter, 
  SquareCheckBig, 
  MessageSquareText, 
  Star, 
  Image as ImageIcon, 
  Video, 
  List, 
  X, 
  type LucideIcon,
} from 'lucide-react';

interface QuestionTypeInfo {
  icon: LucideIcon;
  title: string;
  description: string;
}

const questionTypes: QuestionTypeInfo[] = [
  {
    icon: Filter, 
    title: 'Screener', 
    description: 'Indicates a section designed to qualify or disqualify participants.',
  },
  {
    icon: SquareCheckBig,
    title: 'Closed Text',
    description: 'Question with pre-defined answer options.',
  },
  {
    icon: MessageSquareText,
    title: 'Open Text',
    description: 'Question allowing free-form text responses.',
  },
  {
    icon: Star,
    title: 'Scale Question',
    description: 'Question asking for a rating on a scale (e.g., 1-5 stars).',
  },
  {
    icon: ImageIcon,
    title: 'Photo Question',
    description: 'Question asking participants to upload a photo.',
  },
  {
    icon: Video,
    title: 'Video Question',
    description: 'Question asking participants to record or upload a video.',
  },
  {
    icon: List,
    title: 'Stimulus Info',
    description: 'Indicates where a test stimulus (e.g., concept, image) is presented.',
  },
];

interface SurveyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SurveyGuideModal({ isOpen, onClose }: SurveyGuideModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground p-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold">Question Type Guide</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 h-7 w-7 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        <ScrollArea className="flex-grow p-6">
          <ul className="space-y-6">
            {questionTypes.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.title} className="flex items-start space-x-4">
                  <IconComponent className="h-5 w-5 text-[hsl(var(--lavender-accent))] opacity-70 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
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


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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, Video as VideoIconLucide, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface VideoConfig {
  purpose: 'quantitative' | 'qualitative' | '';
  numVideos: number;
  description: string;
}

interface VideoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: VideoConfig) => void;
  sampleSize: number;
  initialSettings: VideoConfig | null;
}

export function VideoSettingsModal({
  isOpen,
  onClose,
  onSave,
  sampleSize,
  initialSettings,
}: VideoSettingsModalProps) {
  const [purpose, setPurpose] = React.useState<VideoConfig['purpose']>(initialSettings?.purpose || '');
  const [numVideos, setNumVideos] = React.useState<number>(initialSettings?.numVideos || 0);
  const [description, setDescription] = React.useState<string>(initialSettings?.description || '');
  const [hasManuallySetNumVideos, setHasManuallySetNumVideos] = React.useState(!!initialSettings?.numVideos);


  React.useEffect(() => {
    if (isOpen) {
      setPurpose(initialSettings?.purpose || '');
      setDescription(initialSettings?.description || '');
      setHasManuallySetNumVideos(!!initialSettings?.numVideos);

      if (initialSettings?.numVideos) {
        setNumVideos(initialSettings.numVideos);
      } else {
        const initialPurposeValue = initialSettings?.purpose || '';
        if (initialPurposeValue === 'quantitative') {
          setNumVideos(sampleSize);
        } else if (initialPurposeValue === 'qualitative') {
          setNumVideos(Math.max(1, Math.round(sampleSize * 0.1)));
        } else {
          setNumVideos(0); 
        }
      }
    }
  }, [isOpen, initialSettings, sampleSize]);

  React.useEffect(() => {
    if (!hasManuallySetNumVideos && isOpen) {
      if (purpose === 'quantitative') {
        setNumVideos(sampleSize);
      } else if (purpose === 'qualitative') {
        setNumVideos(Math.max(1, Math.round(sampleSize * 0.1)));
      }
    }
  }, [purpose, sampleSize, hasManuallySetNumVideos, isOpen]);

  const handleNumVideosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumVideos(parseInt(e.target.value, 10) || 0);
    setHasManuallySetNumVideos(true);
  };

  const handleSave = () => {
    if (isFormValid) {
      onSave({ purpose, numVideos, description });
      onClose(); 
    }
  };

  const getHelperTextForNumVideos = () => {
    if (purpose === 'quantitative') {
      return `Collecting one video per respondent. Default is current sample size (${sampleSize}).`;
    }
    if (purpose === 'qualitative') {
      return `Collecting a few illustrative videos. Default is ~10% of sample size (${Math.max(1, Math.round(sampleSize * 0.1))}).`;
    }
    return 'Specify the total number of videos you aim to collect.';
  };

  const isFormValid = purpose !== '' && description.trim() !== '' && numVideos > 0;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>What kind of videos do you need?</DialogTitle>
          <DialogDescription>
            Let us know how you want to collect and use respondent videos — for quant, for colour, or both.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="video-purpose">Video Collection Purpose</Label>
              <RadioGroup
                id="video-purpose"
                value={purpose}
                onValueChange={(value: VideoConfig['purpose']) => {
                  setPurpose(value);
                  setHasManuallySetNumVideos(false); 
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="purpose-quantitative-video"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-colors",
                    "hover:border-[hsl(var(--lavender-accent))]",
                    purpose === 'quantitative' ? "border-[hsl(var(--lavender-accent))] ring-2 ring-[hsl(var(--lavender-accent))]" : "border-muted"
                  )}
                >
                  <RadioGroupItem value="quantitative" id="purpose-quantitative-video" className="sr-only" />
                  <Users className="h-8 w-8 mb-2 text-[hsl(var(--lavender-accent))]" />
                  <span className="font-semibold">One video per respondent</span>
                  <span className="text-xs text-muted-foreground text-center">For quantitative classification</span>
                </Label>
                <Label
                  htmlFor="purpose-qualitative-video"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-colors",
                    "hover:border-[hsl(var(--lavender-accent))]",
                    purpose === 'qualitative' ? "border-[hsl(var(--lavender-accent))] ring-2 ring-[hsl(var(--lavender-accent))]" : "border-muted"
                  )}
                >
                  <RadioGroupItem value="qualitative" id="purpose-qualitative-video" className="sr-only" />
                  <VideoIconLucide className="h-8 w-8 mb-2 text-[hsl(var(--lavender-accent))]" />
                  <span className="font-semibold">Illustrative videos</span>
                  <span className="text-xs text-muted-foreground text-center">For qualitative storytelling</span>
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="num-videos">Number of Videos to Collect</Label>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs max-w-xs">{getHelperTextForNumVideos()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="num-videos"
                type="number"
                value={numVideos}
                onChange={handleNumVideosChange}
                min="0"
                disabled={purpose === ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-description">Describe the Type of Video(s)</Label>
              <Textarea
                id="video-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Closet tour, daily routines, product unboxing, a short testimonial"
                rows={3}
                disabled={purpose === ''}
              />
              <p className="text-xs text-muted-foreground">
                This description will help guide respondents.
              </p>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t">
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={!isFormValid}
            className="bg-[hsl(var(--action-button-bg))] text-[hsl(var(--action-button-fg))] hover:bg-[hsl(var(--action-button-bg))] hover:opacity-90"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

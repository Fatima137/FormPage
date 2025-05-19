
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
import { Users, ImagePlus, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';


export interface PhotoConfig {
  purpose: 'quantitative' | 'qualitative' | '';
  numPhotos: number;
  description: string;
}

interface PhotoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: PhotoConfig) => void;
  sampleSize: number;
  initialSettings: PhotoConfig | null;
}

export function PhotoSettingsModal({
  isOpen,
  onClose,
  onSave,
  sampleSize,
  initialSettings,
}: PhotoSettingsModalProps) {
  const [purpose, setPurpose] = React.useState<PhotoConfig['purpose']>(initialSettings?.purpose || '');
  const [numPhotos, setNumPhotos] = React.useState<number>(initialSettings?.numPhotos || 0);
  const [description, setDescription] = React.useState<string>(initialSettings?.description || '');
  const [hasManuallySetNumPhotos, setHasManuallySetNumPhotos] = React.useState(!!initialSettings?.numPhotos);


  React.useEffect(() => {
    if (isOpen) {
      setPurpose(initialSettings?.purpose || '');
      setDescription(initialSettings?.description || '');
      setHasManuallySetNumPhotos(!!initialSettings?.numPhotos);

      if (initialSettings?.numPhotos) {
        setNumPhotos(initialSettings.numPhotos);
      } else {
        const initialPurposeValue = initialSettings?.purpose || '';
        if (initialPurposeValue === 'quantitative') {
          setNumPhotos(sampleSize);
        } else if (initialPurposeValue === 'qualitative') {
          setNumPhotos(Math.max(1, Math.round(sampleSize * 0.1)));
        } else {
          setNumPhotos(0); 
        }
      }
    }
  }, [isOpen, initialSettings, sampleSize]);

  React.useEffect(() => {
    if (!hasManuallySetNumPhotos && isOpen) {
      if (purpose === 'quantitative') {
        setNumPhotos(sampleSize);
      } else if (purpose === 'qualitative') {
        setNumPhotos(Math.max(1, Math.round(sampleSize * 0.1)));
      }
    }
  }, [purpose, sampleSize, hasManuallySetNumPhotos, isOpen]);

  const handleNumPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumPhotos(parseInt(e.target.value, 10) || 0);
    setHasManuallySetNumPhotos(true);
  };

  const handleSave = () => {
    if (isFormValid) {
      onSave({ purpose, numPhotos, description });
      onClose();
    }
  };

  const getHelperTextForNumPhotos = () => {
    if (purpose === 'quantitative') {
      return `Collecting one photo per respondent. Default is current sample size (${sampleSize}).`;
    }
    if (purpose === 'qualitative') {
      return `Collecting a few illustrative photos. Default is ~10% of sample size (${Math.max(1, Math.round(sampleSize * 0.1))}).`;
    }
    return 'Specify the total number of photos you aim to collect.';
  };

  const isFormValid = purpose !== '' && description.trim() !== '' && numPhotos > 0;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>What kind of photos do you need?</DialogTitle>
          <DialogDescription>
            Let us know how you want to collect and use respondent photos — for quant, for colour, or both.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="photo-purpose">Photo Collection Purpose</Label>
              <RadioGroup
                id="photo-purpose"
                value={purpose}
                onValueChange={(value: PhotoConfig['purpose']) => {
                  setPurpose(value);
                  setHasManuallySetNumPhotos(false);
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="purpose-quantitative"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-colors",
                    "hover:border-[hsl(var(--lavender-accent))]",
                    purpose === 'quantitative' ? "border-[hsl(var(--lavender-accent))] ring-2 ring-[hsl(var(--lavender-accent))]" : "border-muted"
                  )}
                >
                  <RadioGroupItem value="quantitative" id="purpose-quantitative" className="sr-only" />
                  <Users className="h-8 w-8 mb-2 text-[hsl(var(--lavender-accent))]" />
                  <span className="font-semibold">One per respondent</span>
                  <span className="text-xs text-muted-foreground text-center">For quantitative classification</span>
                </Label>
                <Label
                  htmlFor="purpose-qualitative"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-colors",
                    "hover:border-[hsl(var(--lavender-accent))]",
                    purpose === 'qualitative' ? "border-[hsl(var(--lavender-accent))] ring-2 ring-[hsl(var(--lavender-accent))]" : "border-muted"
                  )}
                >
                  <RadioGroupItem value="qualitative" id="purpose-qualitative" className="sr-only" />
                  <ImagePlus className="h-8 w-8 mb-2 text-[hsl(var(--lavender-accent))]" />
                  <span className="font-semibold">Illustrative photos</span>
                  <span className="text-xs text-muted-foreground text-center">For qualitative storytelling</span>
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="num-photos">Number of Photos to Collect</Label>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs max-w-xs">{getHelperTextForNumPhotos()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="num-photos"
                type="number"
                value={numPhotos}
                onChange={handleNumPhotosChange}
                min="0"
                disabled={purpose === ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo-description">Describe the Type of Photo(s)</Label>
              <Textarea
                id="photo-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Product on shelf, kitchen setup, a moment of joy, user's workspace"
                rows={3}
                disabled={purpose === ''}
              />
              <p className="text-xs text-muted-foreground">
                This description will help guide respondents or be used for AI classification if applicable.
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

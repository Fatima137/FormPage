
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  PartyPopper,
  HeartHandshake,
  Wrench,
  ShoppingCart,
  UserPlus,
  Repeat,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SegmentationConfig {
  segmentationGoal: 'create_new' | 'map_existing' | '';
  segmentationBases: {
    audiences: boolean;
    occasions: boolean;
    needStates: boolean;
    jobsToBeDone: boolean;
    shopperMissions: boolean;
  };
  overallUseCaseDescription: string;
}

interface SegmentationBasisOption {
  id: keyof SegmentationConfig['segmentationBases'];
  label: string;
  Icon: LucideIcon;
}

const segmentationBasisOptions: SegmentationBasisOption[] = [
  { id: 'audiences', label: 'Audiences', Icon: Users },
  { id: 'occasions', label: 'Occasions', Icon: PartyPopper },
  { id: 'needStates', label: 'Need States', Icon: HeartHandshake },
  { id: 'jobsToBeDone', label: 'Jobs to Be Done', Icon: Wrench },
  { id: 'shopperMissions', label: 'Shopper Missions', Icon: ShoppingCart },
];

interface SegmentationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: SegmentationConfig) => void;
  initialSettings: SegmentationConfig | null;
}

export function SegmentationSettingsModal({
  isOpen,
  onClose,
  onSave,
  initialSettings,
}: SegmentationSettingsModalProps) {
  const [segmentationGoal, setSegmentationGoal] = React.useState<SegmentationConfig['segmentationGoal']>(initialSettings?.segmentationGoal || '');
  const [segmentationBases, setSegmentationBases] = React.useState<SegmentationConfig['segmentationBases']>(
    initialSettings?.segmentationBases || {
      audiences: false,
      occasions: false,
      needStates: false,
      jobsToBeDone: false,
      shopperMissions: false,
    }
  );
  const [overallUseCaseDescription, setOverallUseCaseDescription] = React.useState<string>(initialSettings?.overallUseCaseDescription || '');

  React.useEffect(() => {
    if (isOpen) {
      setSegmentationGoal(initialSettings?.segmentationGoal || '');
      setSegmentationBases(
        initialSettings?.segmentationBases || {
          audiences: false,
          occasions: false,
          needStates: false,
          jobsToBeDone: false,
          shopperMissions: false,
        }
      );
      setOverallUseCaseDescription(initialSettings?.overallUseCaseDescription || '');
    }
  }, [isOpen, initialSettings]);

  const handleBasisToggle = (basisId: keyof SegmentationConfig['segmentationBases']) => {
    setSegmentationBases((prev) => ({ ...prev, [basisId]: !prev[basisId] }));
  };

  const isFormValid = React.useMemo(() => {
    const goalSelected = !!segmentationGoal;
    const atLeastOneBasisSelected = Object.values(segmentationBases).some(Boolean);
    const descriptionFilled = overallUseCaseDescription.trim() !== '';
    
    return goalSelected && atLeastOneBasisSelected && descriptionFilled;
  }, [segmentationGoal, segmentationBases, overallUseCaseDescription]);

  const handleSave = () => {
    if (!isFormValid) return;

    onSave({
      segmentationGoal,
      segmentationBases,
      overallUseCaseDescription,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>How do you want to segment your responses?</DialogTitle>
          <DialogDescription>
            We’ll shape your survey to uncover meaningful, actionable segments.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-6">
            <div className="grid gap-6">
            {/* Section 1: I want to... */}
            <div className="space-y-3">
                <Label className="text-md font-semibold">I want to:</Label>
                <RadioGroup
                value={segmentationGoal}
                onValueChange={(value: 'create_new' | 'map_existing') => setSegmentationGoal(value)}
                className="flex flex-col sm:flex-row gap-3"
                >
                <Label
                    htmlFor="goal-create-new"
                    className={cn(
                    "flex-1 flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-colors hover:border-[hsl(var(--lavender-accent))]",
                    segmentationGoal === 'create_new' ? "border-[hsl(var(--lavender-accent))] ring-2 ring-[hsl(var(--lavender-accent))]" : "border-muted"
                    )}
                >
                    <RadioGroupItem value="create_new" id="goal-create-new" className="sr-only" />
                    <UserPlus className="h-7 w-7 text-[hsl(var(--lavender-accent))]" />
                    <div>
                    <span className="font-medium">Create new target segments</span>
                    <p className="text-xs text-muted-foreground">Build segments from scratch using your survey data.</p>
                    </div>
                </Label>
                <Label
                    htmlFor="goal-map-existing"
                    className={cn(
                    "flex-1 flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-colors hover:border-[hsl(var(--lavender-accent))]",
                    segmentationGoal === 'map_existing' ? "border-[hsl(var(--lavender-accent))] ring-2 ring-[hsl(var(--lavender-accent))]" : "border-muted"
                    )}
                >
                    <RadioGroupItem value="map_existing" id="goal-map-existing" className="sr-only" />
                    <Repeat className="h-7 w-7 text-[hsl(var(--lavender-accent))]" />
                    <div>
                    <span className="font-medium">Map onto existing segments</span>
                    <p className="text-xs text-muted-foreground">Apply survey data to pre-defined personas or clusters.</p>
                    </div>
                </Label>
                </RadioGroup>
            </div>

            {/* Section 2: Segment based on... */}
            <div className="space-y-3">
                <Label className="text-md font-semibold">Segment based on:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {segmentationBasisOptions.map(({ id, label, Icon }) => (
                    <Card
                    key={id}
                    onClick={() => handleBasisToggle(id)}
                    className={cn(
                        "cursor-pointer transition-all p-4 hover:shadow-md",
                        segmentationBases[id]
                        ? "border-[hsl(var(--lavender-accent))] ring-2 ring-[hsl(var(--lavender-accent))] bg-[hsl(var(--lavender-accent))]/5"
                        : "border-border bg-card"
                    )}
                    >
                    <CardContent className="p-0 flex flex-col items-center text-center gap-2">
                        <Icon className="h-8 w-8 text-[hsl(var(--lavender-accent))]" />
                        <span className="text-sm font-medium">{label}</span>
                    </CardContent>
                    </Card>
                ))}
                </div>
            </div>

            {/* Section 3: How will you use these segments? */}
            <div className="space-y-3">
                <Label htmlFor="use-case-description" className="text-md font-semibold">How will you use these segments?</Label>
                <Textarea
                id="use-case-description"
                value={overallUseCaseDescription}
                onChange={(e) => setOverallUseCaseDescription(e.target.value)}
                placeholder="Describe your primary objectives for these segments..."
                rows={3}
                />
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


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
import { Badge } from '@/components/ui/badge';
import { Search, Activity } from 'lucide-react'; // Added Activity
import { cn } from '@/lib/utils';
import type { PhotoConfig } from './PhotoSettingsModal';
import type { VideoConfig } from './VideoSettingsModal';
import type { Country } from './CountryCombobox';

interface FeasibilityInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  feasibilityScore: number;
  estimatedIR: number | null;
  sampleSize: number;
  photoConfig: PhotoConfig | null;
  videoConfig: VideoConfig | null;
  selectedCountries: Country[];
}

export function FeasibilityInfoModal({
  isOpen,
  onClose,
  feasibilityScore,
  estimatedIR,
  sampleSize,
  photoConfig,
  videoConfig,
  selectedCountries,
}: FeasibilityInfoModalProps) {
  
  const getFeasibilityStatus = (): { levelText: string; colorClass: string; badgeVariant: 'default' | 'destructive' | 'secondary'; Icon: LucideIcon } => {
    if (feasibilityScore > 75) return { levelText: "High", colorClass: "text-[hsl(var(--lavender-accent))]", badgeVariant: 'default', Icon: Activity };
    if (feasibilityScore > 50) return { levelText: "Medium", colorClass: "text-yellow-500", badgeVariant: 'secondary', Icon: Activity };
    return { levelText: "Low", colorClass: "text-orange-500", badgeVariant: 'destructive', Icon: Activity };
  };

  const feasibilityStatus = getFeasibilityStatus();

  const generateExplanation = (): string => {
    const irValue = estimatedIR ?? 50; // Assume 50% if null for explanation logic
    let explanation = "";

    if (irValue < 20) {
      explanation += `The estimated Incidence Rate (IR) of ${irValue}% is quite low, making it more challenging to find qualified respondents. `;
    } else if (irValue < 40) {
      explanation += `The estimated Incidence Rate (IR) of ${irValue}% is moderate, which is generally manageable. `;
    } else {
      explanation += `The estimated Incidence Rate (IR) of ${irValue}% is good, suggesting a wider pool of potential respondents. `;
    }

    if (photoConfig && videoConfig) {
      explanation += "The requirement for both photo and video submissions significantly adds to respondent effort and complexity. ";
    } else if (photoConfig) {
      explanation += "Collecting photos adds a layer of complexity. ";
    } else if (videoConfig) {
      explanation += "Collecting videos adds a layer of complexity. ";
    }

    if (sampleSize > 500) {
       explanation += `A sample size of ${sampleSize} is relatively large. `;
    }
    
    if (selectedCountries.length > 3) {
        explanation += `Targeting ${selectedCountries.length} markets increases logistical complexity. `;
    }

    if (explanation.trim() === "") {
        return "Feasibility is based on a combination of factors including sample size, target audience incidence, and any media requirements."
    }

    explanation += `These factors combined influence the overall feasibility score of ${feasibilityScore}%, resulting in a ${feasibilityStatus.levelText.toLowerCase()} feasibility status.`;
    return explanation;
  };

  const generateKeyReasons = (): string[] => {
    const reasons: string[] = [];
    const irValue = estimatedIR ?? 0;

    if (irValue <= 20) reasons.push(`Incidence rate of ${irValue}% is low, which can increase difficulty.`);
    else if (irValue <= 40) reasons.push(`Incidence rate of ${irValue}% is moderate.`);
    else reasons.push(`Incidence rate of ${irValue}% is high, which is favorable.`);

    if (sampleSize < 100) reasons.push(`Sample size of ${sampleSize} is relatively small and manageable.`);
    else if (sampleSize <= 500) reasons.push(`Sample size of ${sampleSize} is manageable.`);
    else reasons.push(`Sample size of ${sampleSize} is large, potentially increasing complexity.`);
    
    if (photoConfig) reasons.push("Photo requirement adds complexity.");
    if (videoConfig) reasons.push("Video requirement adds complexity.");

    if (selectedCountries.length === 1) reasons.push(`Targeting ${selectedCountries[0]?.label || '1 market'} is focused.`);
    else if (selectedCountries.length > 1) reasons.push(`Targeting ${selectedCountries.length} markets adds coordination effort.`);
    
    return reasons.slice(0, 3); // Limit to 3-4 key reasons
  };

  const keyReasons = generateKeyReasons();
  const explanationText = generateExplanation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Feasibility Status</DialogTitle>
          <DialogDescription>
            See how your audience, media requirements, and survey setup affect feasibility.
          </DialogDescription>
        </DialogHeader>
         <ScrollArea className="flex-grow p-6">
          <div className="space-y-6 text-sm">
            {/* Section 1: Feasibility Badge/Status Display */}
            <div className="text-center">
              <Badge variant={feasibilityStatus.badgeVariant} className={cn(
                "text-lg px-4 py-1",
                feasibilityStatus.badgeVariant === 'default' ? 'bg-[hsl(var(--lavender-accent))] text-[hsl(var(--lavender-accent-foreground))]' : 
                feasibilityStatus.badgeVariant === 'secondary' ? 'bg-yellow-500 text-white' : // Ensuring secondary is distinct for medium
                feasibilityStatus.badgeVariant === 'destructive' ? 'bg-orange-500 text-white' : '' // Ensuring destructive for low
              )}>
                {feasibilityStatus.levelText} Feasibility
              </Badge>
            </div>

            {/* Section 2: Explanation Text */}
            <div className="mt-2 text-center text-muted-foreground text-xs px-2">
              <p>{explanationText}</p>
            </div>

            {/* Section 3: Key Reasons */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-md font-semibold flex items-center mb-2">
                <Search className="h-5 w-5 mr-2 text-[hsl(var(--lavender-accent))]" />
                Key Reasons:
              </h3>
              {keyReasons.length > 0 ? (
                <ul className="list-disc pl-8 space-y-1 text-muted-foreground">
                  {keyReasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              ) : (
                 <p className="text-muted-foreground italic pl-8">General project parameters are within typical ranges.</p>
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

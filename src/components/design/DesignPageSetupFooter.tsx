
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesignPageSetupFooterProps {
  progressValue: number;
  isReadyToFinish: boolean;
  isGenerating: boolean;
  setupComplete: boolean;
  onFinishSetup: () => void;
}

export function DesignPageSetupFooter({
  progressValue,
  isReadyToFinish,
  isGenerating,
  setupComplete,
  onFinishSetup,
}: DesignPageSetupFooterProps) {
  return (
    <div className="pt-6 space-y-3"> {/* element-gap */}
      <Progress value={progressValue} className="h-2 bg-[hsl(var(--progress-bar-bg))] [&>div]:bg-[hsl(var(--progress-bar-fill))]" />
      <Button
        className={cn(
            "w-full",
            // Explicitly use lavender accent variables for active state
            "bg-[hsl(var(--lavender-accent))] text-[hsl(var(--lavender-accent-foreground))]", 
            // Keep custom hover color
            "hover:bg-[hsl(var(--button-hover))] hover:opacity-90", 
            // Disabled styles
            "disabled:bg-secondary disabled:text-secondary-foreground/70 disabled:hover:bg-secondary disabled:border disabled:border-border" 
        )}
        disabled={!isReadyToFinish || isGenerating || setupComplete}
        onClick={onFinishSetup}
      >
        {isGenerating ? (
          <Loader2 className="mr-1.5 h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle 
            className={cn(
              "mr-1.5 h-5 w-5", 
              setupComplete && "text-[hsl(var(--lavender-accent-foreground))]" 
            )} 
          />
        )}
        {isGenerating ? 'Generating...' : 'Generate Survey'}
      </Button>
    </div>
  );
}


'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SetupPanelProps {
  solutionType: string;
  onDescriptionChange: (description: string, isValid: boolean) => void;
  isGenerating: boolean; 
  renderFooter: () => React.ReactNode;
}

export function SetupPanel({ solutionType, onDescriptionChange, isGenerating, renderFooter }: SetupPanelProps) {
  const [surveyDescription, setSurveyDescription] = React.useState('');

  React.useEffect(() => {
    const isValid = surveyDescription.trim() !== '';
    onDescriptionChange(surveyDescription, isValid);
  }, [surveyDescription, onDescriptionChange]);
  
  const capitalizedSolutionType = solutionType.charAt(0).toUpperCase() + solutionType.slice(1);

  const panelTitle = solutionType === 'pulse' 
    ? "Tell us about your project" 
    : `Setup Your "${capitalizedSolutionType}" Survey`;

  const panelSubtitle = solutionType === 'pulse'
    ? "Pulse is designed to help you capture rapid insights with quick fire surveys."
    : 'Describe your survey goals. The survey will be generated once you click "Generate Survey".';

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6"> {/* element-gap: 24px */}
        <h2 className="text-3xl font-bold text-foreground"> {/* h2: 28px bold */}
          {panelTitle}
        </h2>
        <p className="text-base text-muted-foreground"> {/* body: 16px regular */}
          {panelSubtitle}
        </p>
      </div>

      <div className="flex-grow flex flex-col gap-6 min-h-0"> {/* Ensure this can shrink */}
        <div className="space-y-2 flex-grow flex flex-col"> {/* Make space-y-2 a flex column */}
          {solutionType !== 'pulse' && (
            <Label htmlFor="survey-description" className="text-base font-medium">Survey Goals</Label> 
          )}
          <Textarea
            id="survey-description"
            placeholder={solutionType === 'pulse' 
              ? `e.g., "I want to understand drivers and barriers behind coffee consumption" or "I want to learn what data privacy means to consumers."`
              : `e.g., "Understand customer satisfaction with our new product feature X" or "Gauge employee morale after the recent company merger."`}
            value={surveyDescription}
            onChange={(e) => setSurveyDescription(e.target.value)}
            rows={solutionType === 'pulse' ? 5 : 4} 
            className="text-base flex-grow" // body: 16px regular, flex-grow for textarea
            disabled={isGenerating} 
          />
        </div>
      </div>
      {renderFooter()}
    </div>
  );
}


'use client';

import * as React from 'react';
import type { ExploreTemplate } from '@/config/exploreTemplates';
import type { TestTemplate } from '@/config/testTemplates';
import { ExploreTemplateCard } from './ExploreTemplateCard';
import { FollowUpQuestionForm } from './FollowUpQuestionForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

type AnyTemplate = ExploreTemplate | TestTemplate;

interface ExploreSetupPanelProps {
  templates: AnyTemplate[];
  isLoading: boolean; 
  activeTemplateId?: string | null; 
  onActiveTemplateChange: (template: AnyTemplate | null) => void; 
  onLocalTemplateSelectionChange: (template: AnyTemplate | null) => void; 
  panelVariant: 'explore' | 'test' | 'pulse'; 
  panelTitle?: string;
  panelSubtitle?: string;
  onAnswersChange: (answers: Record<string, string>, isValid: boolean) => void; 
  renderFooter: () => React.ReactNode;
}

export function ExploreSetupPanel({
  templates,
  isLoading,
  activeTemplateId, 
  onActiveTemplateChange,
  onLocalTemplateSelectionChange, 
  panelVariant,
  panelTitle = "What type of project is this?",
  panelSubtitle = "Select a template to guide your process.",
  onAnswersChange,
  renderFooter,
}: ExploreSetupPanelProps) {
  
  const [locallySelectedTemplateId, setLocallySelectedTemplateId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (activeTemplateId) {
      setLocallySelectedTemplateId(activeTemplateId);
    } else {
      setLocallySelectedTemplateId(null);
    }
  }, [activeTemplateId]);


  const handleTemplateCardClick = (template: AnyTemplate) => {
    const newSelectedId = locallySelectedTemplateId === template.id ? null : template.id;
    setLocallySelectedTemplateId(newSelectedId);
    onLocalTemplateSelectionChange(newSelectedId ? template : null);
  };

  const handleNextClick = () => {
    if (locallySelectedTemplateId) {
      const templateToActivate = templates.find(t => t.id === locallySelectedTemplateId);
      if (templateToActivate) {
        onActiveTemplateChange(templateToActivate); 
      }
    }
  };

  const configurationTargetTemplate = React.useMemo(() => {
    return templates.find(t => t.id === activeTemplateId) || null;
  }, [activeTemplateId, templates]);

  const showTemplateSelectionList = !configurationTargetTemplate;

  const currentPanelTitle = configurationTargetTemplate 
    ? `Let’s customise your survey` 
    : panelTitle;

  const currentPanelSubtitle = configurationTargetTemplate 
    ? `These quick questions help tailor the flow to your objectives.`
    : showTemplateSelectionList ? panelSubtitle : "";


  const headerTextColor = panelVariant === 'explore' 
    ? 'text-[hsl(var(--explore-template-text-header-fg))]' 
    : 'text-foreground'; 
  const subheaderTextColor = panelVariant === 'explore' 
    ? 'text-[hsl(var(--explore-template-text-subheader-fg))]' 
    : 'text-muted-foreground';

  return (
    <div className="flex flex-col h-full"> 
      <div className="mb-6"> {/* Increased mb for element-gap */}
        <h2 className={`text-3xl font-bold ${headerTextColor}`}> {/* h2: 28px bold */}
          {currentPanelTitle}
        </h2>
        {currentPanelSubtitle && (
          <p className={`text-base ${subheaderTextColor}`}> {/* body: 16px regular */}
            {currentPanelSubtitle}
          </p>
        )}
      </div>

      {showTemplateSelectionList ? (
        <> 
          <ScrollArea className="flex-grow min-h-0"> 
            <div className="space-y-3 p-1">
              {templates.map((template) => (
                <ExploreTemplateCard
                  key={template.id}
                  {...template}
                  onClick={() => handleTemplateCardClick(template)}
                  isSelected={locallySelectedTemplateId === template.id}
                  variant={panelVariant === 'pulse' ? 'explore' : panelVariant}
                />
              ))}
            </div>
          </ScrollArea>
          <div className="pt-6 flex justify-end"> {/* element-gap: 24px */}
            <Button 
              onClick={handleNextClick} 
              disabled={!locallySelectedTemplateId || isLoading}
              className="bg-[hsl(var(--lavender-accent))] text-[hsl(var(--lavender-accent-foreground))] hover:bg-[hsl(var(--lavender-accent))] hover:opacity-90"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
           {/* Spacer to push Next button up if footer is also present and there's not enough content */}
           <div className="flex-grow"></div> 
           {renderFooter()}
        </>
      ) : configurationTargetTemplate && configurationTargetTemplate.followUpQuestions && configurationTargetTemplate.followUpQuestions.length > 0 ? (
        <>
        <ScrollArea className="flex-grow min-h-0 pr-1">
          <FollowUpQuestionForm
            key={configurationTargetTemplate.id} 
            questions={configurationTargetTemplate.followUpQuestions}
            onAnswersChange={onAnswersChange} 
            isGenerating={isLoading}
            variant={panelVariant === 'pulse' ? 'explore' : panelVariant}
          />
        </ScrollArea>
        {renderFooter()}
        </>
      ) : configurationTargetTemplate ? ( 
        <>
         <div className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground text-base"> {/* body: 16px regular */}
            No further refinement needed for this template. Click "Generate Survey" to create your questions.
          </p>
        </div>
        {renderFooter()}
        </>
      ) : null } 
    </div>
  );
}


'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FrameworkSection } from '@/config/exploreTemplates';
import { AccordionTrigger, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { renderQuestionTextWithPlaceholdersGlobal, QuestionTypeIcon } from '@/config/surveyUtils';

interface SectionDisplayCardProps {
  section: FrameworkSection;
  isCurrentlyIncluded: boolean;
  onToggleSection: () => void;
  solutionType: 'explore' | 'test' | 'pulse';
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  children?: React.ReactNode; // For AccordionContent
  cardColor?: 'green' | 'purple' | undefined;
}

export function SectionDisplayCard({
  section,
  isCurrentlyIncluded,
  onToggleSection,
  solutionType,
  isExpandable = false,
  isExpanded = false,
  onToggleExpand,
  children,
  cardColor,
}: SectionDisplayCardProps) {
  const SectionIcon = section.icon;

  const cardBaseClasses = cn(
    "flex flex-col w-full transition-all duration-200 ease-in-out min-h-[85px] rounded-[16px] p-2",
    isExpandable && "border-none" // Remove border if it's an accordion item to avoid double borders
  );

  const cardContentClasses = cn(
    "flex flex-col flex-grow p-0" // No padding here, handled by internal elements
  );

  const headerClasses = cn(
    "flex items-start justify-between w-full p-1", // Reduced padding for header part
    isExpandable && "cursor-pointer hover:bg-muted/30 rounded-t-md"
  );

  const textContainerClasses = "flex items-start gap-1.5 flex-grow";
  const iconWrapperClasses = "shrink-0";
  const titleDescriptionClasses = "flex-grow";

  let cardSpecificBgClass = 'bg-card'; // Default background
  let iconColorClass = 'text-[hsl(var(--lavender-accent))]'; // Default icon color

  if (cardColor === 'green') {
    cardSpecificBgClass = 'bg-green-100 border-green-500';
    iconColorClass = 'text-green-700';
  } else if (cardColor === 'purple') {
    cardSpecificBgClass = 'bg-purple-100 border-purple-500';
    iconColorClass = 'text-purple-700';
  } else if (isCurrentlyIncluded) {
    if (solutionType === 'explore') {
      cardSpecificBgClass = 'bg-[hsl(var(--explore-template-bg))]';
      iconColorClass = 'text-[hsl(var(--explore-template-icon-fg))]';
    } else if (solutionType === 'test') {
      cardSpecificBgClass = 'bg-[hsl(var(--test-template-card-bg))]';
      iconColorClass = 'text-[hsl(var(--test-template-card-icon-fg))]';
    }
    // For 'pulse' or default, it uses bg-card and lavender icon color set above.
  } else {
    cardSpecificBgClass = 'bg-[hsl(var(--soft-lavender-hover-bg))] hover:bg-[hsl(var(--primary)/0.2)]';
    iconColorClass = 'text-[hsl(var(--lavender-accent))]';
  }

  const cardContent = (
    <div className={headerClasses} onClick={isExpandable && !children ? onToggleExpand : undefined}>
      <div className={textContainerClasses}>
        <div className={iconWrapperClasses}>
          <SectionIcon className={cn("h-5 w-5 mt-0.5", iconColorClass)} />
        </div>
        <div className={titleDescriptionClasses}>
          <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{section.description}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-7 w-7 shrink-0",
          isCurrentlyIncluded ? iconColorClass : 'text-[hsl(var(--lavender-accent))]'
        )}
        onClick={(e) => {
          e.stopPropagation(); // Prevent accordion from toggling if button is inside trigger
          onToggleSection();
        }}
        aria-label={isCurrentlyIncluded ? `Remove ${section.title}` : `Add ${section.title}`}
      >
        {isCurrentlyIncluded ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
      </Button>
    </div>
  );

  if (isExpandable) {
    return (
      <Card className={cn(cardBaseClasses, cardSpecificBgClass)}>
        <AccordionTrigger className="p-0 hover:no-underline [&_svg.lucide-chevron-down]:hidden" showChevron={!!children}>
          {cardContent}
        </AccordionTrigger>
        {children && <AccordionContent className="p-2 pt-0">{children}</AccordionContent>}
      </Card>
    );
  }

  return (
    <Card className={cn(cardBaseClasses, cardSpecificBgClass)}>
      <CardContent className={cardContentClasses}>
        {cardContent}
      </CardContent>
    </Card>
  );
}

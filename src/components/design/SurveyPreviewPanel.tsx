
'use client';

import type { SurveySection, SurveyQuestion } from '@/ai/flows/suggest-survey-questions';
import type { FrameworkSection } from '@/config/exploreTemplates';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { screenInMarker } from '@/config/surveyConstants';
import { formatQuestionTypeForDisplay } from '@/config/surveyUtils';
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileQuestion,
  Filter,
  GripVertical,
  Image as ImageIconLucide,
  Info,
  List,
  Loader2,
  MessageSquareText,
  PlusCircle,
  Sparkles,
  SquareCheckBig,
  Star,
  SlidersHorizontal, 
  Trash2,
  Video,
  type LucideIcon,
} from 'lucide-react';
import * as React from 'react';

interface SurveyPreviewPanelProps {
  surveySections: SurveySection[];
  preliminaryFrameworkSections?: FrameworkSection[];
  actualSurveyTitle?: string;
  actualSurveyIntroduction?: string;
  isLoading?: boolean;
  showPlaceholder?: boolean;
  placeholderText?: string;
  solutionType?: string;
  isEditModeActive?: boolean;
  showFrameworkPreview?: boolean;
  onSurveyTitleChange?: (newTitle: string) => void;
  onSurveyIntroductionChange?: (newIntro: string) => void;
  onSectionChange?: (sectionIndex: number, updatedData: Partial<SurveySection>) => void;
  onQuestionChange?: (sectionIndex: number, questionIndex: number, updatedData: Partial<SurveyQuestion>) => void;
  onOptionChange?: (sectionIndex: number, questionIndex: number, optionIndex: number, newText: string) => void;
  onOptionDelete?: (sectionIndex: number, questionIndex: number, optionIndex: number) => void;
  onScreenerOptionToggle?: (sectionIndex: number, questionIndex: number, optionIndex: number, isChecked: boolean) => void;
  onAddSection?: () => void;
  onAddQuestion?: (sectionIndex: number) => void;
  onSectionReorder?: (draggedSectionIndex: number, targetSectionIndex: number) => void;
  onQuestionReorder?: (sectionIndex: number, draggedQuestionIndex: number, targetQuestionIndex: number) => void;
  dynamicPlaceholders?: Record<string, string>;
  isSurveyGenerated?: boolean;
  onOpenCustomizeModal?: () => void; 
  openFrameworkAccordionItems: string[];
  onOpenFrameworkChange: (items: string[]) => void;
  openSurveySectionAccordionItems: string[];
  onOpenSurveyChange: (items: string[]) => void;
}

const questionTypeIconMap: Record<SurveyQuestion['questionType'], LucideIcon> = {
  screener: Filter,
  closedText: SquareCheckBig,
  openText: MessageSquareText,
  scale: Star,
  photo: ImageIconLucide,
  video: Video,
  stimulus: List,
};

const allQuestionTypes: SurveyQuestion['questionType'][] = [
  'screener', 'closedText', 'openText', 'scale', 'photo', 'video', 'stimulus'
];

interface QuestionTypeIconProps {
  type: SurveyQuestion['questionType'];
  className?: string;
  isActive?: boolean;
}

const QuestionTypeIcon = (props: QuestionTypeIconProps) => {
  const { type, className, isActive } = props;
  const IconComponent = questionTypeIconMap[type] || FileQuestion;
  const formattedType = formatQuestionTypeForDisplay(type);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <IconComponent className={cn(
            "h-4 w-4 text-[hsl(var(--lavender-accent))]",
            isActive ? "opacity-100" : "opacity-70",
            "group-hover:opacity-100",
            className
          )} />
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          <p>{formattedType}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const renderQuestionTextWithPlaceholdersGlobal = (text: string, dynamicPlaceholders: Record<string, string>, isPlaceholderContext: boolean = false): React.ReactNode => {
  if (!text) return '';
  const parts = text.split(/(\[[^\][]*?\])/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      const placeholderKey = part.substring(1, part.length - 1);
      const dynamicValue = dynamicPlaceholders[placeholderKey];
      return (
        <span key={i} className="text-[hsl(var(--lavender-accent))] font-medium italic">
          {dynamicValue && !isPlaceholderContext ? dynamicValue : part}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};


interface FrameworkSectionDisplayProps {
  section: FrameworkSection;
  dynamicPlaceholders?: Record<string, string>;
}

const FrameworkSectionDisplay: React.FC<FrameworkSectionDisplayProps> = ({
  section,
  dynamicPlaceholders = {},
}) => {
  const IconComponent = section.icon;
  const [expandedQuestions, setExpandedQuestions] = React.useState<Record<string, boolean>>({});

  const toggleQuestionExpansion = (questionKey: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionKey]: !prev[questionKey],
    }));
  };


  return (
     <AccordionItem value={section.title} className="border-none">
        <AccordionTrigger
          className="px-6 py-4 hover:no-underline group" // card-padding
        >
          <div className="flex items-center w-full">
            <IconComponent className="h-5 w-5 text-[hsl(var(--lavender-accent))] mr-3 shrink-0 opacity-80" />
            <span className="text-md font-medium text-foreground">{section.title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 py-0"> {/* card-padding */}
          {section.exampleQuestions && section.exampleQuestions.length > 0 ? (
            <ul className="space-y-0">
              {section.exampleQuestions.map((question, qIndex) => {
                const questionKey = `framework-${section.title}-${qIndex}`;
                const isExpanded = !!expandedQuestions[questionKey];
                 const isExpandable =
                  (question.questionType === 'closedText' || question.questionType === 'scale' || question.questionType === 'screener') &&
                  question.options && question.options.length > 0;

                return (
                  <li key={questionKey} className="p-3 border-t border-border/50 first:pt-2 last:pb-2">
                    <div className="flex items-start space-x-3 group">
                       <span className="text-sm font-medium text-muted-foreground mt-0.5 pt-px"></span>
                      <div className="flex-grow mt-0.5">
                        <p className="text-sm text-foreground">
                           {renderQuestionTextWithPlaceholdersGlobal(question.questionText, dynamicPlaceholders, true)}
                        </p>
                      </div>
                      <div className="flex items-center shrink-0 space-x-1 mt-px">
                         {isExpandable && (
                          <button
                            onClick={() => toggleQuestionExpansion(questionKey)}
                            className="p-1 text-muted-foreground opacity-70 hover:text-foreground hover:opacity-100 hover:bg-muted rounded-md"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? "Collapse options" : "Expand options"}
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        )}
                        <QuestionTypeIcon type={question.questionType} />
                      </div>
                    </div>
                    {(isExpandable && isExpanded) && (
                      <div className="pl-8 pt-2">
                        <ul className="space-y-2">
                          {question.options!.map((option, optIndex) => {
                            const isCurrentOptionScreenIn = question.questionType === 'screener' && option.includes(screenInMarker);
                            const displayOptionText = option.replace(screenInMarker, '').trim();
                            return (
                              <li key={optIndex} className={cn(
                                  "flex items-center space-x-2 text-sm",
                                  isCurrentOptionScreenIn ? "text-[hsl(var(--lavender-accent))] font-medium" : "text-muted-foreground"
                                )}>
                                <span className="mr-1">&bull;</span>
                                <span>{renderQuestionTextWithPlaceholdersGlobal(displayOptionText, dynamicPlaceholders, true)}</span>
                                {isCurrentOptionScreenIn && <CheckCircle className="ml-2 h-4 w-4 text-[hsl(var(--lavender-accent))] shrink-0" />}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground py-2 text-center italic">No example questions for this section.</p>
          )}
        </AccordionContent>
      </AccordionItem>
  );
};


export function SurveyPreviewPanel({
  surveySections,
  preliminaryFrameworkSections = [],
  actualSurveyTitle,
  actualSurveyIntroduction,
  isLoading = false,
  showPlaceholder = false,
  placeholderText = "Your survey preview will appear here once the setup is complete.",
  isEditModeActive = false,
  showFrameworkPreview = false,
  onSurveyTitleChange,
  onSurveyIntroductionChange,
  onSectionChange,
  onQuestionChange,
  onOptionChange,
  onOptionDelete,
  onScreenerOptionToggle,
  onAddSection,
  onAddQuestion,
  onSectionReorder,
  onQuestionReorder,
  dynamicPlaceholders = {},
  isSurveyGenerated,
  onOpenCustomizeModal, 
  openFrameworkAccordionItems,
  onOpenFrameworkChange,
  openSurveySectionAccordionItems,
  onOpenSurveyChange,
}: SurveyPreviewPanelProps) {

  const [expandedQuestions, setExpandedQuestions] = React.useState<Record<string, boolean>>({});
  const [openDropdownKey, setOpenDropdownKey] = React.useState<string | null>(null);

  const [draggingSectionIndex, setDraggingSectionIndex] = React.useState<number | null>(null);
  const [draggingQuestionInfo, setDraggingQuestionInfo] = React.useState<{ sectionIdx: number; questionIdx: number } | null>(null);


  const toggleQuestionExpansion = (questionKey: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionKey]: !prev[questionKey],
    }));
  };

  const hasActualContent = surveySections && surveySections.length > 0 && surveySections.some(section => section.questions.length > 0);
  const showSurveyHeader = !isLoading && !showPlaceholder && hasActualContent && (actualSurveyTitle || isEditModeActive) && (actualSurveyIntroduction || isEditModeActive);


  const handleSectionDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!isEditModeActive || !onSectionReorder) return;
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'section', index }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingSectionIndex(index);
    document.body.classList.add('dragging');
  };

  const handleSectionDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!isEditModeActive || !onSectionReorder || draggingSectionIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const targetElement = e.currentTarget;
    const boundingBox = targetElement.getBoundingClientRect();
    const offsetY = e.clientY - boundingBox.top;

    targetElement.classList.remove('drag-over-top', 'drag-over-bottom');
    if (offsetY < boundingBox.height / 2) {
        targetElement.classList.add('drag-over-top');
    } else {
        targetElement.classList.add('drag-over-bottom');
    }
  };

  const handleSectionDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.classList.remove('drag-over-top', 'drag-over-bottom');
  };

  const handleSectionDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    if (!isEditModeActive || !onSectionReorder || draggingSectionIndex === null) return;
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over-top', 'drag-over-bottom');
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    if (data.type === 'section' && data.index !== targetIndex) {
      onSectionReorder(data.index, targetIndex);
    }
    setDraggingSectionIndex(null);
    document.body.classList.remove('dragging');
  };

  const handleSectionDragEnd = () => {
    setDraggingSectionIndex(null);
    document.body.classList.remove('dragging');
    document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom');
    });
  };

  const handleQuestionDragStart = (e: React.DragEvent<HTMLLIElement>, sectionIdx: number, questionIdx: number) => {
    if (!isEditModeActive || !onQuestionReorder) return;
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'question', sectionIdx, questionIdx }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingQuestionInfo({ sectionIdx, questionIdx });
    document.body.classList.add('dragging');
  };

  const handleQuestionDragOver = (e: React.DragEvent<HTMLLIElement>, sectionIdx: number, questionIdx: number) => {
    if (!isEditModeActive || !onQuestionReorder || !draggingQuestionInfo || draggingQuestionInfo.sectionIdx !== sectionIdx) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const targetElement = e.currentTarget;
    const boundingBox = targetElement.getBoundingClientRect();
    const offsetY = e.clientY - boundingBox.top;

    targetElement.classList.remove('drag-over-top', 'drag-over-bottom');
    if (offsetY < boundingBox.height / 2) {
        targetElement.classList.add('drag-over-top');
    } else {
        targetElement.classList.add('drag-over-bottom');
    }
  };

  const handleQuestionDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
      e.currentTarget.classList.remove('drag-over-top', 'drag-over-bottom');
  };

  const handleQuestionDrop = (e: React.DragEvent<HTMLLIElement>, targetSectionIdx: number, targetQuestionIdx: number) => {
    if (!isEditModeActive || !onQuestionReorder || !draggingQuestionInfo) return;
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over-top', 'drag-over-bottom');
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    if (data.type === 'question' && data.sectionIdx === targetSectionIdx && data.questionIdx !== targetQuestionIdx) {
      onQuestionReorder(data.sectionIdx, data.questionIdx, targetQuestionIdx);
    }
    setDraggingQuestionInfo(null);
    document.body.classList.remove('dragging');
  };

  const handleQuestionDragEnd = () => {
    setDraggingQuestionInfo(null);
    document.body.classList.remove('dragging');
     document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom');
    });
  };

  const displayFrameworkMessage = showFrameworkPreview && !hasActualContent && !isLoading;
  const currentFrameworkToDisplay = preliminaryFrameworkSections;

  return (
    <Card className="relative flex flex-col h-full shadow-md bg-[hsl(var(--empty-preview-bg))] rounded-[16px]"> {/* radius */}
      <CardContent className={cn(
          "flex-grow overflow-hidden flex flex-col",
          showSurveyHeader || isSurveyGenerated ? "pt-0" : "pt-6", // card-padding
          (showPlaceholder && !displayFrameworkMessage && !hasActualContent && !isLoading) && "justify-center items-center"
        )}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--lavender-accent))] mb-3" />
            <p className="font-medium text-sm text-[hsl(var(--lavender-accent))]">
              Hang tight! We're crafting your survey...
            </p>
          </div>
        ) : showPlaceholder && !displayFrameworkMessage && !hasActualContent ? (
           <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Card className="p-8 sm:p-10 text-center shadow-lg w-full max-w-xs sm:max-w-sm bg-card rounded-[16px]"> {/* radius */}
                <Sparkles className="h-8 w-8 mb-3 mx-auto text-[hsl(var(--lavender-accent))]" />
                <p className="text-md font-semibold text-foreground mb-2">
                  Almost there!
                </p>
                <p className="text-sm text-muted-foreground">
                  {placeholderText}
                </p>
            </Card>
          </div>
        ) : (
          <>
            {showSurveyHeader && (
              <div className="p-6 pb-4 border-b border-divider bg-card"> {/* card-padding */}
                {isEditModeActive && onSurveyTitleChange ? (
                  <Input
                    value={actualSurveyTitle}
                    onChange={(e) => onSurveyTitleChange(e.target.value)}
                    placeholder="Enter survey title"
                    className="text-2xl font-bold mb-2 h-auto p-1"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-foreground mb-2">{actualSurveyTitle}</h2>
                )}
                {isEditModeActive && onSurveyIntroductionChange ? (
                  <Textarea
                    value={actualSurveyIntroduction}
                    onChange={(e) => onSurveyIntroductionChange(e.target.value)}
                    placeholder="Enter survey introduction"
                    className="text-sm leading-relaxed mt-1 p-1"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{actualSurveyIntroduction}</p>
                )}
              </div>
            )}
            <ScrollArea className={cn("h-full bg-card", (showSurveyHeader || isSurveyGenerated || (showFrameworkPreview && !hasActualContent)) ? "p-6 pt-4" : "p-6")}> {/* card-padding */}
             {displayFrameworkMessage && currentFrameworkToDisplay && currentFrameworkToDisplay.length > 0 && (
                <Card className="mb-6 p-6 text-left w-full bg-[hsl(var(--empty-preview-bg))] rounded-[16px] border border-divider shadow-sm"> {/* card-padding, radius */}
                  <div className="flex flex-col justify-between h-full">
                    <div className="flex items-start gap-3">
                      <Info className="h-6 w-6 text-[hsl(var(--lavender-accent))] shrink-0 mt-1" />
                      <div>
                        <h3 className="text-md font-semibold text-foreground mb-1">
                          This is a preview of your survey
                        </h3>
                        <p className="text-sm text-muted-foreground">
                           This is a starting point based on your selected template. To create your full survey, continue answering the questions on the left and click 'Generate Survey'.
                        </p>
                      </div>
                    </div>
                    {onOpenCustomizeModal && (
                       <div className="flex justify-end mt-3">
                        <Button
                            variant="link"
                            onClick={onOpenCustomizeModal}
                            className="text-sm text-[hsl(var(--lavender-accent))] hover:text-[hsl(var(--lavender-accent))]/80 p-0 h-auto"
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                            Not quite right? Tweak the template!
                        </Button>
                       </div>
                    )}
                  </div>
                </Card>
              )}


              {showFrameworkPreview && !hasActualContent && currentFrameworkToDisplay && currentFrameworkToDisplay.length > 0 && (
                <>
                  <Accordion
                    type="multiple"
                    value={openFrameworkAccordionItems}
                    onValueChange={onOpenFrameworkChange}
                    className="w-full space-y-4" // element-gap
                  >
                    {currentFrameworkToDisplay.map((section, idx) => (
                      <div key={`${section.title}-${idx}-wrapper`} className="border bg-background rounded-[16px] shadow-sm"> {/* radius */}
                        <FrameworkSectionDisplay
                          section={section}
                          dynamicPlaceholders={dynamicPlaceholders}
                        />
                      </div>
                    ))}
                  </Accordion>
                </>
              )}


              {hasActualContent ? (
                <Accordion
                  type="multiple"
                  value={openSurveySectionAccordionItems}
                  onValueChange={onOpenSurveyChange}
                  className="w-full space-y-4" // element-gap
                >
                  {surveySections.map((section, sectionIndex) => {
                    const frameworkSectionMatch = preliminaryFrameworkSections.find(
                      fs => fs.title === section.sectionTitle
                    );
                    const SectionIconComponent = frameworkSectionMatch?.icon || FileQuestion;

                    return (
                      <div
                        key={section.sectionTitle + sectionIndex}
                        draggable={isEditModeActive && !!onSectionReorder}
                        onDragStart={(e) => handleSectionDragStart(e, sectionIndex)}
                        onDragOver={(e) => handleSectionDragOver(e, sectionIndex)}
                        onDragLeave={handleSectionDragLeave}
                        onDrop={(e) => handleSectionDrop(e, sectionIndex)}
                        onDragEnd={handleSectionDragEnd}
                        className={cn(
                          "border bg-background rounded-[16px] shadow-sm transition-opacity", // radius
                          draggingSectionIndex === sectionIndex && "opacity-50"
                        )}
                      >
                        <AccordionItem value={section.sectionTitle} className="border-none">
                          <AccordionTrigger className="px-6 py-4 hover:no-underline group"> {/* card-padding */}
                            {isEditModeActive && onSectionReorder && (
                                <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-grab opacity-70 group-hover:opacity-100" />
                            )}
                             <SectionIconComponent className="h-5 w-5 text-[hsl(var(--lavender-accent))] mr-3 shrink-0 opacity-80" />
                            <div className="flex flex-col text-left w-full">
                              {isEditModeActive && onSectionChange ? (
                                <Input
                                  value={section.sectionTitle}
                                  onChange={(e) => onSectionChange(sectionIndex, { sectionTitle: e.target.value })}
                                  placeholder="Section Title"
                                  className="text-md font-semibold h-auto p-1 mb-0.5"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span className="text-md font-semibold text-foreground">{section.sectionTitle}</span>
                              )}
                              {isEditModeActive && onSectionChange ? (
                                 <Textarea
                                  value={section.sectionDescription || ''}
                                  onChange={(e) => onSectionChange(sectionIndex, { sectionDescription: e.target.value })}
                                  placeholder="Section Description (optional)"
                                  className="text-xs font-normal mt-0.5 p-1 h-auto"
                                  rows={2}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : section.sectionDescription && (
                                <span className="text-xs text-muted-foreground font-normal mt-0.5">{section.sectionDescription}</span>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 py-0"> {/* card-padding */}
                            {section.questions.length > 0 ? (
                              <ul className="space-y-0">
                                {section.questions.map((question, qIndex) => {
                                  const questionKey = `${sectionIndex}-${qIndex}`;
                                  const isExpanded = !!expandedQuestions[questionKey];
                                  const isExpandable =
                                    (question.questionType === 'closedText' || question.questionType === 'scale' || question.questionType === 'screener') &&
                                    question.options && question.options.length > 0;

                                  return (
                                    <li
                                      key={questionKey}
                                      className={cn(
                                        "p-3 border-t border-border/50 first:pt-2 last:pb-2 transition-opacity",
                                        draggingQuestionInfo?.sectionIdx === sectionIndex && draggingQuestionInfo?.questionIdx === qIndex && "opacity-50"
                                      )}
                                      draggable={isEditModeActive && !!onQuestionReorder}
                                      onDragStart={(e) => handleQuestionDragStart(e, sectionIndex, qIndex)}
                                      onDragOver={(e) => handleQuestionDragOver(e, sectionIndex, qIndex)}
                                      onDragLeave={handleQuestionDragLeave}
                                      onDrop={(e) => handleQuestionDrop(e, sectionIndex, qIndex)}
                                      onDragEnd={handleQuestionDragEnd}
                                    >
                                      <div className="flex items-start space-x-3 group">
                                        {isEditModeActive && onQuestionReorder && (
                                          <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 cursor-grab opacity-70 group-hover:opacity-100" />
                                        )}
                                        <span className="text-sm font-medium text-muted-foreground mt-0.5 pt-px"></span>
                                        <div className="flex-grow mt-0.5">
                                           {isEditModeActive && onQuestionChange ? (
                                             <Input
                                               value={question.questionText}
                                               onChange={(e) => onQuestionChange(sectionIndex, qIndex, { questionText: e.target.value })}
                                               placeholder="Question Text"
                                               className="text-sm h-auto p-1 mb-1"
                                             />
                                           ) : (
                                             <p className="text-sm text-foreground">{renderQuestionTextWithPlaceholdersGlobal(question.questionText, dynamicPlaceholders)}</p>
                                           )}
                                        </div>
                                        <div className="flex items-center shrink-0 space-x-1 mt-px">
                                          {isExpandable && !isEditModeActive ? (
                                            <button
                                              onClick={() => toggleQuestionExpansion(questionKey)}
                                              className="p-1 text-muted-foreground opacity-70 hover:text-foreground hover:opacity-100 hover:bg-muted rounded-md"
                                              aria-expanded={isExpanded}
                                              aria-label={isExpanded ? "Collapse options" : "Expand options"}
                                            >
                                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </button>
                                          ) : !isEditModeActive && isExpandable ? (
                                            <div className="w-6 h-6"></div> 
                                          ) : null }

                                          {isEditModeActive && onQuestionChange ? (
                                            <DropdownMenu onOpenChange={(isOpen) => isOpen ? setOpenDropdownKey(questionKey) : setOpenDropdownKey(null)}>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 p-0 data-[state=open]:bg-[hsl(var(--lavender-accent))]/10 group">
                                                  <QuestionTypeIcon type={question.questionType} isActive={openDropdownKey === questionKey} />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                {allQuestionTypes.map(type => (
                                                  <DropdownMenuItem
                                                    key={type}
                                                    onSelect={() => {
                                                      const updatedData: Partial<SurveyQuestion> = { questionType: type };
                                                      const typesThatUseOptions = ['screener', 'closedText', 'scale'];

                                                      if (typesThatUseOptions.includes(type)) {
                                                        if (!Array.isArray(question.options)) {
                                                          updatedData.options = [];
                                                        }
                                                      } else {
                                                        updatedData.options = []; 
                                                      }
                                                      onQuestionChange(sectionIndex, qIndex, updatedData);
                                                    }}
                                                  >
                                                    <QuestionTypeIcon type={type} className="mr-2 opacity-100"/>
                                                    <span className="ml-0">{formatQuestionTypeForDisplay(type)}</span>
                                                  </DropdownMenuItem>
                                                ))}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          ) : (
                                            <QuestionTypeIcon type={question.questionType} />
                                          )}
                                        </div>
                                      </div>

                                      {(isExpandable && (isExpanded || isEditModeActive)) && (
                                        <div className="pl-8 pt-2">
                                          <ul className="space-y-2">
                                            {question.options!.map((option, optIndex) => {
                                              const isCurrentOptionScreenIn = question.questionType === 'screener' && option.includes(screenInMarker);
                                              const displayOptionText = option.replace(screenInMarker, '').trim();
                                              const optionId = `option-${sectionIndex}-${qIndex}-${optIndex}`;

                                              return (
                                                <li key={optIndex} className={cn(
                                                    "flex items-center space-x-2 text-sm",
                                                    isCurrentOptionScreenIn && !isEditModeActive ? "text-[hsl(var(--lavender-accent))] font-medium" : "text-muted-foreground"
                                                  )}>
                                                  {!isEditModeActive && <span className="mr-1">&bull;</span>}
                                                  {isEditModeActive && onOptionChange && onOptionDelete && (
                                                    <>
                                                      {question.questionType === 'screener' && onScreenerOptionToggle && (
                                                        <Checkbox
                                                          id={`screener-toggle-${optionId}`}
                                                          checked={isCurrentOptionScreenIn}
                                                          onCheckedChange={(checked) => onScreenerOptionToggle(sectionIndex, qIndex, optIndex, !!checked)}
                                                          className="mr-2 shrink-0"
                                                          aria-label="Mark as screen-in option"
                                                        />
                                                      )}
                                                      <Input
                                                        value={displayOptionText}
                                                        onChange={(e) => onOptionChange(sectionIndex, qIndex, optIndex, e.target.value)}
                                                        placeholder={`Option ${optIndex + 1}`}
                                                        className="h-8 p-1 text-sm flex-grow"
                                                      />
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive/80"
                                                        onClick={() => onOptionDelete(sectionIndex, qIndex, optIndex)}
                                                        aria-label="Delete option"
                                                      >
                                                        <Trash2 className="h-4 w-4" />
                                                      </Button>
                                                    </>
                                                  )}
                                                  {!isEditModeActive && (
                                                    <>
                                                      <span>{renderQuestionTextWithPlaceholdersGlobal(displayOptionText, dynamicPlaceholders)}</span>
                                                      {isCurrentOptionScreenIn && <CheckCircle className="ml-2 h-4 w-4 text-[hsl(var(--lavender-accent))] shrink-0" />}
                                                    </>
                                                  )}
                                                </li>
                                              );
                                            })}
                                             {isEditModeActive && (question.questionType === 'closedText' || question.questionType === 'scale' || question.questionType === 'screener') && onOptionChange && (
                                              <li>
                                                <Button variant="outline" size="sm" className="mt-2 text-xs"
                                                  onClick={() => {
                                                      const newOptionText = `New Option ${question.options ? question.options.length + 1 : 1}`;
                                                      onOptionChange(sectionIndex, qIndex, question.options ? question.options.length : 0, newOptionText);
                                                  }}
                                                >
                                                  Add Option
                                                </Button>
                                              </li>
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground py-2">No questions in this section.</p>
                            )}
                             {isEditModeActive && onAddQuestion && (
                              <div className="py-3 border-t border-border/50">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                                  onClick={() => onAddQuestion(sectionIndex)}
                                >
                                  <PlusCircle className="mr-2 h-4 w-4" /> Add Question to this Section
                                </Button>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </div>
                    );
                  })}
                </Accordion>
              ) : null }
              {isEditModeActive && onAddSection && hasActualContent && (
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={onAddSection}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Section
                  </Button>
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}

    

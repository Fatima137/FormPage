
import * as React from 'react';
import type { SurveyQuestion } from '@/ai/flows/suggest-survey-questions';
import {
  Filter,
  SquareCheckBig,
  MessageSquareText,
  Star,
  Image as ImageIconLucide,
  Video,
  List,
  FileQuestion, // Default icon
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const formatQuestionTypeForDisplay = (type: SurveyQuestion['questionType']): string => {
  switch (type) {
    case 'screener': return 'Screener';
    case 'closedText': return 'Closed Text';
    case 'openText': return 'Open Text';
    case 'scale': return 'Scale';
    case 'photo': return 'Photo';
    case 'video': return 'Video';
    case 'stimulus': return 'Stimulus';
    default:
      // This part is for exhaustiveness checking at compile time
      // if a new question type is added and not handled here.
      // It won't actually run if all types are covered.
      const exhaustiveCheck: never = type;
      return String(exhaustiveCheck).charAt(0).toUpperCase() + String(exhaustiveCheck).slice(1).replace(/([A-Z])/g, ' $1');
  }
};

export const renderQuestionTextWithPlaceholdersGlobal = (text: string, dynamicPlaceholders: Record<string, string>, isPlaceholderContext: boolean = false): React.ReactNode => {
  if (!text) return '';
  const parts = text.split(/(\[[^\][]*?\])/g).filter(Boolean); // Capture placeholders like [this]
  return parts.map((part, i) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      const placeholderKey = part.substring(1, part.length - 1);
      const dynamicValue = dynamicPlaceholders[placeholderKey];
      return (
        <span key={i} className="text-[hsl(var(--primary))] font-medium italic">
          {dynamicValue && !isPlaceholderContext ? dynamicValue : part}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

export const questionTypeIconMap: Record<SurveyQuestion['questionType'], LucideIcon> = {
  screener: Filter,
  closedText: SquareCheckBig,
  openText: MessageSquareText,
  scale: Star,
  photo: ImageIconLucide,
  video: Video,
  stimulus: List,
};

interface QuestionTypeIconProps {
  type: SurveyQuestion['questionType'];
  className?: string;
  isActive?: boolean;
}

export const QuestionTypeIcon = (props: QuestionTypeIconProps) => {
  const { type, className, isActive } = props;
  const IconComponent = questionTypeIconMap[type] || FileQuestion;
  // const formattedType = formatQuestionTypeForDisplay(type); // Not used in this visual-only component

  return (
    <IconComponent className={cn(
      "h-4 w-4 text-[hsl(var(--lavender-accent))]",
      isActive ? "opacity-100" : "opacity-70",
      "group-hover:opacity-100",
      className
    )} />
  );
};

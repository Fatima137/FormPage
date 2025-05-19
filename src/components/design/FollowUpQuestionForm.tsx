
'use client';

import * as React from 'react';
import type { FollowUpQuestionConfig } from '@/config/exploreTemplates';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Info, ArrowLeft, ArrowRight } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface FollowUpQuestionFormProps {
  questions: FollowUpQuestionConfig[];
  onAnswersChange: (answers: Record<string, string>, isValid: boolean) => void;
  isGenerating: boolean;
  variant: 'explore' | 'test';
}

export function FollowUpQuestionForm({
  questions,
  onAnswersChange,
  isGenerating,
  variant,
}: FollowUpQuestionFormProps) {
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const displayMode = (variant === 'explore' || variant === 'test') ? 'one-by-one' : 'all';

  const visibleQuestions = React.useMemo(() => {
    return questions.filter(q => {
      if (!q.showIf) return true;
      return answers[q.showIf.questionId] === q.showIf.expectedValue;
    });
  }, [questions, answers]);

  React.useEffect(() => {
    if (displayMode === 'one-by-one') {
      if (currentQuestionIndex >= visibleQuestions.length && visibleQuestions.length > 0) {
        setCurrentQuestionIndex(visibleQuestions.length - 1);
      } else if (visibleQuestions.length === 0 && currentQuestionIndex !== 0) {
        setCurrentQuestionIndex(0);
      }
    }
  }, [visibleQuestions, currentQuestionIndex, displayMode]);

  const currentQuestionConfig = React.useMemo(() => {
    if (displayMode === 'one-by-one' && visibleQuestions.length > 0 && currentQuestionIndex < visibleQuestions.length) {
      return visibleQuestions[currentQuestionIndex];
    }
    return null;
  }, [visibleQuestions, currentQuestionIndex, displayMode]);

  const checkOverallValidity = React.useCallback((currentAnswers: Record<string, string>, currentVisibleQs: FollowUpQuestionConfig[]) => {
    for (const q of currentVisibleQs) {
      if (q.required && !(currentAnswers[q.id]?.trim())) {
        return false;
      }
    }
    return true;
  }, []);

  React.useEffect(() => {
    const initialAnswersData: Record<string, string> = {};
    questions.forEach(q => {
      initialAnswersData[q.id] = q.defaultValue || '';
      if ((q.type === 'number_dropdown' || q.type === 'dropdown') && !q.defaultValue && q.options && q.options.length > 0) {
        initialAnswersData[q.id] = q.options[0].value;
      }
    });
    setAnswers(initialAnswersData);
    setCurrentQuestionIndex(0);
    setFieldErrors({});

    const initialVisible = questions.filter(q => {
      if (!q.showIf) return true;
      return initialAnswersData[q.showIf.questionId] === q.showIf.expectedValue;
    });
    const isValid = checkOverallValidity(initialAnswersData, initialVisible);
    onAnswersChange(initialAnswersData, isValid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  React.useEffect(() => {
    const isValid = checkOverallValidity(answers, visibleQuestions);
    onAnswersChange(answers, isValid);
  }, [answers, visibleQuestions, onAnswersChange, checkOverallValidity]);


  const validateField = (questionId: string, value: string): boolean => {
    const question = questions.find(q => q.id === questionId);
    if (question?.required && !value?.trim()) {
      // setFieldErrors(prev => ({ ...prev, [questionId]: `${getLabelText(question, answers)} is required.` }));
      // Do not set field errors here to prevent warning messages
      return false;
    }
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
    return true;
  };

  const handleChange = (id: string, value: string | FileList | null) => {
    let processedValue = '';
    if (typeof value === 'string') {
      processedValue = value;
    } else if (value instanceof FileList && value.length > 0) {
      processedValue = value[0].name; // Store filename for file inputs
    }

    setAnswers((prev) => ({ ...prev, [id]: processedValue }));
    validateField(id, processedValue); // Validate but don't necessarily show error messages actively unless submission
  };

  const handleNext = () => {
    if (displayMode !== 'one-by-one' || !currentQuestionConfig) return;

    if (validateField(currentQuestionConfig.id, answers[currentQuestionConfig.id] || '')) {
      if (currentQuestionIndex < visibleQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (displayMode !== 'one-by-one') return;
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1); // Corrected: decrement index
    }
  };

  const getLabelText = (question: FollowUpQuestionConfig, currentAnswers: Record<string, string>): string => {
    if (typeof question.label === 'function') {
      return question.label(currentAnswers);
    }
    return question.label;
  };

  const getPlaceholderText = (question: FollowUpQuestionConfig, currentAnswers: Record<string, string>): string | undefined => {
    if (typeof question.placeholder === 'function') {
      return question.placeholder(currentAnswers);
    }
    return question.placeholder;
  };

  const isCurrentQuestionAnswered = () => {
    if (!currentQuestionConfig) return false;
    if (!currentQuestionConfig.required) return true; // Non-required questions are always considered "answered" for progression
    return !!(answers[currentQuestionConfig.id]?.trim());
  };

  const renderQuestion = (q: FollowUpQuestionConfig) => {
    const rawError = fieldErrors[q.id];
    // Only show error feedback if it's not one-by-one or if some other condition demands it (e.g., after trying to submit)
    // For one-by-one, errors are primarily used to control 'Next' button state, not display messages per field
    const shouldShowErrorFeedback = displayMode !== 'one-by-one';
    const errorForDisplay = shouldShowErrorFeedback ? rawError : undefined;
    const applyDestructiveBorder = shouldShowErrorFeedback && !!rawError;

    const labelText = getLabelText(q, answers);
    const placeholderText = getPlaceholderText(q, answers);

    const formGroupTitle = (question: FollowUpQuestionConfig) => {
      if (question.type === 'radio' || question.type === 'dropdown' || question.type === 'number_dropdown' || question.type === 'file_upload') {
        const titleText = getLabelText(question, answers);
        return (
          <>
            <h4 className="text-sm font-semibold text-card-foreground -mb-2">
             {titleText} {question.required && <span className="text-destructive">*</span>}
           </h4>
           {question.description && (
             <p className="text-sm text-muted-foreground">
               {question.description}
             </p>
           )}
          </>
        );
      }
      return null;
    }

    return (
      <div key={q.id} className="space-y-2">
        {formGroupTitle(q)}
        {(q.type !== 'radio' && q.type !== 'dropdown' && q.type !== 'number_dropdown' && q.type !== 'file_upload') && (
            <>
              <Label htmlFor={q.id} className="text-sm font-medium text-card-foreground">
                {labelText} {q.required && <span className="text-destructive">*</span>}
              </Label>
              {q.description && <p className="text-sm text-muted-foreground">{q.description}</p>}
            </>
          )}

        {q.type === 'text' ? (
          <Input
            id={q.id}
            value={answers[q.id] || ''}
            onChange={(e) => handleChange(q.id, e.target.value)}
            placeholder={placeholderText}
            // required={q.required} // HTML5 required not needed as we handle validation
            disabled={isGenerating}
            className={cn("text-sm", applyDestructiveBorder ? "border-destructive" : "")}
          />
        ) : q.type === 'textarea' ? (
          <Textarea
            id={q.id}
            value={answers[q.id] || ''}
            onChange={(e) => handleChange(q.id, e.target.value)}
            placeholder={placeholderText}
            // required={q.required}
            disabled={isGenerating}
            rows={3}
            className={cn("text-sm", applyDestructiveBorder ? "border-destructive" : "")}
          />
        ) : q.type === 'radio' && q.options ? (
          <RadioGroup
            id={q.id}
            value={answers[q.id] || ''}
            onValueChange={(value) => handleChange(q.id, value)}
            disabled={isGenerating}
            className="space-y-3 pt-2"
          >
            {q.options.map((option) => {
              const uniqueId = `${q.id}-${option.value}`;
              const hasInfoIconInLabel = option.label.includes('ⓘ');
              const displayLabel = option.label.replace('ⓘ', '').trim();

              return (
                <Label
                  key={option.value}
                  htmlFor={uniqueId}
                  className={cn(
                    "flex items-center space-x-3 p-3.5 border rounded-md cursor-pointer transition-colors",
                    "bg-background hover:border-[hsl(var(--lavender-accent))]/60",
                    answers[q.id] === option.value ? "border-[hsl(var(--lavender-accent))] ring-1 ring-[hsl(var(--lavender-accent))] bg-[hsl(var(--lavender-accent))]/5" : "border-[hsl(var(--border))]",
                    applyDestructiveBorder ? "border-destructive" : ""
                  )}
                >
                  <RadioGroupItem value={option.value} id={uniqueId} />
                  <span className="font-normal flex-grow text-sm text-foreground">
                    {displayLabel}
                  </span>
                  {hasInfoIconInLabel && (
                     <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          <p>More information about this option.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </Label>
              );
            })}
          </RadioGroup>
        ) : (q.type === 'dropdown' || q.type === 'number_dropdown') && q.options ? (
           <Select
            value={answers[q.id] || ''}
            onValueChange={(value) => handleChange(q.id, value)}
            disabled={isGenerating}
            // required={q.required}
          >
            <SelectTrigger id={q.id} className={cn("w-full text-sm mt-2", applyDestructiveBorder ? "border-destructive" : "")}>
              <SelectValue placeholder={placeholderText || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {q.options.map((option) => {
                const IconComponent = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        ) : q.type === 'file_upload' ? (
          <div className="mt-2">
            <Input
              id={q.id}
              type="file"
              onChange={(e) => handleChange(q.id, e.target.files)}
              // required={q.required}
              disabled={isGenerating}
              className={cn("text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[hsl(var(--lavender-accent))]/10 file:text-[hsl(var(--lavender-accent))] hover:file:bg-[hsl(var(--lavender-accent))]/20", applyDestructiveBorder ? "border-destructive" : "")}
              accept={q.accept}
            />
            {answers[q.id] && (
              <p className="text-xs text-muted-foreground mt-1">Selected file: {answers[q.id]}</p>
            )}
          </div>
        ) : null}
        {errorForDisplay && <p className="text-sm text-destructive mt-1">{errorForDisplay}</p>}
      </div>
    );
  };

  if (displayMode === 'one-by-one') {
    if (!currentQuestionConfig) {
      return (
        <div className="p-4 border border-[hsl(var(--border))] rounded-lg bg-card text-muted-foreground text-center">
          {visibleQuestions.length === 0 && questions.length > 0 ? "No applicable questions for current selections." : "Loading question..."}
        </div>
      );
    }
    const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    return (
      <div className="space-y-6 mt-4 p-4 border border-[hsl(var(--border))] rounded-lg bg-card">
        <div className="text-sm text-muted-foreground mb-2">
          Question {currentQuestionIndex + 1} of {visibleQuestions.length}
        </div>
        {renderQuestion(currentQuestionConfig)}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-[hsl(var(--border)))]">
          {!isFirstQuestion ? (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isGenerating}
              className="text-foreground hover:text-foreground hover:bg-[hsl(var(--soft-lavender-hover-bg))]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          ) : (
            <div />
          )}
          {!isLastQuestion && (
            <Button
              onClick={handleNext}
              disabled={isGenerating || !isCurrentQuestionAnswered()}
              className="bg-[hsl(var(--lavender-accent))] text-[hsl(var(--lavender-accent-foreground))] hover:bg-[hsl(var(--lavender-accent))] hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  const questionsToRenderAll = visibleQuestions;
  if (questionsToRenderAll.length === 0) {
    return (
      <div className="p-4 border border-[hsl(var(--border))] rounded-lg bg-card text-muted-foreground text-center">
         No applicable questions for current selections.
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4 p-4 border border-[hsl(var(--border))] rounded-lg bg-card">
      {questionsToRenderAll.map((q) => renderQuestion(q))}
    </div>
  );
}


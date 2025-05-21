'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SetupPanel } from '@/components/design/SetupPanel';
import { ExploreSetupPanel } from '@/components/design/ExploreSetupPanel';
import { SurveyPreviewPanel } from '@/components/design/SurveyPreviewPanel';
import { ConfigurationPanel } from '@/components/design/ConfigurationPanel';
import type { PhotoConfig } from '@/components/design/PhotoSettingsModal';
import type { VideoConfig } from '@/components/design/VideoSettingsModal';
import type { SegmentationConfig } from '@/components/design/SegmentationSettingsModal';
import type { TimeSeriesConfig } from '@/components/design/TimeSeriesSettingsModal';
import { CustomizeSectionsModal } from '@/components/design/CustomizeSectionsModal';
import { allAvailableSurveySections, allAvailableScreenerSections } from '@/config/availableSurveySections';
import { defaultCountries, type Country } from '@/config/countries';
import { SurveyGuideModal } from '@/components/design/SurveyGuideModal';
import { Chatbot } from '@/components/chatbot/Chatbot';
import { ProfileSetupModal, type ProfileData } from '@/components/profile/ProfileSetupModal';
import { DesignPageActionHeader } from '@/components/design/DesignPageActionHeader';
import { DesignPageSetupFooter } from '@/components/design/DesignPageSetupFooter';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exploreTemplates, type ExploreTemplate, type FrameworkSection } from '@/config/exploreTemplates';
import { testTemplates, type TestTemplate } from '@/config/testTemplates';
import { suggestSurveyQuestions, type SuggestSurveyQuestionsInput, type SuggestSurveyQuestionsOutput, type SurveySection, type SurveyQuestion } from '@/ai/flows/suggest-survey-questions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateDocContent, generateSurveyPdf } from '@/lib/pdfUtils';
import { suggestAndApplyContextualConfig } from '@/lib/designUtils';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { screenInMarker } from '@/config/surveyConstants';


type AnySolutionTemplate = ExploreTemplate | TestTemplate;

export default function DesignPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  // UI State
  const [isClient, setIsClient] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [setupComplete, setSetupComplete] = React.useState(false);
  const [isSurveyGuideOpen, setIsSurveyGuideOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [expandAllSections, setExpandAllSections] = React.useState<boolean>(false);
  const [initialFrameworkAnimationDone, setInitialFrameworkAnimationDone] = React.useState(false);
  const [openFrameworkItems, setOpenFrameworkItems] = React.useState<string[]>([]);
  const [openSurveyItems, setOpenSurveyItems] = React.useState<string[]>([]);
  const [isCustomizeSectionsModalOpen, setIsCustomizeSectionsModalOpen] = React.useState(false);


  // Profile State
  const [isProfileSetup, setIsProfileSetup] = React.useState(false);
  const [isLaunchProfileModalOpen, setIsLaunchProfileModalOpen] = React.useState(false);
  const [userProfileData, setUserProfileData] = React.useState<Partial<ProfileData>>({});


  // Template and Configuration State
  const [activeTemplate, setActiveTemplate] = React.useState<AnySolutionTemplate | null>(null);
  const [locallySelectedTemplate, setLocallySelectedTemplate] = React.useState<AnySolutionTemplate | null>(null);
  const [currentFollowUpAnswers, setCurrentFollowUpAnswers] = React.useState<Record<string, string>>({});
  const [isFollowUpFormValid, setIsFollowUpFormValid] = React.useState(false);
  const [pulseSurveyDescription, setPulseSurveyDescription] = React.useState('');
  const [isPulseDescriptionValid, setIsPulseDescriptionValid] = React.useState(false);

  // Survey Content State
  const [surveySections, setSurveySections] = React.useState<SurveySection[]>([]);
  const [generatedSurveyTitle, setGeneratedSurveyTitle] = React.useState<string>('');
  const [generatedSurveyIntroduction, setGeneratedSurveyIntroduction] = React.useState<string>('');
  
  // Template Customizations State
  const [templateCustomizations, setTemplateCustomizations] = React.useState<Record<string, {
    sections: SurveySection[],
    frameworkSections: FrameworkSection[] | null,
    screenerSections: FrameworkSection[] | null
  }>>({});
  
  const [customizedScreenerSections, setCustomizedScreenerSections] = React.useState<FrameworkSection[] | null>(null);
  const [customizedFrameworkSections, setCustomizedFrameworkSections] = React.useState<FrameworkSection[] | null>(null);


  // Configuration Panel State
  const [photoConfig, setPhotoConfig] = React.useState<PhotoConfig | null>(null);
  const [videoConfig, setVideoConfig] = React.useState<VideoConfig | null>(null);
  const [segmentationConfig, setSegmentationConfig] = React.useState<SegmentationConfig | null>(null);
  const [timeSeriesConfig, setTimeSeriesConfig] = React.useState<TimeSeriesConfig | null>(null);
  const [selectedCountries, setSelectedCountries] = React.useState<Country[]>([]);
  const [currentSampleSize, setCurrentSampleSize] = React.useState<number>(100);
  const [estimatedIncidenceRate, setEstimatedIncidenceRate] = React.useState<number | null>(null);
  const [incidenceRateRationale, setIncidenceRateRationale] = React.useState<string>('');
  const [incidenceRateSources, setIncidenceRateSources] = React.useState<string[]>([]);

  const solutionType = Array.isArray(params.solutionType) ? params.solutionType[0] : params.solutionType as 'pulse' | 'explore' | 'test';
  const pageSectionTitle = "Your Survey";

  const currentTemplates = React.useMemo(() => {
    if (solutionType === 'explore') return exploreTemplates;
    if (solutionType === 'test') return testTemplates;
    return [];
  }, [solutionType]);

  const canFinishSetup = React.useMemo(() => {
    if (solutionType === 'pulse') {
      return isPulseDescriptionValid;
    }
    if (solutionType === 'explore' || solutionType === 'test') {
      if (!activeTemplate) return false; 
      return (!activeTemplate.followUpQuestions || activeTemplate.followUpQuestions.length === 0) || isFollowUpFormValid;
    }
    return false;
  }, [solutionType, activeTemplate, isPulseDescriptionValid, isFollowUpFormValid]);

  const isReadyToFinish = canFinishSetup;

  const progressValue = React.useMemo(() => {
    if (setupComplete) return 100;
    if (solutionType === 'pulse') {
      return isPulseDescriptionValid ? 50 : 0;
    }
    if (activeTemplate) {
      if (!activeTemplate.followUpQuestions || activeTemplate.followUpQuestions.length === 0) return 50;
      return isFollowUpFormValid ? 50 : 0;
    }
    return 0;
  }, [setupComplete, solutionType, activeTemplate, isPulseDescriptionValid, isFollowUpFormValid]);


  const panelTitleText = React.useMemo(() => (
    activeTemplate 
      ? "Let's customise your survey" 
      : solutionType === 'explore' 
        ? "What type of project is this?" 
        : solutionType === 'test' 
          ? "What type of project is this?" 
          : "Tell us about your project"
  ), [solutionType, activeTemplate]);

  const panelSubtitleText = React.useMemo(() => (
    activeTemplate
      ? "These quick questions help tailor the flow to your objectives."
      : solutionType === 'explore'
        ? "Select a template to guide your exploration."
        : solutionType === 'test'
          ? "Select a template to guide your testing."
          : "Pulse is designed to help you capture rapid insights with quick fire surveys."
  ), [solutionType, activeTemplate]);


  const memoizedAllAvailableScreenerSections = React.useMemo(() => allAvailableScreenerSections, []);
  
  const memoizedAllAvailableContentSections = React.useMemo(() => {
    return allAvailableSurveySections.filter(s => !s.title.toLowerCase().startsWith('screener:'));
  }, []);


  const memoizedCurrentScreenerSections = React.useMemo(() => {
    // Always use frameworkSections for both explore and test
    return customizedScreenerSections || (activeTemplate || locallySelectedTemplate)?.frameworkSections.filter(s => s.title.toLowerCase().startsWith('screener:')) || [];
  }, [customizedScreenerSections, activeTemplate, locallySelectedTemplate]);

  const memoizedCurrentContentSections = React.useMemo(() => {
    const baseTemplate = activeTemplate || locallySelectedTemplate;
    const templateContentSections = baseTemplate?.frameworkSections.filter(s => !s.title.toLowerCase().startsWith('screener:')) || [];
    const currentCustomized = customizedFrameworkSections;
    if (currentCustomized) {
      const allAvailableTitles = new Set(memoizedAllAvailableContentSections.map(s => s.title));
      const validCustomizedSections = currentCustomized.filter(s => allAvailableTitles.has(s.title));
      return validCustomizedSections;
    }
    return templateContentSections;
  }, [customizedFrameworkSections, activeTemplate, locallySelectedTemplate, memoizedAllAvailableContentSections]);


  const currentFrameworkForPreview = React.useMemo(() => {
    const screeners = memoizedCurrentScreenerSections;
    const content = memoizedCurrentContentSections;
    return [...screeners, ...content];
  }, [memoizedCurrentScreenerSections, memoizedCurrentContentSections]);

  const isSurveyFullyGenerated = setupComplete && !isGenerating && surveySections.length > 0 && surveySections.some(s => s.questions.length > 0);
  const showSurveyContentArea = !isGenerating; 
  const showFrameworkPreviewContent = !isGenerating && !setupComplete && currentFrameworkForPreview.length > 0 && (locallySelectedTemplate || activeTemplate);
  const showMainPlaceholder = showSurveyContentArea && !isSurveyFullyGenerated && !showFrameworkPreviewContent && !isEditMode;


  React.useEffect(() => {
    setIsClient(true);
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        setUserProfileData(parsedProfile);
        if (parsedProfile.name && parsedProfile.email) {
          setIsProfileSetup(true);
        }
      } catch (e) {
        console.error("Error parsing stored profile data", e);
        setIsProfileSetup(false);
      }
    } else {
      setIsProfileSetup(false);
    }
  }, []);

  const handleSurveyContentChange = React.useCallback((output: SuggestSurveyQuestionsOutput) => {
    setSurveySections(output.surveySections || []);
    setGeneratedSurveyTitle(output.surveyTitle || "Survey Title");
    setGeneratedSurveyIntroduction(output.surveyIntroduction || "Welcome to this survey. Your feedback is valuable.");
    setEstimatedIncidenceRate(output.estimatedIncidenceRate ?? null);
    setIncidenceRateRationale(output.incidenceRateRationale || '');
    setIncidenceRateSources(output.incidenceRateSources || []);

    if (output.surveySections && output.surveySections.length > 0 && output.surveySections.some(section => section.questions.length > 0)) {
        setSetupComplete(true);
    } else {
        setSetupComplete(false);
    }
  }, []);

  const generateSurveyPrompt = React.useCallback((template: AnySolutionTemplate, answers: Record<string, string>): string => {
    let prompt = template.initialPromptSeed;

    const currentScreeners = customizedScreenerSections || template.frameworkSections.filter(s => s.title.toLowerCase().startsWith('screener:'));
    const currentContent = customizedFrameworkSections || template.frameworkSections.filter(s => !s.title.toLowerCase().startsWith('screener:'));
    const currentFramework = [...currentScreeners, ...currentContent];


    if (solutionType === 'explore' && 'frameworkSections' in template && template.id === 'themes') {
        const typedTemplate = template as ExploreTemplate;
        const explorationFocus = answers['explorationFocus'] || 'not specified';
        let themeDescription = 'the specified theme';
        let contextDescription = 'the relevant category or context';

        if (explorationFocus === 'definitions') {
            themeDescription = answers['themeDescriptionForDefinitions'] || 'the specified theme/trend';
            contextDescription = 'the general category related to this theme/trend';
        } else if (explorationFocus === 'relevance') {
            themeDescription = answers['themeDescriptionForRelevance'] || 'the specified theme/trend';
            contextDescription = `the product/service: "${answers['productDescriptionForRelevance'] || 'the specified product/service'}"`;
        } else if (explorationFocus === 'alignment') {
            themeDescription = answers['themeDescriptionForAlignment'] || 'the specified theme/trend';
            contextDescription = `the brand: "${answers['brandDescriptionForAlignment'] || 'the specified brand'}"`;
        }

        prompt = typedTemplate.initialPromptSeed
            .replace(/{explorationFocus}/g, explorationFocus)
            .replace(/{themeDescription}/g, themeDescription)
            .replace(/{contextDescription}/g, contextDescription);
    } else if (solutionType === 'explore' && 'frameworkSections' in template && template.id === 'usageExperience') {
        const typedTemplate = template as ExploreTemplate;
        const usageFocusType = answers['usageFocusType'] || 'unspecified type';
        const usageFocusDescription = answers['usageFocusDescription'] || 'not specified';
        const usageUnderstandingDepth = answers['usageUnderstandingDepth'];

        let usageAnalysisGoal = '';
        if (usageUnderstandingDepth === 'broad') {
            usageAnalysisGoal = 'understand broad usage behaviours across all occasions / moments';
        } else if (usageUnderstandingDepth === 'deepDive') {
            const deepDiveOccasion = answers['usageDeepDiveOccasion'] || 'a specific occasion';
            usageAnalysisGoal = `deep dive into the specific usage occasion of: "${deepDiveOccasion}"`;
        } else {
            usageAnalysisGoal = 'understand usage (depth not specified)';
        }

        prompt = typedTemplate.initialPromptSeed
            .replace('{usageFocusType}', usageFocusType)
            .replace('{usageFocusDescription}', usageFocusDescription)
            .replace('{usageAnalysisGoal}', usageAnalysisGoal);
    } else {
      for (const key in answers) {
        if (key !== 'projectBigQuestion') {
            const answerValue = typeof answers[key] === 'number' ? String(answers[key]) : answers[key];
            prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), answerValue || `details about ${key}`);
        }
      }
    }

    const frameworkSectionTitles = currentFramework.map(s => s.title);
    prompt = prompt.replace(
      /The survey MUST be structured into the following sections.*?The section titles MUST BE EXACTLY as follows:/s,
      `The survey MUST be structured into the following sections. Each section MUST have a 'sectionTitle', an optional 'sectionDescription', and an array of 'questions'. The section titles MUST BE EXACTLY: ${JSON.stringify(frameworkSectionTitles)}.`
    );
    prompt = prompt.replace(
      /The survey MUST be structured into the following ([\w\s]+) sections.*?The section titles MUST BE EXACTLY as follows:/s,
      `The survey MUST be structured into the following sections. Each section MUST have a 'sectionTitle', an optional 'sectionDescription', and an array of 'questions'. The section titles MUST BE EXACTLY: ${JSON.stringify(frameworkSectionTitles)}.`
    );


    prompt = prompt.replace(/{[a-zA-Z0-9_]+\}/g, "relevant details");
    return prompt;
  }, [solutionType, customizedFrameworkSections, customizedScreenerSections]);

  const handleFinishSetup = React.useCallback(async () => {
    if (isGenerating || setupComplete) return;

    setIsGenerating(true);

    // Only reset survey sections if we don't have any yet
    if (surveySections.length === 0) {
      setSurveySections([]);
      setGeneratedSurveyTitle('');
      setGeneratedSurveyIntroduction('');
      setEstimatedIncidenceRate(null);
      setIncidenceRateRationale('');
      setIncidenceRateSources([]);
    }

    let surveyDescription = "";

    if (solutionType === 'pulse') {
      if (!isPulseDescriptionValid || !pulseSurveyDescription) {
        setIsGenerating(false);
        return;
      }
      surveyDescription = pulseSurveyDescription;
    } else if (solutionType === 'explore' || solutionType === 'test') {
      if (!activeTemplate) {
        setIsGenerating(false);
        return;
      }
      if (!isFollowUpFormValid && activeTemplate.followUpQuestions && activeTemplate.followUpQuestions.length > 0) {
         setIsGenerating(false);
         return;
      }
      surveyDescription = generateSurveyPrompt(activeTemplate, currentFollowUpAnswers);
    }

    const marketString = selectedCountries.map(c => c.label).join(', ');
    const projectContext = currentFollowUpAnswers['projectBigQuestion'] || undefined;


    try {
      const inputForFlow: SuggestSurveyQuestionsInput = {
        surveyDescription,
        includePhotoQuestions: !!photoConfig,
        includeVideoQuestions: !!videoConfig,
        timeSeriesConfig: timeSeriesConfig ? {
          cadence: timeSeriesConfig.cadence,
          numWaves: timeSeriesConfig.numWaves,
          startDate: timeSeriesConfig.startDate ? timeSeriesConfig.startDate.toISOString().split('T')[0] : '',
          keyMetricFocus: timeSeriesConfig.keyMetricFocus,
        } : undefined,
        selectedMarket: marketString || undefined,
        projectContext: projectContext,
      };

      const result: SuggestSurveyQuestionsOutput = await suggestSurveyQuestions(inputForFlow);
      handleSurveyContentChange(result);

      if (result.surveySections && result.surveySections.length > 0 && result.surveySections.some(section => section.questions.length > 0)) {
        setExpandAllSections(true); 
        
        await suggestAndApplyContextualConfig(
            projectContext,
            currentSampleSize,
            setSelectedCountries,
            setPhotoConfig,
            setVideoConfig,
            setTimeSeriesConfig,
            toast
        );
      }
    } catch (error) {
      console.error(`Error generating survey for ${solutionType}:`, error);
      toast({
        title: "Generation Error",
        description: "Could not generate survey content. Please try again.",
        variant: "destructive",
      });
      setSetupComplete(false);
    } finally {
      setIsGenerating(false);
    }
  }, [
    isGenerating, setupComplete, surveySections.length, solutionType, isPulseDescriptionValid, pulseSurveyDescription,
    activeTemplate, isFollowUpFormValid, currentFollowUpAnswers, generateSurveyPrompt,
    photoConfig, videoConfig, timeSeriesConfig, handleSurveyContentChange, toast, selectedCountries,
    currentSampleSize
  ]);

  const handleAnswersOrDescriptionChange = React.useCallback((answers: Record<string, string>, isValid: boolean) => {
    if (solutionType === 'pulse') {
      setPulseSurveyDescription(answers.description);
      setIsPulseDescriptionValid(isValid);
    } else {
      setCurrentFollowUpAnswers(answers);
      setIsFollowUpFormValid(isValid);
    }
  }, [solutionType]);


  const handlePulseSetupPanelDescriptionChange = React.useCallback((description: string, isValid: boolean) => {
    handleAnswersOrDescriptionChange({ description }, isValid);
  }, [handleAnswersOrDescriptionChange]);

  const handleLocalTemplateSelectionChange = React.useCallback((template: AnySolutionTemplate | null) => {
    setLocallySelectedTemplate(template);
    if (template?.id !== locallySelectedTemplate?.id) {
      // Save current template's customizations if any
      if (locallySelectedTemplate?.id) {
        persistCurrentTemplateCustomizations(
          locallySelectedTemplate.id,
          surveySections,
          customizedFrameworkSections,
          customizedScreenerSections,
          setTemplateCustomizations
        );
      }
      // Load new template's customizations if they exist
      if (template?.id && templateCustomizations[template.id]) {
        setSurveySections(templateCustomizations[template.id].sections);
        setCustomizedFrameworkSections(templateCustomizations[template.id].frameworkSections);
        setCustomizedScreenerSections(templateCustomizations[template.id].screenerSections);
      } else {
        setSurveySections([]);
        setCustomizedFrameworkSections(null);
        setCustomizedScreenerSections(null);
      }
      setGeneratedSurveyTitle('');
      setGeneratedSurveyIntroduction('');
      setCurrentFollowUpAnswers({});
      setEstimatedIncidenceRate(null);
      setIncidenceRateRationale('');
      setIncidenceRateSources([]);
      setInitialFrameworkAnimationDone(false);
    }
  }, [locallySelectedTemplate?.id, surveySections, customizedFrameworkSections, customizedScreenerSections, templateCustomizations]);

  const handleActiveTemplateChange = React.useCallback((template: AnySolutionTemplate | null) => {
    if (activeTemplate?.id) {
      persistCurrentTemplateCustomizations(
        activeTemplate.id,
        surveySections,
        customizedFrameworkSections,
        customizedScreenerSections,
        setTemplateCustomizations
      );
    }
    setActiveTemplate(template);
    if (template?.id !== activeTemplate?.id) {
      if (template?.id && templateCustomizations[template.id]) {
        setSurveySections(templateCustomizations[template.id].sections);
        setCustomizedFrameworkSections(templateCustomizations[template.id].frameworkSections);
        setCustomizedScreenerSections(templateCustomizations[template.id].screenerSections);
      } else {
        setSurveySections([]);
        setCustomizedFrameworkSections(null);
        setCustomizedScreenerSections(null);
      }
      setGeneratedSurveyTitle('');
      setGeneratedSurveyIntroduction('');
      setEstimatedIncidenceRate(null);
      setIncidenceRateRationale('');
      setIncidenceRateSources([]);
      setCurrentFollowUpAnswers({});
      setIsEditMode(false);
      setInitialFrameworkAnimationDone(false);
    }
    if (template) {
      if (!template.followUpQuestions || template.followUpQuestions.length === 0) {
        setIsFollowUpFormValid(true);
      } else {
        setIsFollowUpFormValid(false);
      }
    } else {
      if (solutionType !== 'pulse') setIsFollowUpFormValid(false);
    }
  }, [solutionType, activeTemplate?.id, surveySections, customizedFrameworkSections, customizedScreenerSections, templateCustomizations]);


  const handleBackClick = React.useCallback(() => {
    setIsEditMode(false);
    setInitialFrameworkAnimationDone(false);
    if (solutionType === 'pulse') {
      router.push('/');
    } else if (solutionType === 'explore' || solutionType === 'test') {
      if (activeTemplate) {
        handleActiveTemplateChange(null); 
        setLocallySelectedTemplate(null); 
      } else {
        router.push('/'); 
      }
    } else {
      router.push('/');
    }
  }, [solutionType, router, activeTemplate, handleActiveTemplateChange]);


  const backButtonText = React.useMemo(() => {
    if (solutionType === 'pulse') {
      return "Back to Solutions";
    }
    if (solutionType === 'explore' || solutionType === 'test') {
      if (activeTemplate) {
        return "Back to Templates";
      }
      return "Back to Solutions";
    }
    return "Back";
  }, [solutionType, activeTemplate]);


  const handleGeneratedSurveyTitleChange = (newTitle: string) => setGeneratedSurveyTitle(newTitle);
  const handleGeneratedSurveyIntroductionChange = (newIntro: string) => setGeneratedSurveyIntroduction(newIntro);

  const persistAfterUpdate = (updatedSections: SurveySection[]) => {
    const templateId = activeTemplate?.id || locallySelectedTemplate?.id;
    persistCurrentTemplateCustomizations(
      templateId,
      updatedSections,
      customizedFrameworkSections,
      customizedScreenerSections,
      setTemplateCustomizations
    );
  };

  const handleSectionChange = (sectionIndex: number, updatedData: Partial<SurveySection>) => {
    setSurveySections(prevSections => {
      const updatedSections = prevSections.map((section, idx) =>
        idx === sectionIndex ? { ...section, ...updatedData } : section
      );
      persistCurrentTemplateCustomizations(
        getCurrentTemplateId(),
        updatedSections,
        customizedFrameworkSections,
        customizedScreenerSections,
        setTemplateCustomizations
      );
      return updatedSections;
    });
  };

  const handleQuestionChange = (sectionIndex: number, questionIndex: number, updatedData: Partial<SurveyQuestion>) => {
    setSurveySections(prevSections => {
      const newSections = [...prevSections];
      const targetSection = { ...newSections[sectionIndex] };
      const newQuestions = [...targetSection.questions];
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], ...updatedData };
      targetSection.questions = newQuestions;
      newSections[sectionIndex] = targetSection;
      persistCurrentTemplateCustomizations(
        getCurrentTemplateId(),
        newSections,
        customizedFrameworkSections,
        customizedScreenerSections,
        setTemplateCustomizations
      );
      return newSections;
    });
  };

  const handleOptionChange = (sectionIndex: number, questionIndex: number, optionIndex: number, newTextValue: string) => {
    setSurveySections(prevSections => {
      const sectionsCopy = [...prevSections];
      const sectionToUpdate = { ...sectionsCopy[sectionIndex] };
      const questionsInSection = [...sectionToUpdate.questions];
      const questionToUpdate = { ...questionsInSection[questionIndex] };
      if (!questionToUpdate.options) {
        questionToUpdate.options = [];
      }
      const optionsArray = [...questionToUpdate.options];
      if (optionIndex >= optionsArray.length) {
        if (questionToUpdate.questionType === 'screener' && newTextValue.includes(screenInMarker)) {
          optionsArray.push(newTextValue);
        } else if (questionToUpdate.questionType === 'screener') {
          optionsArray.push(newTextValue.trim());
        } else {
          optionsArray.push(newTextValue);
        }
      } else {
        const currentOptionFullText = optionsArray[optionIndex];
        let finalNewOptionText = newTextValue;
        if (questionToUpdate.questionType === 'screener' && currentOptionFullText.includes(screenInMarker)) {
          finalNewOptionText = `${newTextValue.trim()} ${screenInMarker}`;
        }
        optionsArray[optionIndex] = finalNewOptionText;
      }
      questionToUpdate.options = optionsArray;
      questionsInSection[questionIndex] = questionToUpdate;
      sectionToUpdate.questions = questionsInSection;
      sectionsCopy[sectionIndex] = sectionToUpdate;
      persistCurrentTemplateCustomizations(
        getCurrentTemplateId(),
        sectionsCopy,
        customizedFrameworkSections,
        customizedScreenerSections,
        setTemplateCustomizations
      );
      return sectionsCopy;
    });
  };

  const handleOptionDelete = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    setSurveySections(prevSections => {
      const sectionsCopy = [...prevSections];
      const sectionToUpdate = { ...sectionsCopy[sectionIndex] };
      const questionsInSection = [...sectionToUpdate.questions];
      const questionToUpdate = { ...questionsInSection[questionIndex] };
      if (questionToUpdate.options) {
        const optionsArray = [...questionToUpdate.options];
        optionsArray.splice(optionIndex, 1);
        questionToUpdate.options = optionsArray;
      }
      questionsInSection[questionIndex] = questionToUpdate;
      sectionToUpdate.questions = questionsInSection;
      sectionsCopy[sectionIndex] = sectionToUpdate;
      persistCurrentTemplateCustomizations(
        getCurrentTemplateId(),
        sectionsCopy,
        customizedFrameworkSections,
        customizedScreenerSections,
        setTemplateCustomizations
      );
      return sectionsCopy;
    });
  };

  const handleScreenerOptionToggle = (sectionIndex: number, questionIndex: number, optionIndex: number, isChecked: boolean) => {
    setSurveySections(prevSections => {
      const sectionsCopy = [...prevSections];
      const sectionToUpdate = { ...sectionsCopy[sectionIndex] };
      const questionsInSection = [...sectionToUpdate.questions];
      const questionToUpdate = { ...questionsInSection[questionIndex] };
      if (questionToUpdate.questionType !== 'screener' || !questionToUpdate.options) return prevSections;
      const optionsArray = [...questionToUpdate.options];
      let currentOptionText = optionsArray[optionIndex];
      if (currentOptionText.includes(screenInMarker)) {
        currentOptionText = currentOptionText.replace(screenInMarker, '').trim();
      }
      if (isChecked) {
        optionsArray[optionIndex] = `${currentOptionText} ${screenInMarker}`;
      } else {
        optionsArray[optionIndex] = currentOptionText;
      }
      questionToUpdate.options = optionsArray;
      questionsInSection[questionIndex] = questionToUpdate;
      sectionToUpdate.questions = questionsInSection;
      sectionsCopy[sectionIndex] = sectionToUpdate;
      persistCurrentTemplateCustomizations(
        getCurrentTemplateId(),
        sectionsCopy,
        customizedFrameworkSections,
        customizedScreenerSections,
        setTemplateCustomizations
      );
      return sectionsCopy;
    });
  };

  const handleAddSection = () => {
    setSurveySections(prevSections => {
      const newSection: SurveySection = {
        sectionTitle: `New Section ${prevSections.length + 1}`,
        sectionDescription: '',
        questions: []
      };
      const updatedSections = [...prevSections, newSection];
      persistCurrentTemplateCustomizations(
        getCurrentTemplateId(),
        updatedSections,
        customizedFrameworkSections,
        customizedScreenerSections,
        setTemplateCustomizations
      );
      return updatedSections;
    });
  };

  const handleAddQuestion = (sectionIndex: number) => {
    setSurveySections(prevSections => {
      const newSections = [...prevSections];
      const targetSection = { ...newSections[sectionIndex] };
      const newQuestion: SurveyQuestion = {
        questionText: `New Question ${targetSection.questions.length + 1}`,
        questionType: 'openText',
        options: []
      };
      targetSection.questions = [...targetSection.questions, newQuestion];
      newSections[sectionIndex] = targetSection;
      persistCurrentTemplateCustomizations(
        getCurrentTemplateId(),
        newSections,
        customizedFrameworkSections,
        customizedScreenerSections,
        setTemplateCustomizations
      );
      return newSections;
    });
  };

  const handleSectionReorder = (draggedSectionIndex: number, targetSectionIndex: number) => {
    setSurveySections(prevSections => {
      const newSections = [...prevSections];
      const [draggedSection] = newSections.splice(draggedSectionIndex, 1);
      newSections.splice(targetSectionIndex, 0, draggedSection);
      persistCurrentTemplateCustomizations(
        getCurrentTemplateId(),
        newSections,
        customizedFrameworkSections,
        customizedScreenerSections,
        setTemplateCustomizations
      );
      return newSections;
    });
  };

  const handleQuestionReorder = (sectionIndex: number, draggedQuestionIndex: number, targetQuestionIndex: number) => {
    setSurveySections(prevSections => {
      const newSections = [...prevSections];
      const targetSection = { ...newSections[sectionIndex] };
      const newQuestions = [...targetSection.questions];
      const [draggedQuestion] = newQuestions.splice(draggedQuestionIndex, 1);
      newQuestions.splice(targetQuestionIndex, 0, draggedQuestion);
      targetSection.questions = newQuestions;
      newSections[sectionIndex] = targetSection;
      persistCurrentTemplateCustomizations(
        getCurrentTemplateId(),
        newSections,
        customizedFrameworkSections,
        customizedScreenerSections,
        setTemplateCustomizations
      );
      return newSections;
    });
  };

  const handleDownloadPdf = () => {
    if (generatedSurveyTitle && generatedSurveyIntroduction && surveySections.length > 0) {
      generateSurveyPdf(generatedSurveyTitle, generatedSurveyIntroduction, surveySections);
    } else {
      toast({
        title: "Cannot Download PDF",
        description: "Survey content is not fully generated or available.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDoc = () => {
    if (!generatedSurveyTitle || !generatedSurveyIntroduction || surveySections.length === 0) {
      toast({
        title: "Cannot Download DOC",
        description: "Survey content is not fully generated or available.",
        variant: "destructive",
      });
      return;
    }

    const docContent = generateDocContent(generatedSurveyTitle, generatedSurveyIntroduction, surveySections);
    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'survey_document.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleOpenAsGoogleDoc = async () => {
    if (!generatedSurveyTitle || !generatedSurveyIntroduction || surveySections.length === 0) {
      toast({
        title: "Cannot Open as Google Doc",
        description: "Survey content is not fully generated or available.",
        variant: "destructive",
      });
      return;
    }

    const docContent = generateDocContent(generatedSurveyTitle, generatedSurveyIntroduction, surveySections);

    try {
      await navigator.clipboard.writeText(docContent);
      window.open('https://docs.google.com/document/create', '_blank');
      toast({
        title: "Content Copied",
        description: "Survey content copied to clipboard. Paste it into the new Google Doc.",
      });
    } catch (err) {
      console.error('Failed to copy content: ', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy content to clipboard. Please try downloading as DOC.",
        variant: "destructive",
      });
    }
  };

  const handleSaveCustomizedContentSections = React.useCallback((updatedSections: FrameworkSection[]) => {
    setCustomizedFrameworkSections(updatedSections);
    
    // Save to template customizations
    const currentTemplateId = activeTemplate?.id || locallySelectedTemplate?.id;
    if (currentTemplateId) {
      persistCurrentTemplateCustomizations(currentTemplateId, surveySections, updatedSections, customizedScreenerSections, setTemplateCustomizations);
    }
  }, [activeTemplate?.id, locallySelectedTemplate?.id, surveySections, customizedScreenerSections]);

  const handleSaveCustomizedScreenerSections = React.useCallback((updatedSections: FrameworkSection[]) => {
    setCustomizedScreenerSections(updatedSections);
    
    // Save to template customizations
    const currentTemplateId = activeTemplate?.id || locallySelectedTemplate?.id;
    if (currentTemplateId) {
      persistCurrentTemplateCustomizations(currentTemplateId, surveySections, customizedFrameworkSections, updatedSections, setTemplateCustomizations);
    }
  }, [activeTemplate?.id, locallySelectedTemplate?.id, surveySections, customizedFrameworkSections]);
  
  const handleOpenCustomizeModal = React.useCallback(() => {
    setIsCustomizeSectionsModalOpen(true);
  }, []);

  const handleCloseCustomizeModal = React.useCallback(() => {
    setIsCustomizeSectionsModalOpen(false);
  }, []);

  const getPlaceholderText = React.useCallback(() => {
    if (isGenerating) return 'Generating survey...';
    if (setupComplete && generatedSurveyTitle) return '';

    if (!setupComplete && (locallySelectedTemplate || activeTemplate) && (currentFrameworkForPreview.length > 0 )) {
      if (activeTemplate) {
        if (!activeTemplate.followUpQuestions || activeTemplate.followUpQuestions.length === 0 || isFollowUpFormValid) {
          return `This is a preview of your survey. Click "Generate Survey" to create your questions.`;
        } else {
          return `This is a preview of your survey. Complete the configuration to enable survey generation.`;
        }
      } else if (locallySelectedTemplate) {
        return `Review the framework for "${locallySelectedTemplate.title}". Click "Next" in the left panel to configure.`;
      }
    }

    if (solutionType === 'pulse') {
      return isPulseDescriptionValid ? "Ready to roll! Click 'Generate Survey' to create your Pulse survey." : 'Describe your Pulse survey goals to get started.';
    }
    if (solutionType === 'explore' || solutionType === 'test') {
      if (activeTemplate) {
        if (isReadyToFinish) {
          return "Ready to roll! Click 'Generate Survey' to create your questions.";
        }
        return `Complete the configuration for "${activeTemplate.title}" to enable survey generation.`;
      }
      return `Choose an ${solutionType === 'explore' ? 'Explore' : 'Test'} Template and fill in the details to preview your survey.`;
    }

    return 'Your survey preview will appear here once the setup is complete.';
  }, [isGenerating, setupComplete, generatedSurveyTitle, locallySelectedTemplate, activeTemplate, currentFrameworkForPreview, solutionType, isPulseDescriptionValid, isFollowUpFormValid, isReadyToFinish]);

  React.useEffect(() => {
    if (showFrameworkPreviewContent && currentFrameworkForPreview.length > 0 && !initialFrameworkAnimationDone) {
      const firstSectionId = currentFrameworkForPreview[0].title;
      setOpenFrameworkItems([firstSectionId]);
      const timer = setTimeout(() => {
        setOpenFrameworkItems([]);
        setInitialFrameworkAnimationDone(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [showFrameworkPreviewContent, currentFrameworkForPreview, initialFrameworkAnimationDone]);

  React.useEffect(() => {
    if (isSurveyFullyGenerated) {
      setOpenSurveyItems(expandAllSections ? surveySections.map(s => s.sectionTitle) : []);
      setOpenFrameworkItems([]);
    } else if (showFrameworkPreviewContent) {
      if (initialFrameworkAnimationDone || expandAllSections) {
        setOpenFrameworkItems(expandAllSections ? currentFrameworkForPreview.map(s => s.title) : []);
      }
      setOpenSurveyItems([]);
    } else {
      setOpenFrameworkItems([]);
      setOpenSurveyItems([]);
    }
  }, [expandAllSections, isSurveyFullyGenerated, surveySections, showFrameworkPreviewContent, currentFrameworkForPreview, initialFrameworkAnimationDone]);


  const actualLaunchSurvey = React.useCallback(async () => {
    const surveyData = {
      title: generatedSurveyTitle,
      introduction: generatedSurveyIntroduction,
      sections: surveySections.map(section => ({
        title: section.sectionTitle,
        description: section.sectionDescription,
        questions: section.questions.map(q => ({
          text: q.questionText,
          type: q.questionType,
          options: q.options
        }))
      })),
      questionCount: surveySections.reduce((acc, s) => acc + s.questions.length, 0),
    };

    const configurationData = {
      solutionType,
      template: activeTemplate?.title || 'Pulse',
      templateConfiguration: currentFollowUpAnswers,
      pulseSurveyDescription: solutionType === 'pulse' ? pulseSurveyDescription : undefined,
      sampleSize: currentSampleSize,
      markets: selectedCountries.map(c => c.label),
      estimatedIR: estimatedIncidenceRate,
      photoConfiguration: photoConfig,
      videoConfiguration: videoConfig,
      segmentationConfiguration: segmentationConfig,
      timeSeriesConfiguration: timeSeriesConfig,
    };

    const submissionPayload = {
      surveySummary: surveyData,
      configurationDetails: configurationData,
      userProfile: userProfileData,
      submittedAt: serverTimestamp(), 
    };

    console.log("Data to be sent to backend for email:", JSON.stringify(submissionPayload, null, 2));

    try {
      await addDoc(collection(db, "surveySubmissions"), submissionPayload);
      toast({
        title: "Survey Launch Data Saved!",
        description: "Your survey configuration and details have been saved to the database."
      });
    } catch (error) {
      console.error("Error writing document to Firestore: ", error);
      toast({
        title: "Launch Error",
        description: "Could not save survey data to the database. Please try again.",
        variant: "destructive",
      });
    }
  }, [
      generatedSurveyTitle, generatedSurveyIntroduction, surveySections,
      solutionType, activeTemplate, currentFollowUpAnswers, pulseSurveyDescription,
      currentSampleSize, selectedCountries, estimatedIncidenceRate, photoConfig,
      videoConfig, segmentationConfig, timeSeriesConfig, userProfileData, toast
  ]);

  const handleTriggerLaunchProcess = React.useCallback(() => {
    if (isProfileSetup) {
      actualLaunchSurvey();
    } else {
      setIsLaunchProfileModalOpen(true);
    }
  }, [isProfileSetup, actualLaunchSurvey]);

  const handleProfileSaveAndLaunch = React.useCallback((profileData: ProfileData) => {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setUserProfileData(profileData);
    setIsProfileSetup(true);
    setIsLaunchProfileModalOpen(false);
    actualLaunchSurvey();
  }, [actualLaunchSurvey]);

  const renderFooter = () => (
    <DesignPageSetupFooter
      progressValue={progressValue}
      isReadyToFinish={isReadyToFinish}
      isGenerating={isGenerating}
      setupComplete={setupComplete}
      onFinishSetup={handleFinishSetup}
    />
  );

  // Helper to get current template id
  const getCurrentTemplateId = () => activeTemplate?.id || locallySelectedTemplate?.id;

  // Utility function to persist current template customizations
  function persistCurrentTemplateCustomizations(
    templateId: string | undefined,
    surveySections: SurveySection[],
    customizedFrameworkSections: FrameworkSection[] | null,
    customizedScreenerSections: FrameworkSection[] | null,
    setTemplateCustomizations: React.Dispatch<React.SetStateAction<Record<string, {
      sections: SurveySection[],
      frameworkSections: FrameworkSection[] | null,
      screenerSections: FrameworkSection[] | null
    }>>>
  ) {
    if (!templateId) return;
    setTemplateCustomizations((prev) => ({
      ...prev,
      [templateId]: {
        sections: surveySections,
        frameworkSections: customizedFrameworkSections,
        screenerSections: customizedScreenerSections,
      }
    }));
  }

  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--accent-purple))]" />
        </div>
        <Chatbot />
      </div>
    );
  }

  if (!solutionType || ((solutionType === 'explore' || solutionType === 'test') && !currentTemplates.length)) {
    router.push('/');
    return (
       <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center">
          <p>Invalid solution type or configuration. Redirecting...</p>
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--accent-purple))] ml-2" />
        </div>
      </div>
    );
  }7


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow p-8 flex flex-col md:flex-row gap-6 h-[calc(92vh/0.7)]"> {/* section-padding, element-gap */}

        <div className="md:w-1/3 lg:w-[420px] flex flex-col bg-card p-8 rounded-[16px] shadow-sm border border-border"> {/* card-padding, radius */}
          <div className="mb-6"> {/* element-gap: 24px */}
            <Button
              variant="outline"
              onClick={handleBackClick}
              className="text-foreground hover:text-foreground hover:bg-[hsl(var(--primary)/0.1)] rounded-[16px]" // radius
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 h-4 w-4"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> {/* ArrowLeft */}
              {backButtonText}
            </Button>
          </div>

          <div className="flex-grow min-h-0">
            {(solutionType === 'explore' || solutionType === 'test') ? (
              <ExploreSetupPanel
                templates={currentTemplates}
                isLoading={isGenerating}
                activeTemplateId={activeTemplate?.id}
                onActiveTemplateChange={handleActiveTemplateChange}
                onLocalTemplateSelectionChange={handleLocalTemplateSelectionChange}
                panelVariant={solutionType}
                panelTitle={panelTitleText}
                panelSubtitle={panelSubtitleText}
                onAnswersChange={handleAnswersOrDescriptionChange}
                renderFooter={renderFooter}
              />
            ) : (
              <SetupPanel
                solutionType={solutionType}
                onDescriptionChange={handlePulseSetupPanelDescriptionChange}
                isGenerating={isGenerating}
                renderFooter={renderFooter}
              />
            )}
          </div>
        </div>


        <div className="md:w-2/3 lg:flex-grow flex flex-col h-full">
          <DesignPageActionHeader
            pageTitle={pageSectionTitle}
            showSurveyControls={!!(isSurveyFullyGenerated || showFrameworkPreviewContent)}
            isSurveyFullyGenerated={isSurveyFullyGenerated}
            onToggleSurveyGuide={() => setIsSurveyGuideOpen(true)}
            onToggleExpandAll={() => {
              setExpandAllSections(!expandAllSections);
              setInitialFrameworkAnimationDone(true);
            }}
            expandAllSections={expandAllSections}
            onToggleEditMode={() => setIsEditMode(!isEditMode)}
            isEditModeActive={isEditMode}
            onDownloadPdf={handleDownloadPdf}
            onDownloadDoc={handleDownloadDoc}
            onOpenAsGoogleDoc={handleOpenAsGoogleDoc}
          />
          <SurveyPreviewPanel
            surveySections={surveySections}
            preliminaryFrameworkSections={currentFrameworkForPreview}
            actualSurveyTitle={generatedSurveyTitle}
            actualSurveyIntroduction={generatedSurveyIntroduction}
            isLoading={isGenerating}
            showPlaceholder={showMainPlaceholder}
            placeholderText={getPlaceholderText()}
            solutionType={solutionType as 'pulse' | 'explore' | 'test'}
            isEditModeActive={isEditMode}
            showFrameworkPreview={!!showFrameworkPreviewContent}
            onSurveyTitleChange={handleGeneratedSurveyTitleChange}
            onSurveyIntroductionChange={handleGeneratedSurveyIntroductionChange}
            onSectionChange={handleSectionChange}
            onQuestionChange={handleQuestionChange}
            onOptionChange={handleOptionChange}
            onOptionDelete={handleOptionDelete}
            onScreenerOptionToggle={handleScreenerOptionToggle}
            onAddSection={handleAddSection}
            onAddQuestion={handleAddQuestion}
            onSectionReorder={handleSectionReorder}
            onQuestionReorder={handleQuestionReorder}
            dynamicPlaceholders={currentFollowUpAnswers}
            isSurveyGenerated={isSurveyFullyGenerated}
            onOpenCustomizeModal={handleOpenCustomizeModal}
            openFrameworkAccordionItems={openFrameworkItems}
            onOpenFrameworkChange={setOpenFrameworkItems}
            openSurveySectionAccordionItems={openSurveyItems}
            onOpenSurveyChange={setOpenSurveyItems}
          />
        </div>
      </main>
      {isSurveyFullyGenerated && (
        <ConfigurationPanel
          sampleSize={currentSampleSize}
          onSampleSizeChange={setCurrentSampleSize}
          photoConfig={photoConfig}
          onPhotoConfigChange={setPhotoConfig}
          videoConfig={videoConfig}
          onVideoConfigChange={setVideoConfig}
          segmentationConfig={segmentationConfig}
          onSegmentationConfigChange={setSegmentationConfig}
          timeSeriesConfig={timeSeriesConfig}
          onTimeSeriesConfigChange={setTimeSeriesConfig}
          selectedCountries={selectedCountries}
          onSelectedCountriesChange={setSelectedCountries}
          surveyGenerated={isSurveyFullyGenerated}
          estimatedIR={estimatedIncidenceRate}
          irRationale={incidenceRateRationale}
          irSources={incidenceRateSources}
          onTriggerLaunch={handleTriggerLaunchProcess}
        />
      )}
      <SurveyGuideModal isOpen={isSurveyGuideOpen} onClose={() => setIsSurveyGuideOpen(false)} />
      {isCustomizeSectionsModalOpen && (
         <CustomizeSectionsModal
          isOpen={isCustomizeSectionsModalOpen}
          onClose={handleCloseCustomizeModal}
          activeTemplateTitle={activeTemplate?.title || 'Current'}
          currentScreenerSections={memoizedCurrentScreenerSections}
          currentContentSections={memoizedCurrentContentSections}
          allAvailableScreenerSections={memoizedAllAvailableScreenerSections}
          allAvailableContentSections={memoizedAllAvailableContentSections}
          onSaveScreeners={handleSaveCustomizedScreenerSections}
          onSaveContentSections={handleSaveCustomizedContentSections}
          solutionType={solutionType as 'pulse' | 'explore' | 'test'}
        />
      )}
       <ProfileSetupModal
        isOpen={isLaunchProfileModalOpen}
        onOpenChange={setIsLaunchProfileModalOpen}
        onSave={handleProfileSaveAndLaunch}
        saveButtonText="Save Profile & Launch"
        initialData={userProfileData}
      />
      <Chatbot />
    </div>
  );
}



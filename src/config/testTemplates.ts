
import type { LucideIcon } from 'lucide-react';
import { ListChecks, ZoomIn, GitCompareArrows, Lightbulb, FileText, Tag, Package, MessageSquare, Settings, Shield, Filter } from 'lucide-react';
import type { FollowUpQuestionConfig, FollowUpQuestionOption, FrameworkSection } from './exploreTemplates'; // Re-use and extend the structure
import type { SurveyQuestion } from '@/ai/flows/suggest-survey-questions';

export interface TestTemplate {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  followUpQuestions?: FollowUpQuestionConfig[];
  initialPromptSeed: string;
  frameworkSections: FrameworkSection[]; // Added for consistency with ExploreTemplate for preview
}

const finalContextQuestion: FollowUpQuestionConfig = {
  id: 'projectBigQuestion',
  label: "What's the big question behind your project?",
  description: "What decision would this research help you make? Any extra context you can share will help us tailor your project to deliver the best results.",
  type: 'textarea',
  placeholder: 'e.g., Which concept should we invest in? Is this messaging clear and persuasive? How does our new feature compare to the old one?',
  required: false,
  defaultValue: '',
};

const whatToTestOptions: FollowUpQuestionOption[] = [
  { value: 'concepts', label: 'Concepts', icon: Lightbulb },
  { value: 'ideas', label: 'Ideas', icon: Lightbulb },
  { value: 'claims', label: 'Claims', icon: Shield },
  { value: 'packages', label: 'Packages', icon: Package },
  { value: 'features', label: 'Features', icon: Settings },
  { value: 'messaging_taglines', label: 'Messaging & Taglines', icon: MessageSquare },
  { value: 'campaigns', label: 'Campaigns', icon: FileText },
];

const screeningConceptCountOptions: FollowUpQuestionOption[] = Array.from({ length: 6 }, (_, i) => ({
  value: (i + 5).toString(),
  label: (i + 5).toString(),
})); // 5-10

const diveCompareConceptCountOptions: FollowUpQuestionOption[] = Array.from({ length: 4 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString(),
})); // 1-4


const commonTestFollowUpQuestions = (conceptCountOptions: FollowUpQuestionOption[]): FollowUpQuestionConfig[] => [
  {
    id: 'whatToTest',
    label: 'What are you looking to test?',
    type: 'dropdown',
    required: true,
    options: whatToTestOptions,
    // defaultValue: 'concepts', // Removed default
  },
  {
    id: 'conceptCount',
    label: 'How many concepts are you looking to test?',
    type: 'number_dropdown',
    required: true,
    options: conceptCountOptions,
    // defaultValue: conceptCountOptions[0]?.value || '1', // Removed default
  },
  {
    id: 'conceptDescription',
    label: 'Describe your concept(s) in as much detail as possible',
    type: 'textarea',
    placeholder: (answers: Record<string, string>) => {
        const whatToTest = answers['whatToTest'] || 'concept';
        const count = parseInt(answers['conceptCount'] || '1', 10);
        if (count > 1) {
            return `e.g., For ${whatToTest}: ${whatToTest.slice(0,-1)} 1: [Description of first item]. ${whatToTest.slice(0,-1)} 2: [Description of second item]. Clearly differentiate each item.`;
        }
        return `e.g., For a ${whatToTest.slice(0,-1)}: [Detailed description of the item].`;
    },
    required: true,
    defaultValue: '',
  },
  {
    id: 'stimuliUpload',
    label: 'Upload information or stimuli for your concept(s) (optional)',
    description: 'Upload your stimuli (e.g., images, documents, videos).',
    type: 'file_upload', 
    required: false,
    defaultValue: '',
    accept: 'image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt', 
  },
  {
    id: 'keyMetrics',
    label: 'What key metrics are you looking to test your concept against?',
    type: 'textarea',
    placeholder: 'e.g., Appeal, Uniqueness, Purchase Intent, Believability, Clarity',
    required: true,
    defaultValue: '',
  },
  finalContextQuestion,
];

const placeholderScreenerQuestions: SurveyQuestion[] = [
    { questionText: "How often do you use products/services in [relevant category]?", questionType: "screener", options: ["Daily (Screen In)", "Weekly (Screen In)", "Monthly", "Rarely", "Never"] },
    { questionText: "Which of these best describes your interest in [relevant topic]?", questionType: "screener", options: ["Very interested (Screen In)", "Somewhat interested", "Not very interested", "Not at all interested"] },
];
const placeholderConceptEvaluationQuestions: SurveyQuestion[] = [
    { questionText: "Overall, how appealing do you find this concept?", questionType: "scale", options: ["1 - Not at all appealing", "3 - Neutral", "5 - Very appealing"] },
    { questionText: "How unique or different is this concept compared to other similar offerings?", questionType: "scale", options: ["1 - Not at all unique", "3 - Neutral", "5 - Very unique"] },
    { questionText: "What are your initial thoughts about this concept?", questionType: "openText" },
    { questionText: "Based on this concept, how likely would you be to [desired action, e.g., purchase, use]?", questionType: "closedText", options: ["Very likely", "Somewhat likely", "Neutral", "Somewhat unlikely", "Very unlikely"] },
];
const placeholderRankingQuestion: SurveyQuestion = { questionText: "Which of the concepts you saw was most appealing?", questionType: "closedText", options: ["Concept A", "Concept B", "Concept C"] };


export const testTemplates: TestTemplate[] = [
  {
    id: 'screening',
    title: 'Screening',
    description: 'Rapidly sift through concepts (consecutive testing). Best for >5 concepts.',
    Icon: ListChecks,
    frameworkSections: [
        { title: 'Screeners: General Qualification', icon: Filter, exampleQuestions: placeholderScreenerQuestions },
        { title: 'Concept 1 Evaluation', icon: ZoomIn, exampleQuestions: placeholderConceptEvaluationQuestions.slice(0,2) }, // Shorter for screening
        { title: 'Concept 2 Evaluation', icon: ZoomIn, exampleQuestions: placeholderConceptEvaluationQuestions.slice(0,2) },
        { title: 'Concept N Evaluation...', icon: ZoomIn, exampleQuestions: [{questionText: "Evaluate subsequent concepts similarly...", questionType: "openText"}] },
        { title: 'Final Preference/Ranking', icon: GitCompareArrows, exampleQuestions: [placeholderRankingQuestion] },
    ],
    followUpQuestions: commonTestFollowUpQuestions(screeningConceptCountOptions),
    initialPromptSeed: `
You are an expert survey designer. Your task is to design a Concept Screening Test survey.
Framework: Concept Screening (Consecutive Monadic).
We are testing {whatToTest}.
Number of concepts to screen: {conceptCount}.
Concept descriptions (you must parse these into individual concepts for evaluation, e.g., "Concept 1: [desc]. Concept 2: [desc]."): {conceptDescription}.
Stimuli (if provided, e.g. filename '{stimuliUpload}'): {stimuliUpload}. These stimuli correspond to the concepts described.
Key metrics to test each concept against: {keyMetrics}.
{{#if projectBigQuestion}}
Additional Project Context / Big Question:
{{{projectBigQuestion}}}
(Use this context to further refine question phrasing, emphasis, and the overall survey flow to better meet the user's underlying research objectives.)
{{/if}}

The survey MUST be structured into the following sections. The section titles MUST BE EXACTLY as specified below.

1.  A "Screeners: General Qualification" section with general questions to qualify respondents. These questions should not reveal the specific concepts.
2.  For EACH of the {conceptCount} concepts detailed in {conceptDescription}:
    a.  A dedicated evaluation section presented consecutively. Title it "Concept N: [Brief Concept Identifier from description]". (e.g. "Concept 1: Eco-Friendly Cleaner", "Concept 2: Smart Home App"). Use your intuition to create a concise and meaningful [Brief Concept Identifier from description] based on the {conceptDescription} for that concept.
    b.  In this section, ask a few key questions (monadic evaluation, typically using 'scale' or simple 'closedText') to quickly assess this single concept against the most critical {keyMetrics}. The goal is rapid screening, so these sections should be concise (e.g., 2-3 questions per concept). Generate fresh, relevant questions based on the concept and key metrics.
    c.  If the user has entered a minor typo when describing their concept or key metrics, use your intuition to infer the correct term. Integrate this corrected term naturally into the questions.
3.  Optionally, after all concepts have been shown and rated, you may include a "Final Preference/Ranking" section if it adds value to the screening objective (e.g., "Which of the concepts you saw was most appealing?").

The \`surveyTitle\` and \`surveyIntroduction\` MUST be general and not reveal the specifics of the concepts to avoid biasing screener responses.
Adhere to the standard output schema for survey sections, questions, types, and options.
`
  },
  {
    id: 'deepDive',
    title: 'Deep dive',
    description: 'Unlock insights into individual strengths/weaknesses (monadic testing). Best for &lt;5 concepts.',
    Icon: ZoomIn,
    frameworkSections: [
        { title: 'Screeners: General Qualification', icon: Filter, exampleQuestions: placeholderScreenerQuestions },
        { title: 'Concept 1: Deep Dive Evaluation', icon: ZoomIn, exampleQuestions: placeholderConceptEvaluationQuestions },
        { title: 'Concept 2: Deep Dive Evaluation (if applicable)', icon: ZoomIn, exampleQuestions: placeholderConceptEvaluationQuestions },
    ],
    followUpQuestions: commonTestFollowUpQuestions(diveCompareConceptCountOptions),
    initialPromptSeed: `
You are an expert survey designer. Your task is to design a Monadic Deep Dive Test survey.
Framework: Monadic Deep Dive.
We are testing {whatToTest}.
Number of concepts to evaluate (each tested monadically): {conceptCount}.
Concept descriptions (you must parse these into individual concepts for evaluation, e.g., "Concept 1: [desc]. Concept 2: [desc]."): {conceptDescription}.
Stimuli (if provided, e.g. filename '{stimuliUpload}'): {stimuliUpload}. These stimuli correspond to the concepts described.
Key metrics to test each concept against: {keyMetrics}.
{{#if projectBigQuestion}}
Additional Project Context / Big Question:
{{{projectBigQuestion}}}
(Use this context to further refine question phrasing, emphasis, and the overall survey flow to better meet the user's underlying research objectives.)
{{/if}}

The survey MUST be structured into the following sections. The section titles MUST BE EXACTLY as specified below.

1.  A "Screeners: General Qualification" section with general questions to qualify respondents. These questions should not reveal the specific concepts.
2.  For EACH of the {conceptCount} concepts detailed in {conceptDescription}:
    a.  A dedicated evaluation section. Title it "Concept N: Deep Dive Evaluation". Use your intuition to replace N with the concept number (e.g., "Concept 1: Deep Dive Evaluation", "Concept 2: Deep Dive Evaluation").
    b.  In this section, ask a comprehensive set of questions (monadic evaluation) to assess this single concept against all the {keyMetrics}. Generate fresh, relevant questions using a mix of 'scale', 'closedText', and 'openText' types. This section should provide a deep understanding of the concept's strengths and weaknesses.
    c.  If the user has entered a minor typo when describing their concept or key metrics, use your intuition to infer the correct term. Integrate this corrected term naturally into the questions.
    d.  (Note: In a real monadic test run by a survey platform, a respondent would typically see only ONE such evaluation section. The survey design here should include all {conceptCount} evaluation sections for the survey designer to review and set up appropriate respondent allocation in their deployment tool.)

The \`surveyTitle\` and \`surveyIntroduction\` MUST be general and not reveal the specifics of the concepts to avoid biasing screener responses.
Adhere to the standard output schema for survey sections, questions, types, and options.
`
  },
  {
    id: 'headToHead',
    title: 'Head-to-head',
    description: 'Efficiently compare and pinpoint performers (sequential testing). Best for &lt;5 concepts.',
    Icon: GitCompareArrows,
     frameworkSections: [
        { title: 'Screeners: General Qualification', icon: Filter, exampleQuestions: placeholderScreenerQuestions },
        { title: 'Concept A Evaluation', icon: ZoomIn, exampleQuestions: placeholderConceptEvaluationQuestions },
        { title: 'Concept B Evaluation', icon: ZoomIn, exampleQuestions: placeholderConceptEvaluationQuestions },
        { title: 'Comparative Evaluation', icon: GitCompareArrows, exampleQuestions: [placeholderRankingQuestion, {questionText: "Which concept was more [Key Metric]?", questionType: "closedText", options: ["Concept A", "Concept B", "About the same"]}] },
    ],
    followUpQuestions: commonTestFollowUpQuestions(diveCompareConceptCountOptions),
    initialPromptSeed: `
You are an expert survey designer. Your task is to design a Head-to-Head Comparison Test survey.
Framework: Head-to-Head Comparison (Sequential Monadic with Comparative Section).
We are testing {whatToTest}.
Number of concepts to compare: {conceptCount}.
Concept descriptions (you must parse these into individual concepts for evaluation, e.g., "Concept A: [desc]. Concept B: [desc]."): {conceptDescription}. Use your intuition to assign short identifiers like "Concept A", "Concept B" if not explicitly provided.
Stimuli (if provided, e.g. filename '{stimuliUpload}'): {stimuliUpload}. These stimuli correspond to the concepts described.
Key metrics for comparison: {keyMetrics}.
{{#if projectBigQuestion}}
Additional Project Context / Big Question:
{{{projectBigQuestion}}}
(Use this context to further refine question phrasing, emphasis, and the overall survey flow to better meet the user's underlying research objectives.)
{{/if}}

The survey MUST be structured into the following sections. The section titles MUST BE EXACTLY as specified below.

1.  A "Screeners: General Qualification" section with general questions to qualify respondents. These questions should not reveal the specific concepts.
2.  For EACH of the {conceptCount} concepts detailed in {conceptDescription}:
    a.  A dedicated evaluation section. Title it "Evaluation of [Concept Identifier]". (e.g. "Evaluation of Concept A", "Evaluation of Slogan X").
    b.  In this section, ask questions (monadic evaluation) to assess this single concept against all the {keyMetrics}. Generate fresh, relevant questions using a mix of 'scale', 'closedText', and 'openText' types.
    c.  If the user has entered a minor typo when describing their concept or key metrics, use your intuition to infer the correct term. Integrate this corrected term naturally into the questions.
3.  A final "Comparative Evaluation" section.
    a.  The \`sectionTitle\` should be "Comparative Evaluation".
    b.  The \`sectionDescription\` could be "Now, please compare the {whatToTest} you have seen."
    c.  The \`questions\` in this section MUST directly compare all the concepts against each other. For example:
        - "Which of the {whatToTest} you saw did you prefer overall?" (options should list the concept identifiers, e.g., [Concept A, Concept B, Neither])
        - "Comparing {Concept A Identifier} and {Concept B Identifier}, which one felt more {a_key_metric}?" (options: [{Concept A Identifier}, {Concept B Identifier}, About the same, Neither]) - repeat for several key metrics.
        - Ensure these questions are appropriate for comparing {conceptCount} items. If {conceptCount} is greater than 2, a ranking question or a series of paired comparisons might be needed for some metrics. Generate fresh, relevant questions.

The \`surveyTitle\` and \`surveyIntroduction\` MUST be general and not reveal the specifics of the concepts or the comparative nature initially, to avoid biasing screener responses.
Adhere to the standard output schema for survey sections, questions, types, and options.
`
  },
];


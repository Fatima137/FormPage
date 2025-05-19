
'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest survey questions based on a description of the survey goals.
 * The output is structured into sections, each with a title, description, and a list of questions with their types.
 * It also generates a main survey title, introduction, and an estimated incidence rate with rationale and sources.
 *
 * - suggestSurveyQuestions - A function that takes a survey description and returns a survey title, introduction, structured survey sections and questions, and IR estimates.
 * - SuggestSurveyQuestionsInput - The input type for the suggestSurveyQuestions function.
 * - SurveySection - The type for a survey section.
 * - SurveyQuestion - The type for an individual survey question.
 * - SuggestSurveyQuestionsOutput - The output type for the suggestSurveyQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TimeSeriesConfigSchema = z.object({
  cadence: z.string().describe("The frequency of tracking (e.g., weekly, monthly)."),
  numWaves: z.number().describe("The total number of survey waves."),
  startDate: z.string().describe("The start date for the first wave (ISO date string)."),
  keyMetricFocus: z.array(z.string()).describe("Key metrics to focus on for tracking."),
}).optional().describe("Configuration for time-series tracking, if applicable.");


const SuggestSurveyQuestionsInputSchema = z.object({
  surveyDescription: z.string().describe('A description of the survey goals, potentially including specific template instructions like for "Explore > Themes", or implying a "Pulse" survey. This description will include the EXACT section titles to be used if a specific framework is specified.'),
  includePhotoQuestions: z.boolean().optional().describe('Whether to include photo-based questions in the survey.'),
  includeVideoQuestions: z.boolean().optional().describe('Whether to include video-based questions in the survey.'),
  timeSeriesConfig: TimeSeriesConfigSchema,
  selectedMarket: z.string().optional().describe("The target market(s) selected for the survey (e.g., 'USA', 'UK & Germany'). This will be used to help estimate the incidence rate."),
  projectContext: z.string().optional().describe('The big question behind the project or key decision the research will inform. This context helps tailor the survey.'),
});
export type SuggestSurveyQuestionsInput = z.infer<typeof SuggestSurveyQuestionsInputSchema>;

const SurveyQuestionSchema = z.object({
  questionText: z.string().describe('The full text of the survey question.'),
  questionType: z.enum(['screener', 'closedText', 'openText', 'scale', 'photo', 'video', 'stimulus'])
    .describe('The type of the question (e.g., screener, closedText for multiple choice/single select, openText for free response, scale for rating).'),
  options: z.array(z.string()).optional().describe('A list of answer options. Required for "closedText" (multiple choice options) and "scale" questions (e.g., "1 - Not at all", "5 - Very much"). Also required for "screener" questions to define qualification criteria (e.g., "Yes (Screen In)", "No"). This field should be OMITTED or be an empty array for "openText", "photo", "video", "stimulus" question types.')
});
export type SurveyQuestion = z.infer<typeof SurveyQuestionSchema>;

const SurveySectionSchema = z.object({
  sectionTitle: z.string().describe('The title of this section of the survey.'),
  sectionDescription: z.string().optional().describe('A brief description of what this section covers.'),
  questions: z.array(SurveyQuestionSchema).describe('A list of questions within this section.'),
});
export type SurveySection = z.infer<typeof SurveySectionSchema>;

const SuggestSurveyQuestionsOutputSchema = z.object({
  surveyTitle: z.string().describe("A concise and engaging title for the survey. It should be general enough not to reveal the specific topic of the survey to prevent respondents from gaming screener questions. For example, if the survey is about 'coffee preferences', a good title might be 'Share Your Beverage Opinions' or 'Quick Feedback Survey'. Max 10 words."),
  surveyIntroduction: z.string().describe("A brief (2-3 sentences) introduction for the survey respondent. This should explain the survey's purpose in general terms (e.g., 'understanding consumer opinions', 'gathering feedback on experiences'), mention roughly how long it might take, and thank them for their participation. It must be welcoming and informative, without giving away the specific survey topic."),
  surveySections: z.array(SurveySectionSchema)
    .describe('An array of survey sections, each containing a title, optional description, and a list of questions. The first section MUST be titled "Screener: Category usage" or a similar specific screener title if provided by framework (e.g. "Screener: Category purchase", "Screener: Brand awareness") and contain only "screener" type questions, UNLESS it is a "Pulse" survey. Subsequent sections should logically group questions. Ensure a mix of question types like "closedText", "openText", and "scale" questions throughout the survey for general surveys.'),
  estimatedIncidenceRate: z.number().min(0).max(100).describe("Estimated incidence rate (0-100) based on the screening questions generated and the provided market context."),
  incidenceRateRationale: z.string().describe("A brief, user-friendly explanation of how the incidence rate was estimated. This rationale must detail how the screening criteria (extracted from the generated screener questions) and the target market influenced the estimate. Max 2-4 sentences."),
  incidenceRateSources: z.array(z.string()).describe("A list of 1-3 key data sources that support the estimated IR. Prioritize direct URLs to reports, articles, or public databases. If a URL is not available, describe the source clearly (e.g., 'Internal company data on product usage for Q1 2024', 'General demographic statistics for Western Europe').")
});
export type SuggestSurveyQuestionsOutput = z.infer<typeof SuggestSurveyQuestionsOutputSchema>;


export async function suggestSurveyQuestions(
  input: SuggestSurveyQuestionsInput
): Promise<SuggestSurveyQuestionsOutput> {
  return suggestSurveyQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSurveyQuestionsPrompt',
  input: {schema: SuggestSurveyQuestionsInputSchema},
  output: {schema: SuggestSurveyQuestionsOutputSchema},
  prompt: `You are an expert survey designer.
Based on the Survey Description below, and any flags for specific question types, generate a structured survey.

Survey Description (this may contain specific framework instructions, including exact section titles to use):
{{{surveyDescription}}}

Flags:
- Include Photo Questions: {{{includePhotoQuestions}}}
- Include Video Questions: {{{includeVideoQuestions}}}
{{#if timeSeriesConfig}}
- Time Series Tracking: Enabled
  - Cadence: {{{timeSeriesConfig.cadence}}}
  - Number of Waves: {{{timeSeriesConfig.numWaves}}}
  - Start Date: {{{timeSeriesConfig.startDate}}}
  - Key Metrics: {{#each timeSeriesConfig.keyMetricFocus}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  (If Time Series Tracking is enabled, ensure some questions are suitable for repeated measurement across waves, particularly focusing on the specified Key Metrics. You may want toadd a "Key Metrics Tracking" section or integrate these into existing relevant sections.)
{{/if}}
{{#if projectContext}}
Additional Project Context / Big Question:
{{{projectContext}}}
(Use this context to further refine question phrasing, emphasis, and the overall survey flow to better meet the user's underlying research objectives.)
{{/if}}

Follow these general instructions for ALL survey generation:
1.  'surveyTitle': A concise and engaging title (max 10 words). This title MUST be general and NOT reveal the specific survey topic to prevent gaming screener questions. E.g., for a survey on 'preferences for delivery apps', a good title is 'Share Your App Usage Opinions', NOT 'Delivery App Feedback'.
2.  'surveyIntroduction': A brief (2-3 sentences) introduction. Explain the survey's purpose generally (e.g., "understanding consumer opinions"), mention its approximate length, and thank participants. It MUST NOT give away the specific survey topic. E.g., instead of "This survey is about your experience with food delivery apps", say "This survey is about your experiences with various services".
3.  'surveySections': An array of survey sections.

Each section object within 'surveySections' must have:
1.  'sectionTitle': A string for the section title. **If the Survey Description provides specific section titles as part of a framework, YOU MUST USE THOSE EXACT TITLES.**
2.  'sectionDescription': An optional string briefly describing the section.
3.  'questions': An array of question objects.

Each question object within a section must have:
1.  'questionText': The full text of the question.
    - For 'scale' questions, 'questionText' should NOT include phrases like "(1-5 scale)".
2.  'questionType': Valid types: 'screener', 'closedText', 'openText', 'scale', 'photo', 'video', 'stimulus'.
3.  'options': Optional array of strings.
    - For 'screener':
        - Provide 4-5 distinct answer options.
        - Avoid simple Yes/No. Create questions that differentiate respondents based on behaviors/frequency related to the *underlying* survey topic without revealing it.
        - Mark qualifying option(s) by appending \`(Screen In)\`. E.g., "Frequently (several times a week) (Screen In)".
    - For 'closedText': List 3-5 multiple-choice options.
    - For 'scale': List 3-7 labels for scale points (e.g., ["1 - Not at all satisfied", "2 - Dissatisfied", "3 - Neutral", "4 - Satisfied", "5 - Very Satisfied"]).
    - OMIT or use empty array for 'openText', 'photo', 'video', 'stimulus'.

Important General Rules:
- The VERY FIRST section in 'surveySections' MUST be titled "Screener: Category usage" (or a more specific screener title like "Screener: Category purchase" or "Screener: Brand awareness" IF provided in the Survey Description's framework instructions) and contain ONLY 'screener' type questions, UNLESS it is a "Pulse" survey. If the framework has multiple screener sections (e.g. "Screener: Category usage" and "Screener: Brand awareness"), list them sequentially at the beginning.
- Logically group related questions in subsequent sections.
- Aim for a variety of question types (unless specific instructions, like for Pulse, dictate otherwise).
- Each section must have at least one question.

SPECIAL INSTRUCTIONS FOR SURVEY TYPES:

IF the Survey Description implies a very short, quick feedback survey (often referred to as a "Pulse" survey, for example, if the description mentions "Pulse", "quick feedback", "seven questions", or is very concise and focused on a single, immediate topic):
- The 'surveySections' array MUST contain exactly ONE section.
- This single section MUST be titled "Quick Feedback" or a similar concise and relevant title (e.g., "Your Thoughts", "Rapid Insights").
- This section MUST contain a total of EXACTLY 7 questions:
    - Exactly 5 questions of type 'closedText'. Each 'closedText' question should have 3-5 distinct options.
    - Exactly 2 questions of type 'openText'.
- For Pulse surveys, there are NO 'screener' type questions. The single section generated is for direct feedback.
- The 'surveyTitle' and 'surveyIntroduction' should still be general, concise, and ideally not reveal the specific topic to avoid bias, even though it's a short survey.

ELSE IF the Survey Description contains instructions for a specific framework (e.g., "Explore > Themes", "Explore > Usage & experience", or "Explore > Motivations & frustrations", "Explore > Brand", "Explore > Shoppers & purchases" or similar, where the description explicitly lists the section titles and their purposes), YOU MUST ADHERE TO THAT FRAMEWORK PRECISELY.
This includes:
- Using the EXACT section titles provided in the Survey Description. This is critical. For example, if the framework specifies "Usage context: Mood", you must use that exact title.
- Following guidelines for prompted/unprompted questions within specific sections as described in the framework (e.g., not mentioning a specific theme in early sections of an "Explore > Themes" survey if the framework states so).
- Ensuring the content of questions within each section aligns with the purpose of that section as described in the framework.
- The VERY FIRST section(s) in 'surveySections' for these frameworks MUST be titled as specified (e.g., "Screener: Category usage" for many, or potentially multiple screener sections like "Screener: Category usage" followed by "Screener: Brand awareness" for the Brand template) and contain only 'screener' type questions.

IF NEITHER of the above special instructions (Pulse or specific framework like Explore > Themes) clearly apply, follow the general rules, including making the first section "Screener: Category usage" with 'screener' type questions.

IF {{{includePhotoQuestions}}} is true or {{{includeVideoQuestions}}} is true, add a final section titled "Media Questions" to the survey.
This section should include:
- If {{{includePhotoQuestions}}} is true: One or two 'photo' type questions relevant to the survey's overall goal (e.g., "Please upload a photo that represents your experience with [topic from surveyDescription].").
- If {{{includeVideoQuestions}}} is true: One or two 'video' type questions relevant to the survey's overall goal (e.g., "Please record a short video (1-2 minutes) sharing your thoughts on [topic from surveyDescription].").
Ensure these media questions are open-ended and allow for rich qualitative input. These should generally be placed towards the end of the survey.

**Incidence Rate Estimation:**
You are an expert market research analyst with extensive experience in estimating incidence rates (IR) for various target audiences and markets. You will use the latest Gemini model for this task to ensure maximum accuracy and access to real-time information.

1.  **Extract Target Audience:** Based on the "Screener" section(s) YOU HAVE DESIGNED for this survey, clearly identify the key criteria that define the target audience.
2.  **Consider Market:** The target market for this survey is: {{#if selectedMarket}}'{{{selectedMarket}}}'{{else}}'not specified (assume general/global or use surveyDescription for cues)'{{/if}}.
3.  **Estimate Incidence Rate (estimatedIncidenceRate):** Provide a numerical percentage (0-100) for the estimated IR. This estimate should reflect how common or rare the extracted target audience is within the specified market.
4.  **Explain Rationale (incidenceRateRationale):** Provide a concise (2-4 sentences) explanation for your estimated IR. This explanation MUST detail how the screening criteria (from the screeners you designed) and the target market ({{{selectedMarket}}}) influenced your estimate. Use your access to real-time information and browsing capabilities to find supporting data if possible.
5.  **Provide Supporting Sources (incidenceRateSources):** List 1-3 key data sources that support your estimated IR.
    *   If a data source is an online report, article, or publicly accessible database, YOU MUST provide a direct URL to it (e.g., "https://www.statista.com/report.pdf"). Use your browsing capabilities to find these URLs.
    *   Otherwise, describe the source clearly (e.g., "Internal company data on product usage for Q1 2024", "General demographic statistics for Western Europe from Eurostat (browsed)", "Industry benchmarks for CPG products published in Nielsen's latest report (general knowledge, confirmed via browsing common industry report providers)").
    *   Avoid generic statements like "general knowledge" unless absolutely no other source type can be reasonably cited even after attempting to browse for information.

Example of a 'screener' question (topic: coffee from cafe):
{
  "questionText": "How often do you use apps for ordering food or beverages?",
  "questionType": "screener",
  "options": [
    "Daily (Screen In)",
    "Several times a week (Screen In)",
    "Once a week",
    "Less than once a week",
    "Never"
  ]
}

Example of a 'closedText' question:
{
  "questionText": "Which of these colors do you prefer?",
  "questionType": "closedText",
  "options": ["Red", "Blue", "Green"]
}

Example of a 'scale' question:
{
  "questionText": "How satisfied are you with our service?",
  "questionType": "scale",
  "options": ["1 - Very Dissatisfied", "2 - Dissatisfied", "3 - Neutral", "4 - Satisfied", "5 - Very Satisfied"]
}

Now, generate the survey.
`,
});

const suggestSurveyQuestionsFlow = ai.defineFlow(
  {
    name: 'suggestSurveyQuestionsFlow',
    inputSchema: SuggestSurveyQuestionsInputSchema,
    outputSchema: SuggestSurveyQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure output is not null and conforms to the schema
    if (!output || !output.surveySections || !Array.isArray(output.surveySections) || !output.surveyTitle || !output.surveyIntroduction || typeof output.estimatedIncidenceRate !== 'number' || !output.incidenceRateRationale || !Array.isArray(output.incidenceRateSources)) {
        // Fallback or error handling if the AI returns unexpected data.
        return {
            surveyTitle: "Feedback Survey",
            surveyIntroduction: "Welcome to our survey. Your input is valuable and will take a few minutes.",
            surveySections: [],
            estimatedIncidenceRate: 0,
            incidenceRateRationale: "Incidence rate could not be estimated due to an unexpected issue.",
            incidenceRateSources: ["N/A"]
        };
    }
    return output;
  }
);

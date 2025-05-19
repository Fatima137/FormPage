// use server'

/**
 * @fileOverview Analyzes survey results to generate insights.
 *
 * - analyzeSurveyResults - A function that analyzes survey results and generates insights.
 * - AnalyzeSurveyResultsInput - The input type for the analyzeSurveyResults function.
 * - AnalyzeSurveyResultsOutput - The return type for the analyzeSurveyResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSurveyResultsInputSchema = z.object({
  surveyResults: z
    .string()
    .describe('The survey results data, preferably in CSV format.'),
  surveyQuestions: z
    .string()
    .describe('The survey questions corresponding to the results.'),
  desiredInsights: z
    .string()
    .describe(
      'The specific insights or analysis the user is looking for from the survey results.'
    ),
});
export type AnalyzeSurveyResultsInput = z.infer<typeof AnalyzeSurveyResultsInputSchema>;

const AnalyzeSurveyResultsOutputSchema = z.object({
  insights: z
    .string()
    .describe('The key findings and insights generated from the survey results.'),
  recommendations: z
    .string()
    .describe(
      'Recommendations based on the survey insights to improve the product or service.'
    ),
});
export type AnalyzeSurveyResultsOutput = z.infer<typeof AnalyzeSurveyResultsOutputSchema>;

export async function analyzeSurveyResults(input: AnalyzeSurveyResultsInput): Promise<AnalyzeSurveyResultsOutput> {
  return analyzeSurveyResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSurveyResultsPrompt',
  input: {schema: AnalyzeSurveyResultsInputSchema},
  output: {schema: AnalyzeSurveyResultsOutputSchema},
  prompt: `You are an expert survey analyst. You will analyze the provided survey results and generate key insights based on the user's desired insights.

Survey Questions: {{{surveyQuestions}}}
Survey Results: {{{surveyResults}}}
Desired Insights: {{{desiredInsights}}}

Based on the analysis, also provide recommendations to improve the product or service.

Ensure the insights and recommendations are clear and actionable.
`,
});

const analyzeSurveyResultsFlow = ai.defineFlow(
  {
    name: 'analyzeSurveyResultsFlow',
    inputSchema: AnalyzeSurveyResultsInputSchema,
    outputSchema: AnalyzeSurveyResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

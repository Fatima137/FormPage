'use server';
/**
 * @fileOverview Extracts structured configuration suggestions from free-text project context.
 *
 * - extractContextualConfig - A function that takes project context and returns suggested configurations.
 * - ExtractConfigInput - The input type for the extractContextualConfig function.
 * - ExtractConfigOutput - The return type for the extractContextualConfig function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractConfigInputSchema = z.object({
  projectContext: z.string().describe('The free-text project context or "big question" provided by the user.'),
});
export type ExtractConfigInput = z.infer<typeof ExtractConfigInputSchema>;

const ExtractConfigOutputSchema = z.object({
  suggestedMarkets: z.array(z.string()).optional().describe("Array of country names or regions mentioned as target markets."),
  suggestedPhoto: z.object({ 
    description: z.string().describe("A concise suggested description for a photo collection task.")
  }).optional().describe("Suggestions for photo collection if implied by the context."),
  suggestedVideo: z.object({ 
    description: z.string().describe("A concise suggested description for a video collection task.")
  }).optional().describe("Suggestions for video collection if implied by the context."),
  suggestedTimeSeries: z.object({ 
    cadence: z.string().describe("Suggested tracking cadence (e.g., 'weekly', 'monthly')."), 
    numWaves: z.number().int().min(1).describe("Suggested number of tracking waves."), 
    startDate: z.string().describe("Suggested start date in YYYY-MM-DD format, or 'Not specified'."), 
    keyMetricFocus: z.array(z.string()).describe("Array of 1-3 key metrics relevant for tracking.") 
  }).optional().describe("Suggestions for time-series tracking if implied by the context."),
});
export type ExtractConfigOutput = z.infer<typeof ExtractConfigOutputSchema>;

export async function extractContextualConfig(input: ExtractConfigInput): Promise<ExtractConfigOutput> {
  return extractContextualConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractContextualConfigPrompt',
  input: {schema: ExtractConfigInputSchema},
  output: {schema: ExtractConfigOutputSchema},
  prompt: `You are an expert assistant skilled at extracting structured configuration details from free-text project descriptions.
Analyze the following project context:
"{{{projectContext}}}"

Based ONLY on the provided project context, identify and extract the following information if explicitly mentioned or strongly implied.
If information for a field is not present, omit that field or return an empty array/undefined for it.

1.  **Suggested Markets (suggestedMarkets)**:
    *   Identify any specific countries or geographical regions mentioned as target markets.
    *   Return an array of full country names. For example, if 'UK' or 'U.K.' is mentioned, return ["United Kingdom"]. If 'US', 'USA', or 'U.S.A.' is mentioned, return ["United States"]. If 'Germany' is mentioned, return ["Germany"]. If 'Asia Pacific' or 'APAC' is mentioned, return ["Asia Pacific"].
    *   If multiple markets are mentioned (e.g., "targeting the UK and Germany"), return them as an array: ["United Kingdom", "Germany"].
    *   If no markets are mentioned, omit this field or return an empty array.

2.  **Suggested Photo Collection (suggestedPhoto)**:
    *   Determine if the project context implies a need for collecting photos from respondents (e.g., mentions "visual feedback", "show us", "share pictures of", "see their environment").
    *   If yes, provide a concise \`description\` (1-2 sentences) for what kind of photos should be collected, based on the context. Example: "Photos of their current workspace setup." or "Pictures illustrating their main frustration with the product."
    *   If no photo collection is implied, omit the \`suggestedPhoto\` field.

3.  **Suggested Video Collection (suggestedVideo)**:
    *   Determine if the project context implies a need for collecting videos from respondents (e.g., mentions "video diaries", "record their experience", "show and tell video", "user testimonials").
    *   If yes, provide a concise \`description\` (1-2 sentences) for what kind of videos should be collected. Example: "Short videos explaining their daily routine." or "Video demonstrating how they use the prototype."
    *   If no video collection is implied, omit the \`suggestedVideo\` field.

4.  **Suggested Time-Series Tracking (suggestedTimeSeries)**:
    *   Determine if the project context implies a need for tracking changes over time (e.g., mentions "longitudinal study", "track progress", "monitor trends weekly/monthly", "wave-based research", "before and after").
    *   If yes, suggest:
        *   \`cadence\`: (e.g., "weekly", "monthly", "quarterly")
        *   \`numWaves\`: A reasonable number of waves (e.g., 2, 3, 4).
        *   \`startDate\`: If a start time is hinted or makes sense (e.g. for a pre/post study around an event), provide an ISO date string (YYYY-MM-DD) for roughly one month from now. Otherwise, use "Not specified".
        *   \`keyMetricFocus\`: An array of 1-3 key metrics that seem relevant to track based on the context (e.g., ["satisfaction", "brand perception", "usage frequency"]).
    *   If no time-series tracking is implied, omit the \`suggestedTimeSeries\` field.

Your output MUST strictly conform to the Zod schema defined for ExtractConfigOutputSchema.
Ensure all field names and types in your JSON output match the schema precisely.
Omit optional fields entirely if no relevant information is found.
For \`startDate\` in \`suggestedTimeSeries\`, if a date is not specified or clearly derivable, output "Not specified".
Do not add any extra commentary or explanation outside the structured JSON output.
`,
});

const extractContextualConfigFlow = ai.defineFlow(
  {
    name: 'extractContextualConfigFlow',
    inputSchema: ExtractConfigInputSchema,
    outputSchema: ExtractConfigOutputSchema,
  },
  async (input): Promise<ExtractConfigOutput> => {
    const {output} = await prompt(input);
    if (!output) {
        // Handle cases where the AI might return null or undefined output
        return { suggestedMarkets: [] }; // Return an empty object or one with empty markets array
    }
    // Ensure all parts of the output are at least empty arrays or undefined if not present
    return {
        suggestedMarkets: output.suggestedMarkets || [],
        suggestedPhoto: output.suggestedPhoto,
        suggestedVideo: output.suggestedVideo,
        suggestedTimeSeries: output.suggestedTimeSeries ? {
            cadence: output.suggestedTimeSeries.cadence || 'Not specified',
            numWaves: output.suggestedTimeSeries.numWaves || 0,
            startDate: output.suggestedTimeSeries.startDate || 'Not specified',
            keyMetricFocus: output.suggestedTimeSeries.keyMetricFocus || []
        } : undefined,
    };
  }
);

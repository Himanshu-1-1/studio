'use server';

/**
 * @fileOverview Implements the AI-driven match score refinement for the intelligent swipe feed.
 *
 * This file defines a Genkit flow that takes an initial match score and job details,
 * enriches the job description using an LLM, and refines the match score based on the
 * enriched information.
 *
 * - refineMatchScore - The main function to refine the match score.
 * - RefineMatchScoreInput - The input type for the refineMatchScore function.
 * - RefineMatchScoreOutput - The return type for the refineMatchScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineMatchScoreInputSchema = z.object({
  initialMatchScore: z.number().describe('The initial match score (0-100).'),
  jobDescription: z.string().describe('The job description.'),
  candidateProfile: z.string().describe('The candidate profile summary.'),
});
export type RefineMatchScoreInput = z.infer<typeof RefineMatchScoreInputSchema>;

const RefineMatchScoreOutputSchema = z.object({
  refinedMatchScore: z
    .number()
    .describe('The refined match score, adjusted based on AI analysis.'),
  reasoning: z
    .string()
    .optional()
    .describe('Reasoning for refined match score adjustment.'),
});
export type RefineMatchScoreOutput = z.infer<typeof RefineMatchScoreOutputSchema>;

export async function refineMatchScore(input: RefineMatchScoreInput): Promise<RefineMatchScoreOutput> {
  return refineMatchScoreFlow(input);
}

const refineMatchScorePrompt = ai.definePrompt({
  name: 'refineMatchScorePrompt',
  input: {schema: RefineMatchScoreInputSchema},
  output: {schema: RefineMatchScoreOutputSchema},
  prompt: `You are an AI assistant specializing in job matching. Your task is to refine an initial job match score between a candidate and a job posting, given their profiles and the job description.

Instructions:
1.  Analyze the job description and candidate profile provided.
2.  Consider aspects not captured by the initial match score, such as specific skills, experience, and cultural fit.
3.  Adjust the initial match score based on your analysis. Explain the adjustment in the reasoning field.
4.  The refinedMatchScore should still be between 0 and 100.  Do not use a score of above 100 or below 0.

Job Description: {{{jobDescription}}}
Candidate Profile: {{{candidateProfile}}}
Initial Match Score: {{{initialMatchScore}}}

Output a refined match score and your reasoning.`,
});

const refineMatchScoreFlow = ai.defineFlow(
  {
    name: 'refineMatchScoreFlow',
    inputSchema: RefineMatchScoreInputSchema,
    outputSchema: RefineMatchScoreOutputSchema,
  },
  async input => {
    const {output} = await refineMatchScorePrompt(input);
    return output!;
  }
);

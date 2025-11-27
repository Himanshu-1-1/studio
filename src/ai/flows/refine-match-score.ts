'use server';

/**
 * @fileOverview Refines the initial match score of a job application using contextual information.
 *
 * This flow enhances the match score by considering additional factors beyond the initial calculation,
 * such as the candidate's overall profile strength and specific experience related to the job requirements.
 *
 * @exported refineMatchScore - The function to refine the match score.
 * @exported RefineMatchScoreInput - The input type for the refineMatchScore function.
 * @exported RefineMatchScoreOutput - The output type for the refineMatchScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineMatchScoreInputSchema = z.object({
  jobDescription: z.string().describe('The description of the job posting.'),
  candidateProfile: z.string().describe('The candidate profile summary.'),
  initialMatchScore: z.number().describe('The initial match score of the application.'),
});
export type RefineMatchScoreInput = z.infer<typeof RefineMatchScoreInputSchema>;

const RefineMatchScoreOutputSchema = z.object({
  refinedMatchScore: z.number().describe('The refined match score of the application.'),
  reasoning: z.string().describe('The reasoning behind the refined match score.'),
});
export type RefineMatchScoreOutput = z.infer<typeof RefineMatchScoreOutputSchema>;

export async function refineMatchScore(input: RefineMatchScoreInput): Promise<RefineMatchScoreOutput> {
  return refineMatchScoreFlow(input);
}

const refineMatchScorePrompt = ai.definePrompt({
  name: 'refineMatchScorePrompt',
  input: {schema: RefineMatchScoreInputSchema},
  output: {schema: RefineMatchScoreOutputSchema},
  prompt: `You are an expert recruitment assistant, specialized in refining initial job application match scores.

You will receive a job description, a candidate profile summary, and an initial match score.
Your task is to analyze these inputs and refine the initial match score based on contextual information.

Consider factors such as the candidate's overall profile strength, specific experience related to the job requirements, and any other relevant information.
Provide a refined match score and a brief explanation of your reasoning.

Job Description: {{{jobDescription}}}
Candidate Profile: {{{candidateProfile}}}
Initial Match Score: {{{initialMatchScore}}}

Refined Match Score:`,
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

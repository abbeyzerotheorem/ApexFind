'use server';

/**
 * @fileOverview AI-driven property value estimation.
 *
 * - estimatePropertyValue - A function that estimates the value of a property based on its address.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateValueInputSchema = z.object({
  address: z.string().describe('The full address of the property to be evaluated.'),
});
export type EstimateValueInput = z.infer<typeof EstimateValueInputSchema>;

const EstimateValueOutputSchema = z.object({
  estimatedValue: z.number().describe('The estimated market value of the property in NGN.'),
  confidence: z.enum(['High', 'Medium', 'Low']).describe('The confidence level of the estimate.'),
  comparablesSummary: z.string().describe('A brief summary of comparable properties or market trends used for the estimation.'),
});
export type EstimateValueOutput = z.infer<typeof EstimateValueOutputSchema>;

export async function estimatePropertyValue(input: EstimateValueInput): Promise<EstimateValueOutput> {
  return estimatePropertyValueFlow(input);
}

const prompt = ai.definePrompt({
    name: 'estimatePropertyValuePrompt',
    input: {schema: EstimateValueInputSchema},
    output: {schema: EstimateValueOutputSchema},
    prompt: `You are an expert real estate valuation AI for the Nigerian property market. 
    
    Given the following property address, provide a realistic market value estimate in Nigerian Naira (NGN).
    
    Address: {{{address}}}
    
    Base your estimate on your knowledge of the Nigerian real estate market, considering factors like location (e.g., Lagos, Abuja are high value), and general property trends. Since you don't have access to a live database, simulate a realistic valuation. For example, a standard 3-bedroom flat in Lekki, Lagos might be 80-120 million NGN, while the same in Ibadan might be 25-40 million NGN.
    
    - Set a confidence level (High, Medium, or Low).
    - Provide a short summary explaining the basis of your valuation (e.g., "Based on recent sales of similar properties in the area...").
    `,
});

const estimatePropertyValueFlow = ai.defineFlow(
  {
    name: 'estimatePropertyValueFlow',
    inputSchema: EstimateValueInputSchema,
    outputSchema: EstimateValueOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

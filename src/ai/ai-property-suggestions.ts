'use server';

/**
 * @fileOverview AI-driven property and location suggestion flows.
 *
 * - suggestProperties - A function that suggests properties based on user preferences.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Property Suggestions Flow
const SuggestPropertiesInputSchema = z.object({
  userPreferences: z
    .string()
    .describe(
      'A description of the users preferences, including past behavior and stated preferences.'
    ),
  propertyFeatures: z
    .string()
    .optional()
    .describe('A list of possible property features to consider.'),
});
export type SuggestPropertiesInput = z.infer<
  typeof SuggestPropertiesInputSchema
>;

const SuggestPropertiesOutputSchema = z.object({
  suggestedProperties: z
    .string()
    .describe('A list of suggested properties based on the user preferences.'),
});
export type SuggestPropertiesOutput = z.infer<
  typeof SuggestPropertiesOutputSchema
>;

export async function suggestProperties(
  input: SuggestPropertiesInput
): Promise<SuggestPropertiesOutput> {
  return suggestPropertiesFlow(input);
}

const suggestPropertiesFlow = ai.defineFlow(
  {
    name: 'suggestPropertiesFlow',
    inputSchema: SuggestPropertiesInputSchema,
    outputSchema: SuggestPropertiesOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
      prompt: `You are an AI real estate expert. You will suggest properties to the user based on their stated preferences and behavior.

  Preferences: {{{userPreferences}}}
  Possible Property Features: {{{propertyFeatures}}}

  Suggest properties that the user might be interested in. Return as a list of properties.
  `,
      model: 'googleai/gemini-2.5-flash',
      input,
    });
    return output!;
  }
);

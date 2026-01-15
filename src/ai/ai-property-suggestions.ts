'use server';

/**
 * @fileOverview AI-driven property and location suggestion flows.
 *
 * - suggestProperties - A function that suggests properties based on user preferences.
 * - suggestLocations - A function that suggests locations based on user input.
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


// Location Suggestions (Autocomplete) Flow
const SuggestLocationsInputSchema = z.object({
  query: z.string().describe('The partial location query from the user.'),
  existingLocations: z
    .array(z.string())
    .describe('A list of all available locations to search from.'),
});
export type SuggestLocationsInput = z.infer<typeof SuggestLocationsInputSchema>;

const SuggestLocationsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'An array of location suggestions based on the user query, derived from the existing locations list.'
    ),
});
export type SuggestLocationsOutput = z.infer<
  typeof SuggestLocationsOutputSchema
>;

export async function suggestLocations(
  input: SuggestLocationsInput
): Promise<SuggestLocationsOutput> {
  return suggestLocationsFlow(input);
}

const suggestLocationsFlow = ai.defineFlow(
  {
    name: 'suggestLocationsFlow',
    inputSchema: SuggestLocationsInputSchema,
    outputSchema: SuggestLocationsOutputSchema,
  },
  async ({ query, existingLocations }) => {
    if (!query) {
      return { suggestions: [] };
    }

    const { output } = await ai.generate({
        prompt: `You are a real estate search engine autocomplete expert for Nigeria.
Your task is to provide relevant location suggestions based on a user's partial input.
Only suggest locations that are present in the provided list of existing locations.
Return up to 5 suggestions that best match the query.
If there are no matches, return an empty array.

User Query: "${query}"

Existing Locations:
- ${existingLocations.join('\n- ')}

Return the suggestions as a JSON object with a "suggestions" key containing an array of strings.
`,
        model: 'googleai/gemini-2.5-flash',
        output: { schema: SuggestLocationsOutputSchema },
    });
    
    return output!;
  }
);
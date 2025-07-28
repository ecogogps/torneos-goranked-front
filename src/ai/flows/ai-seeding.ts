'use server';

/**
 * @fileOverview This file implements the AI-assisted player seeding flow.
 *
 * - aiAssistedPlayerSeeding - A function that handles the player seeding process.
 * - AiAssistedPlayerSeedingInput - The input type for the aiAssistedPlayerSeeding function.
 * - AiAssistedPlayerSeedingOutput - The return type for the aiAssistedPlayerSeeding function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SeedingAlgorithmSchema = z.enum(['random', 'traditional', 'snake', 'sequential']);

const AiAssistedPlayerSeedingInputSchema = z.object({
  algorithm: SeedingAlgorithmSchema.describe('The algorithm to use for seeding players.'),
  playerNames: z.array(z.string()).describe('The names of the players to seed.'),
  rankingData: z
    .array(z.object({name: z.string(), ranking: z.number()}))
    .optional()
    .describe('Ranking data to be used when using the traditional or snake seeding algorithm.'),
});

export type AiAssistedPlayerSeedingInput = z.infer<typeof AiAssistedPlayerSeedingInputSchema>;

const AiAssistedPlayerSeedingOutputSchema = z.object({
  seededPlayers: z
    .array(z.string())
    .describe('The list of player names in their seeded order.'),
  explanation: z
    .string()
    .optional()
    .describe('An explanation of how the seeding was performed.'),
});

export type AiAssistedPlayerSeedingOutput = z.infer<typeof AiAssistedPlayerSeedingOutputSchema>;

export async function aiAssistedPlayerSeeding(
  input: AiAssistedPlayerSeedingInput
): Promise<AiAssistedPlayerSeedingOutput> {
  return aiAssistedPlayerSeedingFlow(input);
}

const aiAssistedPlayerSeedingPrompt = ai.definePrompt({
  name: 'aiAssistedPlayerSeedingPrompt',
  input: {schema: AiAssistedPlayerSeedingInputSchema},
  output: {schema: AiAssistedPlayerSeedingOutputSchema},
  prompt: `You are an AI assistant that helps tournament organizers seed players based on a selected algorithm.

You will receive a list of player names and a seeding algorithm.

Based on the selected algorithm, return a list of the players in their seeded order.

If the algorithm is "random", shuffle the players randomly.

If the algorithm is "traditional" or "snake", sort the players based on their ranking, if provided, and seed them accordingly.
If ranking data is unavailable return a random ordering.

If the algorithm is "sequential", maintain the original order of the players.

Here's the input:
Algorithm: {{{algorithm}}}
Player Names: {{playerNames}}
Ranking Data: {{rankingData}}

Output the seeded players and a brief explanation of the seeding process.

{{#eq algorithm "traditional"}}
If using traditional seeding, order player by ranking and put highest ranked players against the lowest ranked players.
{{/eq}}

{{#eq algorithm "snake"}}
If using snake seeding, create an order based on ranking so players of similar rank play each other.
{{/eq}}
`,
});

const aiAssistedPlayerSeedingFlow = ai.defineFlow(
  {
    name: 'aiAssistedPlayerSeedingFlow',
    inputSchema: AiAssistedPlayerSeedingInputSchema,
    outputSchema: AiAssistedPlayerSeedingOutputSchema,
  },
  async input => {
    if (input.algorithm === 'random') {
      // Shuffle the players randomly
      const shuffledPlayers = [...input.playerNames].sort(() => Math.random() - 0.5);
      return {
        seededPlayers: shuffledPlayers,
        explanation: 'The players were seeded randomly.',
      };
    } else if (input.algorithm === 'sequential') {
      // Maintain the original order of the players
      return {
        seededPlayers: input.playerNames,
        explanation: 'The players were seeded sequentially based on their original order.',
      };
    } else {
      // Traditional or snake seeding
      if (input.rankingData && input.rankingData.length > 0) {
        // Sort players based on ranking
        const sortedPlayers = [...input.rankingData].sort((a, b) => b.ranking - a.ranking);
        const sortedPlayerNames = sortedPlayers.map(player => player.name);

        return {
          seededPlayers: sortedPlayerNames,
          explanation: 'The players were seeded based on their ranking.',
        };
      } else {
        // If ranking data is not available, shuffle the players randomly
        const shuffledPlayers = [...input.playerNames].sort(() => Math.random() - 0.5);
        return {
          seededPlayers: shuffledPlayers,
          explanation: 'Ranking data was not available, so the players were seeded randomly.',
        };
      }
    }

    // const {output} = await aiAssistedPlayerSeedingPrompt(input);
    // return output!;
  }
);

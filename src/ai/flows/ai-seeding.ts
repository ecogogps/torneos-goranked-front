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

const aiAssistedPlayerSeedingFlow = ai.defineFlow(
  {
    name: 'aiAssistedPlayerSeedingFlow',
    inputSchema: AiAssistedPlayerSeedingInputSchema,
    outputSchema: AiAssistedPlayerSeedingOutputSchema,
  },
  async (input: AiAssistedPlayerSeedingInput): Promise<AiAssistedPlayerSeedingOutput> => {
    const { algorithm, playerNames, rankingData } = input;
    let seededPlayers: string[] = [...playerNames];
    let explanation = '';

    const getRankedPlayers = () => {
      if (!rankingData || rankingData.length === 0) {
        // If no ranking data, fall back to random for rank-based algorithms
        return null;
      }
      // Create a map for quick name-to-rank lookup
      const rankMap = new Map(rankingData.map(p => [p.name, p.ranking]));
      // Sort playerNames array based on the ranking data
      return [...playerNames].sort((a, b) => (rankMap.get(b) ?? 0) - (rankMap.get(a) ?? 0));
    };

    switch (algorithm) {
      case 'random':
        seededPlayers = [...playerNames].sort(() => Math.random() - 0.5);
        explanation = 'Los jugadores se han ordenado de forma aleatoria.';
        break;

      case 'sequential':
        const rankedPlayersSeq = getRankedPlayers();
        if (rankedPlayersSeq) {
            seededPlayers = rankedPlayersSeq;
            explanation = 'Los jugadores se han ordenado secuencialmente según su ranking.';
        } else {
            seededPlayers = [...playerNames]; // Keep original order if no ranking
            explanation = 'Los jugadores se han mantenido en su orden original al no disponer de ranking.';
        }
        break;
        
      case 'traditional':
        const rankedPlayersTrad = getRankedPlayers();
        if (rankedPlayersTrad) {
          const n = rankedPlayersTrad.length;
          const half = Math.ceil(n / 2);
          const topHalf = rankedPlayersTrad.slice(0, half);
          const bottomHalf = rankedPlayersTrad.slice(half).reverse();
          seededPlayers = [];
          for (let i = 0; i < half; i++) {
            seededPlayers.push(topHalf[i]);
            if (bottomHalf[i]) {
              seededPlayers.push(bottomHalf[i]);
            }
          }
          explanation = 'Siembra tradicional: los mejores jugadores se distribuyen para no enfrentarse al principio.';
        } else {
          // Fallback to random if no ranking data
          seededPlayers = [...playerNames].sort(() => Math.random() - 0.5);
          explanation = 'No hay datos de ranking, se ha realizado una siembra aleatoria.';
        }
        break;

      case 'snake':
        const rankedPlayersSnake = getRankedPlayers();
        if (rankedPlayersSnake) {
            const n = rankedPlayersSnake.length;
            const groups: string[][] = Array.from({ length: Math.ceil(n / 2) }, () => []);
            for (let i = 0; i < n; i++) {
                const groupIndex = i % 2 === 0 ? Math.floor(i / 2) : Math.floor((n - 1 - i) / 2);
                groups[groupIndex].push(rankedPlayersSnake[i]);
            }
            seededPlayers = groups.flat();
            explanation = 'Siembra de serpiente (culebrita): agrupa a jugadores con rankings cercanos.';
        } else {
            // Fallback to random if no ranking data
            seededPlayers = [...playerNames].sort(() => Math.random() - 0.5);
            explanation = 'No hay datos de ranking, se ha realizado una siembra aleatoria.';
        }
        break;
        
      default:
        seededPlayers = [...playerNames].sort(() => Math.random() - 0.5);
        explanation = 'Algoritmo no reconocido, se ha realizado una siembra aleatoria.';
    }

    return { seededPlayers, explanation };
  }
);

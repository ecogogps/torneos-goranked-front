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

const SeedingAlgorithmSchema = z.enum(['aleatorio', 'tradicional', 'secuencial']);

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
      return [...playerNames].sort((a, b) => (rankMap.get(b) ?? 0) - (rankMap.get(a) ?? 0)); // Higher rank first
    };

    switch (algorithm) {
      case 'aleatorio':
        seededPlayers = [...playerNames].sort(() => Math.random() - 0.5);
        explanation = 'Los jugadores se han ordenado de forma aleatoria.';
        break;

      case 'secuencial':
        const rankedPlayersSeq = getRankedPlayers();
        if (rankedPlayersSeq) {
            seededPlayers = rankedPlayersSeq;
            explanation = 'Los jugadores se han ordenado secuencialmente según su ranking, de mayor a menor.';
        } else {
            seededPlayers = [...playerNames]; // Keep original order if no ranking
            explanation = 'Los jugadores se han mantenido en su orden original al no disponer de ranking.';
        }
        break;
        
      case 'tradicional':
        const rankedPlayersTrad = getRankedPlayers();
        if (rankedPlayersTrad) {
          const numPlayers = rankedPlayersTrad.length;
          // In "Por Grupos" or "Eliminacion Directa", the number of "groups" for the snake seeding
          // is half the number of players. This determines the bracket structure.
          const numGroups = Math.ceil(numPlayers / 2);
          if (numGroups < 2) {
             seededPlayers = rankedPlayersTrad;
             explanation = 'No hay suficientes jugadores para aplicar la siembra de serpiente, se ordenaron por ranking.';
             break;
          }

          const groups: string[][] = Array.from({ length: numGroups }, () => []);
          let direction = 1; // 1 for forward, -1 for backward
          let groupIndex = 0;

          for (let i = 0; i < numPlayers; i++) {
              const player = rankedPlayersTrad[i];
              // The top seeds go into their own "groups" first.
              if (i < numGroups) {
                  groups[i].push(player);
              } else {
                  // Subsequent players are added in snake order.
                  const playerIndexInSecondHalf = i - numGroups;
                  const groupForPlayer = numGroups - 1 - playerIndexInSecondHalf;
                  groups[groupForPlayer].push(player);
              }
          }
          
          // Flatten the groups back into a single seeded list
          seededPlayers = groups.flat();
          explanation = 'Siembra tradicional (serpiente): los jugadores se han distribuido para equilibrar la fuerza en el cuadro.';

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

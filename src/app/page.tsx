"use client";

import { useState } from "react";
import TournamentForm from "@/components/TournamentForm";
import TournamentBanner from "@/components/TournamentBanner";
import MatchTracker from "@/components/MatchTracker";
import Podium from "@/components/Podium";
import type { Tournament, Match, Round, Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { aiAssistedPlayerSeeding, AiAssistedPlayerSeedingInput } from "@/ai/flows/ai-seeding";

type View = "form" | "match" | "podium";

const fictitiousPlayers: Player[] = [
    { name: "Participant 1", rank: 1783 },
    { name: "Participant 2", rank: 1789 },
    { name: "Participant 3", rank: 1650 },
    { name: "Participant 4", rank: 1653 },
    { name: "Participant 5", rank: 1623 },
    { name: "Participant 6", rank: 1610 },
    { name: "Participant 7", rank: 1432 },
    { name: "Participant 8", rank: 1325 },
    { name: "Participant 9", rank: 1300 },
    { name: "Participant 10", rank: 1280 },
    { name: "Participant 11", rank: 1260 },
    { name: "Participant 12", rank: 1240 },
    { name: "Participant 13", rank: 1220 },
    { name: "Participant 14", rank: 1200 },
    { name: "Participant 15", rank: 1180 },
    { name: "Participant 16", rank: 1160 },
    { name: "Participant 17", rank: 1140 },
    { name: "Participant 18", rank: 1120 },
    { name: "Participant 19", rank: 1100 },
    { name: "Participant 20", rank: 1080 },
    { name: "Participant 21", rank: 1060 },
    { name: "Participant 22", rank: 1040 },
    { name: "Participant 23", rank: 1020 },
    { name: "Participant 24", rank: 1000 },
    { name: "Participant 25", rank: 980 },
    { name: "Participant 26", rank: 960 },
    { name: "Participant 27", rank: 940 },
    { name: "Participant 28", rank: 920 },
    { name: "Participant 29", rank: 900 },
    { name: "Participant 30", rank: 880 },
    { name: "Participant 31", rank: 860 },
    { name: "Participant 32", rank: 840 },
];

// Fisher-Yates shuffle function
const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function Home() {
  const [view, setView] = useState<View>("form");
  const [tournamentData, setTournamentData] = useState<Tournament | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [seededPlayers, setSeededPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  const generateBracketRounds = (players: Player[], isRandomSeeding: boolean): Round[] => {
    let currentPlayers = [...players];
    const numPlayers = players.length;
    const rounds: Round[] = [];

    if (numPlayers < 2) return [];
    
    // Calculate the total number of matches in the first round to form a power of 2 bracket
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(numPlayers)));
    const byes = bracketSize - numPlayers;

    let roundMatches: Match[] = [];
    let playerIndex = 0;
    
    for (let i = 0; i < bracketSize / 2; i++) {
        const p1 = currentPlayers[playerIndex++];
        // Check if the opponent is a bye or a real player
        const p2 = (playerIndex <= numPlayers -1) ? currentPlayers[bracketSize - 1 - (i - (numPlayers - bracketSize/2))] : undefined;

        if(i < numPlayers - bracketSize/2){
          const p2 = currentPlayers[i + bracketSize/2];
           roundMatches.push({
            id: `m-0-${i}`,
            p1: { ...p1, score: 0, sets: [] },
            p2: { ...p2, score: 0, sets: [] },
            title: `Match ${i + 1}`,
            winner: undefined,
            table: i + 1,
            isFinished: false,
          });
        } else {
           roundMatches.push({
            id: `m-0-${i}`,
            p1: { ...p1, score: 0, sets: [] },
            p2: { name: 'BYE', score: 0, sets: [] },
            title: `Match ${i + 1}`,
            winner: p1,
            table: i + 1,
            isFinished: true,
          });
        }
    }

    // This logic handles bye distribution better for traditional seeding.
    // The top seeds play against the bottom seeds/byes.
    let firstRoundMatches: Match[] = [];
    const playersWithByes = [...currentPlayers];
    for (let i = 0; i < byes; i++) {
        playersWithByes.push({ name: 'BYE' });
    }

    for (let i = 0; i < bracketSize / 2; i++) {
        const p1 = playersWithByes[i];
        const p2 = playersWithByes[bracketSize - 1 - i];
        
        firstRoundMatches.push({
            id: `m-0-${firstRoundMatches.length}`,
            p1: { ...p1, score: 0, sets: [] },
            p2: p2.name === 'BYE' ? { name: 'BYE', score: 0, sets: [] } : { ...p2, score: 0, sets: [] },
            title: `Match ${firstRoundMatches.length + 1}`,
            winner: p2.name === 'BYE' ? p1 : (p1.name === 'BYE' ? p2 : undefined),
            table: firstRoundMatches.length + 1,
            isFinished: p1.name === 'BYE' || p2.name === 'BYE',
        });
    }


    rounds.push({ title: `Round 1`, matches: firstRoundMatches });

    let previousRoundWinners = firstRoundMatches.map(m => m.winner);
    
    while (previousRoundWinners.filter(p => p !== undefined).length > 1 || (previousRoundWinners.length > 1 && previousRoundWinners.some(p=> p === undefined))) {
      const nextRoundMatches: Match[] = [];
      const nextRoundWinners: (Player | undefined)[] = [];
      
      // Filter out BYE players from winners before creating the next round
      let actualWinners = previousRoundWinners.filter(p => p && p.name !== 'BYE') as Player[];
      let placeholders = previousRoundWinners.filter(p => p === undefined);

      if (isRandomSeeding) {
        actualWinners = shuffle(actualWinners);
      }
      
      const participantsForNextRound = [...actualWinners, ...placeholders];

      for (let i = 0; i < participantsForNextRound.length; i += 2) {
        const p1 = participantsForNextRound[i];
        const p2 = participantsForNextRound[i + 1];

        const match = {
          id: `m-${rounds.length}-${nextRoundMatches.length}`,
          p1: { name: p1?.name || `Winner Match ${Math.floor(i/2)*2 + 1}`, score: 0, sets: [], rank: p1?.rank },
          p2: { name: p2?.name || `Winner Match ${Math.floor(i/2)*2 + 2}`, score: 0, sets: [], rank: p2?.rank },
          title: `Match ${rounds.flatMap(r => r.matches).length + nextRoundMatches.length + 1}`,
          winner: undefined,
          table: nextRoundMatches.length + 1,
          isFinished: false,
        };
        
        // If there's no opponent, the player gets a bye to the next round
        if (p1 && !p2) {
          match.winner = p1;
          match.isFinished = true;
          match.p2.name = 'BYE'
        }

        nextRoundMatches.push(match);
        nextRoundWinners.push(match.winner);
      }
      
      if (nextRoundMatches.length === 0 && actualWinners.length <= 1) {
          break; // Tournament is over
      }

      const roundNumber = rounds.length + 1;
      let roundTitle = `Round ${roundNumber}`;
      if (nextRoundMatches.length === 1) roundTitle = 'Final';
      else if (nextRoundMatches.length === 2) roundTitle = 'Semi-Finals';
      else if (nextRoundMatches.length <= 4) roundTitle = 'Quarter-Finals';

      rounds.push({ title: roundTitle, matches: nextRoundMatches });
      previousRoundWinners = nextRoundWinners;
    }

    return rounds;
  }

  const generateGroupStageAndBracket = (players: Player[], isRandomSeeding: boolean): Round[] => {
    const numPlayers = players.length;
    if (numPlayers < 4) return generateBracketRounds(players, isRandomSeeding); // Not enough for groups

    const numGroups = Math.floor(numPlayers / 2);
    const groupSize = Math.floor(numPlayers/numGroups);
    const groups: Player[][] = Array.from({ length: numGroups }, () => []);
    
    // The players are already seeded (e.g., via snake). We just distribute them into groups.
    // For snake seeding, players are ordered like [1, 8, 4, 5, 2, 7, 3, 6] for 8p/4g
    // We need to create the groups based on this order.
    // The `aiAssistedPlayerSeeding` flow with 'tradicional' returns a flat list that represents
    // the match-ups (e.g., [P1, P8, P2, P7, P3, P6, P4, P5]).
    // For group stage, we need to re-group them. The simplest way is sequential distribution
    // of the pre-seeded list.
    for (let i = 0; i < players.length; i++) {
        groups[i % numGroups].push(players[i]);
    }
    
    const groupMatches: Match[] = [];
    groups.forEach((group, index) => {
      // All-play-all within the group
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          groupMatches.push({
            id: `m-group-${groupMatches.length}`,
            p1: { ...group[i], score: 0, sets: [] },
            p2: { ...group[j], score: 0, sets: [] },
            title: `Grupo ${index + 1} - Match ${groupMatches.length + 1}`,
            winner: undefined,
            table: groupMatches.length + 1,
            isFinished: false,
          });
        }
      }
    });

    const groupRound: Round = { title: "Fase de Grupos", matches: groupMatches };
    
    // Create placeholders for the knockout stage
    // Winners from each group will advance.
    const knockoutPlayersCount = groups.filter(g => g.length > 0).length;
    const knockoutPlayers: Player[] = Array.from({ length: knockoutPlayersCount }, (_, i) => ({
      name: `Winner Group ${i + 1}`,
      rank: 0, // Rank is not relevant for placeholders
    }));
    
    const knockoutRounds = generateBracketRounds(knockoutPlayers, isRandomSeeding);
    knockoutRounds.forEach(round => {
      round.title = `Fase Final - ${round.title}`
    })

    return [groupRound, ...knockoutRounds];
  };

  
  const generateRoundRobinMatches = (players: Player[], roundsCount: number): Match[] => {
    const numPlayers = players.length;
    if (numPlayers < 2) return [];

    let allMatches: Match[] = [];
    let playerList = [...players];
    
    for (let i = 0; i < numPlayers; i++) {
      for (let j = i + 1; j < numPlayers; j++) {
        allMatches.push({
          id: `m-0-${allMatches.length}`,
          p1: { ...playerList[i], score: 0, sets: [] },
          p2: { ...playerList[j], score: 0, sets: [] },
          title: `Match ${allMatches.length + 1}`,
          winner: undefined,
          table: allMatches.length + 1,
          isFinished: false,
        });
      }
    }
    
    if (roundsCount > 1) {
      const singleRoundMatches = [...allMatches];
      for (let r = 1; r < roundsCount; r++) {
        allMatches = allMatches.concat(
          singleRoundMatches.map((m, idx) => ({ 
            ...m, 
            id: `m-${r}-${idx}`,
            title: `Match ${allMatches.length + idx + 1}`,
            table: allMatches.length + idx + 1,
          }))
        );
      }
    }

    return allMatches;
  }

  const handleCreateTournament = async (data: Tournament) => {
    setIsLoading(true);
    setTournamentData(data);
    
    const numParticipants = Number(data.numeroParticipantes) || 8;
    const initialPlayers = fictitiousPlayers.slice(0, numParticipants);

    const seedingInput: AiAssistedPlayerSeedingInput = {
      playerNames: initialPlayers.map(p => p.name),
      rankingData: initialPlayers.map(p => ({ name: p.name, ranking: p.rank || 0 })),
      algorithm: data.tipoSiembra as 'aleatorio' | 'tradicional' | 'secuencial'
    };

    try {
        const seedingResult = await aiAssistedPlayerSeeding(seedingInput);
        const finalSeededPlayers = seedingResult.seededPlayers.map(name => {
            if (name === 'BYE') return { name: 'BYE', rank: 0 };
            const originalPlayer = initialPlayers.find(p => p.name === name);
            return originalPlayer || { name, rank: 0 };
        });
        setSeededPlayers(finalSeededPlayers);
        
        const isRandomSeeding = data.tipoSiembra === 'aleatorio';

        if (data.tipoEliminacion === 'Todos contra todos') {
            const matches = generateRoundRobinMatches(finalSeededPlayers.filter(p => p.name !== 'BYE'), Number(data.numeroRondas) || 1);
            setRounds([{ title: 'Todos contra todos', matches }]);
        } else if (data.tipoEliminacion === 'Por Grupos') {
            const newRounds = generateGroupStageAndBracket(finalSeededPlayers.filter(p => p.name !== 'BYE'), isRandomSeeding);
            setRounds(newRounds);
        } else { // Eliminacion Directa
            const newRounds = generateBracketRounds(finalSeededPlayers, isRandomSeeding);
            setRounds(newRounds);
        }
        
        setView("match");
    } catch(error) {
        console.error("Failed to seed players:", error);
        const isRandomSeeding = data.tipoSiembra === 'aleatorio';
        // Fallback to simple list if AI seeding fails
        setSeededPlayers(initialPlayers);
         if (data.tipoEliminacion === 'Todos contra todos') {
            const matches = generateRoundRobinMatches(initialPlayers, Number(data.numeroRondas) || 1);
            setRounds([{ title: 'Todos contra todos', matches }]);
        } else if (data.tipoEliminacion === 'Por Grupos') {
            const newRounds = generateGroupStageAndBracket(initialPlayers, isRandomSeeding);
            setRounds(newRounds);
        } else { // Eliminacion Directa
            const newRounds = generateBracketRounds(initialPlayers, isRandomSeeding);
            setRounds(newRounds);
        }
        setView("match");
    } finally {
        setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setTournamentData(null);
    setRounds([]);
    setView("form");
  };
  
  const handleUpdateMatch = (updatedMatch: Match) => {
    const newRounds = [...rounds];
    let roundOfMatch: Round | undefined;
    let matchIndexInRound = -1;

    // Find and update the match
    for (const round of newRounds) {
        const matchIndex = round.matches.findIndex(m => m.id === updatedMatch.id);
        if (matchIndex !== -1) {
            const p1Score = Number(updatedMatch.p1.score);
            const p2Score = Number(updatedMatch.p2.score);
            const winner = p1Score > p2Score ? updatedMatch.p1 : (p2Score > p1Score ? updatedMatch.p2 : undefined);
            
            round.matches[matchIndex] = { ...updatedMatch, winner, isFinished: winner !== undefined };
            roundOfMatch = round;
            matchIndexInRound = matchIndex;
            break;
        }
    }

    if (tournamentData?.tipoEliminacion === 'Por Grupos' && roundOfMatch?.title === 'Fase de Grupos') {
        const allGroupMatchesFinished = newRounds[0].matches.every(m => m.isFinished);
        
        if (allGroupMatchesFinished) {
            const numPlayers = seededPlayers.length;
            const numGroups = Math.floor(numPlayers / 2);
            const groupSize = Math.floor(numPlayers/numGroups);
            const groups: Player[][] = Array.from({ length: numGroups }, () => []);
            
            for (let i = 0; i < seededPlayers.length; i++) {
                groups[i % numGroups].push(seededPlayers[i]);
            }

            const groupWinners: Player[] = [];
            groups.forEach((group, index) => {
                const groupPlayerNames = group.map(p => p.name);
                const matchesInGroup = newRounds[0].matches.filter(m => 
                    groupPlayerNames.includes(m.p1.name) && groupPlayerNames.includes(m.p2.name)
                );

                const playerWins: { [key: string]: number } = {};
                groupPlayerNames.forEach(name => { playerWins[name] = 0; });
                
                matchesInGroup.forEach(m => {
                    if (m.winner) {
                        playerWins[m.winner.name]++;
                    }
                });

                let winnerName = Object.keys(playerWins).reduce((a, b) => playerWins[a] > playerWins[b] ? a : b);
                const winnerPlayer = seededPlayers.find(p => p.name === winnerName) || { name: winnerName, rank: 0 };
                groupWinners.push(winnerPlayer);
            });

            // Populate the first knockout round
            if (newRounds.length > 1) {
                const firstKnockoutRound = newRounds[1];
                for (let i = 0; i < firstKnockoutRound.matches.length; i++) {
                    const match = firstKnockoutRound.matches[i];
                    if (match.p1.name.startsWith('Winner Group')) {
                       match.p1 = { ...(groupWinners[i*2] || {name: 'TBD'}), score: 0, sets: [] };
                    }
                     if (match.p2.name.startsWith('Winner Group')) {
                       match.p2 = { ...(groupWinners[i*2 + 1] || {name: 'TBD'}), score: 0, sets: [] };
                    }
                    if(match.p2.name === 'TBD' && !match.p1.name.startsWith('Winner')) {
                        match.winner = match.p1;
                        match.isFinished = true;
                    }
                }
            }
        }
    }

    // Propagate winners for any bracket-based tournament (Directa or Final phase of Por Grupos)
    if (tournamentData?.tipoEliminacion !== 'Todos contra todos') {
        for (let i = 0; i < newRounds.length - 1; i++) {
            const currentRound = newRounds[i];
            const nextRound = newRounds[i+1];

            if(currentRound.title.includes('Fase de Grupos')) continue;
            
            const isRandomSeeding = tournamentData?.tipoSiembra === 'aleatorio';
            let winners = currentRound.matches.map(m => m.winner);
            
            if (isRandomSeeding) {
              const definedWinners = winners.filter(w => w !== undefined) as Player[];
              const undefinedSlots = winners.length - definedWinners.length;
              const shuffledWinners = shuffle(definedWinners);
              winners = [...shuffledWinners, ...Array(undefinedSlots).fill(undefined)];
            }


            for (let j = 0; j < nextRound.matches.length; j++) {
                const nextMatch = nextRound.matches[j];
                const p1SourceMatchIndex = j * 2;
                const p2SourceMatchIndex = p1SourceMatchIndex + 1;
                
                const p1Winner = winners[p1SourceMatchIndex];
                const p2Winner = winners[p2SourceMatchIndex];

                if (p1Winner && (nextMatch.p1.name.startsWith('Winner') || nextMatch.p1.name === 'BYE' || nextMatch.p1.name === 'TBD')) {
                    nextMatch.p1 = {...p1Winner, score: 0, sets: []};
                }
                if (p2Winner && (nextMatch.p2.name.startsWith('Winner') || nextMatch.p2.name === 'BYE' || nextMatch.p2.name === 'TBD')) {
                    nextMatch.p2 = {...p2Winner, score: 0, sets: []};
                }

                if (!nextMatch.p1.name.startsWith('Winner') && !nextMatch.p2.name.startsWith('Winner') && nextMatch.p1.name !== 'TBD' && nextMatch.p2.name !== 'TBD' ) {
                    const p1s = Number(nextMatch.p1.score);
                    const p2s = Number(nextMatch.p2.score);
                    if(p1s > 0 || p2s > 0){
                       nextMatch.winner = p1s > p2s ? nextMatch.p1 : nextMatch.p2;
                       nextMatch.isFinished = true;
                    } else if (nextMatch.p2.name === 'BYE' && nextMatch.p1.name !== 'BYE') {
                       nextMatch.winner = nextMatch.p1;
                       nextMatch.isFinished = true;
                    } else {
                       nextMatch.winner = undefined;
                       nextMatch.isFinished = false;
                    }
                }
            }
        }
    }

    setRounds(newRounds);
};

  
  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Creando torneo...</div>
        </div>
      );
    }

    switch (view) {
      case "form":
        return <TournamentForm onSubmit={handleCreateTournament} />;
      case "match":
        return <MatchTracker 
                  tournament={tournamentData!} 
                  rounds={rounds}
                  onUpdateMatch={handleUpdateMatch}
                  seededPlayers={seededPlayers}
                />;
      case "podium":
        return <Podium tournament={tournamentData!} rounds={rounds} />;
      default:
        return <TournamentForm onSubmit={handleCreateTournament} />;
    }
  };
  
  const NavButtons = () => {
    if (view === "form" || isLoading) return null;
    
    const viewOrder: View[] = ["match", "podium"];
    const currentIndex = viewOrder.indexOf(view);

    return (
      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={() => {
            if (currentIndex > 0) {
              setView(viewOrder[currentIndex - 1]);
            } else {
              handleBackToForm();
            }
        }}>
          <ArrowLeft className="mr-2" /> Anterior
        </Button>
        {currentIndex < viewOrder.length - 1 && (
          <Button onClick={() => setView(viewOrder[currentIndex + 1])}>
            Siguiente <ArrowRight className="ml-2" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      {renderView()}
      <NavButtons />
    </main>
  );
}

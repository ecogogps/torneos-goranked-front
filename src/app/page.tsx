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

type View = "form" | "banner" | "match" | "podium";

export default function Home() {
  const [view, setView] = useState<View>("form");
  const [tournamentData, setTournamentData] = useState<Tournament | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [seededPlayers, setSeededPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  const generateBracketRounds = (players: Player[]): Round[] => {
    let currentPlayers = [...players];
    let numPlayers = players.length;
    const rounds: Round[] = [];

    if (numPlayers < 2) return [];

    let roundMatches: Match[] = [];
    for (let i = 0; i < numPlayers; i += 2) {
      const p1 = currentPlayers[i];
      const p2 = currentPlayers[i + 1];
      roundMatches.push({
        id: `m-${rounds.length}-${roundMatches.length}`,
        p1: { ...p1, score: 0, sets: [] },
        p2: { ...p2, score: 0, sets: [] },
        title: `Match ${roundMatches.length + 1}`,
        winner: undefined,
        table: roundMatches.length + 1,
        isFinished: false,
      });
    }
    rounds.push({ title: `Round 1`, matches: roundMatches });

    let previousRoundWinners = roundMatches.map(m => m.winner);
    
    while (previousRoundWinners.filter(p => p !== undefined).length > 1 || (previousRoundWinners.length > 1 && previousRoundWinners.some(p=> p === undefined))) {
      const nextRoundMatches: Match[] = [];
      const nextRoundWinners: (Player | undefined)[] = [];
      for (let i = 0; i < previousRoundWinners.length; i += 2) {
        const p1 = previousRoundWinners[i];
        const p2 = previousRoundWinners[i + 1];

        const match = {
          id: `m-${rounds.length}-${nextRoundMatches.length}`,
          p1: { name: p1?.name || `Winner Match ${Math.floor(i/2)*2 + 1}`, score: 0, sets: [], rank: p1?.rank },
          p2: { name: p2?.name || `Winner Match ${Math.floor(i/2)*2 + 2}`, score: 0, sets: [], rank: p2?.rank },
          title: `Match ${rounds.flatMap(r => r.matches).length + nextRoundMatches.length + 1}`,
          winner: undefined,
          table: nextRoundMatches.length + 1,
          isFinished: false,
        };

        nextRoundMatches.push(match);
        nextRoundWinners.push(match.winner);
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

  const generateGroupStageAndBracket = (players: Player[]): Round[] => {
    const numPlayers = players.length;
    if (numPlayers < 4) return generateBracketRounds(players); // Not enough for groups

    // This logic assumes traditional seeding where players are paired up into groups
    const groups: Player[][] = [];
    for (let i = 0; i < numPlayers; i += 2) {
      const group = [players[i]];
      if (players[i + 1]) {
        group.push(players[i+1]);
      }
      groups.push(group);
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
    const numGroups = groups.length;
    const knockoutPlayers: Player[] = Array.from({ length: numGroups }, (_, i) => ({
      name: `Winner Group ${i + 1}`,
      rank: 0,
    }));
    
    const knockoutRounds = generateBracketRounds(knockoutPlayers);
    knockoutRounds.forEach(round => {
      round.title = `Fase Final - ${round.title}`
    })

    return [groupRound, ...knockoutRounds];
  };

  
  const generateRoundRobinMatches = (players: Player[], roundsCount: number, isRandom: boolean): Match[] => {
    const numPlayers = players.length;
    if (numPlayers < 2) return [];

    let allMatches: Match[] = [];
    let playerList = [...players];
    
    // For sequential, we don't shuffle the player list.
    // For random, we do.
    if (isRandom) {
      playerList.sort(() => Math.random() - 0.5);
    }
    
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
    
    // For random, we shuffle the generated matches as well.
    if (isRandom) {
       allMatches.sort(() => Math.random() - 0.5);
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
    
    const initialPlayers = Array.from({ length: Number(data.numeroParticipantes) || 8 }, (_, i) => ({
      name: `Player ${i + 1}`,
      rank: Math.floor(1500 + Math.random() * 500)
    }));

    const seedingInput: AiAssistedPlayerSeedingInput = {
      playerNames: initialPlayers.map(p => p.name),
      rankingData: initialPlayers.map(p => ({ name: p.name, ranking: p.rank || 0 })),
      algorithm: data.tipoSiembra as 'aleatorio' | 'tradicional' | 'secuencial'
    };

    try {
        const seedingResult = await aiAssistedPlayerSeeding(seedingInput);
        const finalSeededPlayers = seedingResult.seededPlayers.map(name => {
            const originalPlayer = initialPlayers.find(p => p.name === name);
            return originalPlayer || { name, rank: 0 };
        });
        setSeededPlayers(finalSeededPlayers);

        if (data.tipoEliminacion === 'Todos contra todos') {
            const matches = generateRoundRobinMatches(finalSeededPlayers, Number(data.numeroRondas) || 1, data.tipoSiembra === 'aleatorio');
            setRounds([{ title: 'Todos contra todos', matches }]);
        } else if (data.tipoEliminacion === 'Por Grupos') {
            const newRounds = generateGroupStageAndBracket(finalSeededPlayers);
            setRounds(newRounds);
        } else { // Eliminacion Directa
            const newRounds = generateBracketRounds(finalSeededPlayers);
            setRounds(newRounds);
        }
        
        setView("banner");
    } catch(error) {
        console.error("Failed to seed players:", error);
        // Fallback to simple list if AI seeding fails
        setSeededPlayers(initialPlayers);
         if (data.tipoEliminacion === 'Todos contra todos') {
            const matches = generateRoundRobinMatches(initialPlayers, Number(data.numeroRondas) || 1, data.tipoSiembra === 'aleatorio');
            setRounds([{ title: 'Todos contra todos', matches }]);
        } else if (data.tipoEliminacion === 'Por Grupos') {
            const newRounds = generateGroupStageAndBracket(initialPlayers);
            setRounds(newRounds);
        } else { // Eliminacion Directa
            const newRounds = generateBracketRounds(initialPlayers);
            setRounds(newRounds);
        }
        setView("banner");
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
            const groupWinners: Player[] = [];
            const numPlayers = seededPlayers.length;
            const groups: Player[][] = [];
             for (let i = 0; i < numPlayers; i += 2) {
                groups.push([seededPlayers[i], seededPlayers[i+1]]);
            }

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
                    if(match.p2.name === 'TBD') {
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

            for (let j = 0; j < nextRound.matches.length; j++) {
                const nextMatch = nextRound.matches[j];
                const p1SourceMatchIndex = j * 2;
                const p2SourceMatchIndex = p1SourceMatchIndex + 1;
                
                const p1Winner = currentRound.matches[p1SourceMatchIndex]?.winner;
                const p2Winner = currentRound.matches[p2SourceMatchIndex]?.winner;

                if (p1Winner && nextMatch.p1.name.startsWith('Winner')) {
                    nextMatch.p1 = {...p1Winner, score: 0, sets: []};
                }
                if (p2Winner && nextMatch.p2.name.startsWith('Winner')) {
                    nextMatch.p2 = {...p2Winner, score: 0, sets: []};
                }

                if (!nextMatch.p1.name.startsWith('Winner') && !nextMatch.p2.name.startsWith('Winner')) {
                    const p1s = Number(nextMatch.p1.score);
                    const p2s = Number(nextMatch.p2.score);
                    if(p1s > 0 || p2s > 0){
                       nextMatch.winner = p1s > p2s ? nextMatch.p1 : nextMatch.p2;
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
      case "banner":
        return <TournamentBanner tournament={tournamentData!} />;
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
    
    const viewOrder: View[] = ["banner", "match", "podium"];
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

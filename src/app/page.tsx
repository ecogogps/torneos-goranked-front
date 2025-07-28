"use client";

import { useState } from "react";
import TournamentForm from "@/components/TournamentForm";
import TournamentBanner from "@/components/TournamentBanner";
import MatchTracker from "@/components/MatchTracker";
import Podium from "@/components/Podium";
import type { Tournament, Match, Round, Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TIPO_SIEMBRA_OPTIONS } from "@/lib/constants";
import { aiAssistedPlayerSeeding, AiAssistedPlayerSeedingInput } from "@/ai/flows/ai-seeding";

type View = "form" | "banner" | "match" | "podium";

export default function Home() {
  const [view, setView] = useState<View>("form");
  const [tournamentData, setTournamentData] = useState<Tournament | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [seededPlayers, setSeededPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  const generateBracketRounds = (players: Player[]): Round[] => {
    const numPlayers = players.length;
    let rounds: Round[] = [];
    let currentPlayers = [...players];

    // Create initial round
    let roundMatches: Match[] = [];
    if (numPlayers > 0) {
      if (numPlayers % 2 !== 0) {
        currentPlayers.push({ name: 'BYE', rank: 0 });
      }
      for (let i = 0; i < currentPlayers.length; i += 2) {
        roundMatches.push({
          id: `m-${rounds.length}-${roundMatches.length}`,
          p1: { ...currentPlayers[i], score: 0, sets: [] },
          p2: { ...(currentPlayers[i + 1] || { name: 'BYE', rank: 0 }), score: 0, sets: [] },
          title: `Match ${roundMatches.length + 1}`,
          winner: currentPlayers[i+1]?.name === 'BYE' ? currentPlayers[i] : (currentPlayers[i].name === 'BYE' ? currentPlayers[i+1] : undefined),
          table: i + 1,
          isFinished: currentPlayers[i+1]?.name === 'BYE' || currentPlayers[i].name === 'BYE',
        });
      }
      rounds.push({ title: `Round 1`, matches: roundMatches });
    }

    let previousRoundWinners = roundMatches.map(m => m.winner);

    while (previousRoundWinners.length > 1) {
        let nextRoundMatches: Match[] = [];
        let nextRoundWinners: (Player | undefined)[] = [];

        for (let i = 0; i < previousRoundWinners.length; i += 2) {
            const p1 = previousRoundWinners[i];
            const p2 = previousRoundWinners[i + 1];

            const match = {
                id: `m-${rounds.length}-${nextRoundMatches.length}`,
                p1: { name: p1?.name || `Winner Match ${Math.floor(i/2)*2 + 1}`, score: 0, sets: [], rank: p1?.rank },
                p2: { name: p2?.name || (p2 === undefined ? 'BYE' : `Winner Match ${Math.floor(i/2)*2 + 2}`), score: 0, sets: [], rank: p2?.rank },
                title: `Match ${rounds.flatMap(r => r.matches).length + nextRoundMatches.length + 1}`,
                winner: p2 === undefined ? p1 : (p1?.name === 'BYE' ? p2 : (p2?.name === 'BYE' ? p1 : undefined)),
                table: nextRoundMatches.length + 1,
                isFinished: p1?.name === 'BYE' || p2?.name === 'BYE' || p2 === undefined,
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
  
  const generateRoundRobinMatches = (players: Player[], roundsCount: number, isRandom: boolean): Match[] => {
    const numPlayers = players.length;
    if (numPlayers < 2) return [];

    let allMatches: Match[] = [];
    let playerList = [...players];
    
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
        } else {
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
        } else {
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

      // Update the match in its round
      for (const round of newRounds) {
        const matchIndex = round.matches.findIndex(m => m.id === updatedMatch.id);
        if (matchIndex !== -1) {
          const p1Score = Number(updatedMatch.p1.score);
          const p2Score = Number(updatedMatch.p2.score);
          const winner = p1Score > p2Score ? updatedMatch.p1 : (p2Score > p1Score ? updatedMatch.p2 : undefined);
          round.matches[matchIndex] = { ...updatedMatch, winner, isFinished: winner !== undefined };
          break;
        }
      }
      
      // Propagate winners to subsequent rounds for bracket-based tournaments
      if (tournamentData?.tipoEliminacion !== 'Todos contra todos') {
        for (let i = 0; i < newRounds.length - 1; i++) {
          const currentRound = newRounds[i];
          const nextRound = newRounds[i+1];

          // Re-evaluate all matches in the next round
          for (const nextMatch of nextRound.matches) {
              const p1SourceMatchId = parseInt(nextMatch.id.split('-')[2], 10);
              const p2SourceMatchId = p1SourceMatchId + 1;

              const p1SourceMatch = currentRound.matches.find(m => m.title === `Match ${Math.floor(parseInt(m.id.split('-')[2]))*2 + 1}`);
              const p2SourceMatch = currentRound.matches.find(m => m.title === `Match ${Math.floor(parseInt(m.id.split('-')[2]))*2 + 2}`);
              
              const p1Winner = currentRound.matches[Math.floor((parseInt(nextMatch.id.split('-')[2]))/2)*2]?.winner;
              const p2Winner = currentRound.matches[Math.floor((parseInt(nextMatch.id.split('-')[2]))/2)*2+1]?.winner;

              if(p1Winner) {
                const p1PlaceholderName = `Winner of ${currentRound.matches.find(m => m.winner?.name === p1Winner.name)?.title}`
                if (nextMatch.p1.name.startsWith('Winner')) {
                  nextMatch.p1 = {...p1Winner, score: 0, sets: []};
                }
              }
               if(p2Winner) {
                 const p2PlaceholderName = `Winner of ${currentRound.matches.find(m => m.winner?.name === p2Winner.name)?.title}`
                 if (nextMatch.p2.name.startsWith('Winner')) {
                    nextMatch.p2 = {...p2Winner, score: 0, sets: []};
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

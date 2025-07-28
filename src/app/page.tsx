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

type View = "form" | "banner" | "match" | "podium";

export default function Home() {
  const [view, setView] = useState<View>("form");
  const [tournamentData, setTournamentData] = useState<Tournament | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);

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
          isFinished: false,
        });
      }
      rounds.push({ title: `Round 1`, matches: roundMatches });
    }

    let winnersFromPreviousRound = roundMatches;
    while (winnersFromPreviousRound.length > 1) {
      let nextRoundMatches: Match[] = [];
      for (let i = 0; i < winnersFromPreviousRound.length; i += 2) {
        const p1Match = winnersFromPreviousRound[i];
        const p2Match = winnersFromPreviousRound[i+1];
        
        nextRoundMatches.push({
          id: `m-${rounds.length}-${nextRoundMatches.length}`,
          p1: { name: p1Match.winner?.name || `Winner of ${p1Match.title}`, score: 0, sets: [] },
          p2: { name: p2Match?.winner?.name || (p2Match ? `Winner of ${p2Match.title}` : 'BYE'), score: 0, sets: [] },
          title: `Match ${roundMatches.length + nextRoundMatches.length + 1}`,
          winner: undefined,
          table: nextRoundMatches.length + 1,
          isFinished: false,
        });
      }

      const roundNumber = rounds.length + 1;
      let roundTitle = `Round ${roundNumber}`;
      if (nextRoundMatches.length === 1) roundTitle = 'Final';
      else if (nextRoundMatches.length === 2) roundTitle = 'Semi-Finals';
      else if (nextRoundMatches.length <= 4 && nextRoundMatches.length > 2) roundTitle = 'Quarter-Finals';


      rounds.push({ title: roundTitle, matches: nextRoundMatches });
      winnersFromPreviousRound = nextRoundMatches;
    }
    return rounds;
  }
  
  const generateRoundRobinMatches = (players: Player[], roundsCount: number, isRandom: boolean): Match[] => {
    const numPlayers = players.length;
    if (numPlayers < 2) return [];

    let allMatches: Match[] = [];
    for (let i = 0; i < numPlayers; i++) {
      for (let j = i + 1; j < numPlayers; j++) {
        allMatches.push({
          id: `m-0-${allMatches.length}`,
          p1: { ...players[i], score: 0, sets: [] },
          p2: { ...players[j], score: 0, sets: [] },
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

  const handleCreateTournament = (data: Tournament) => {
    setTournamentData(data);
    const players = Array.from({ length: Number(data.numeroParticipantes) || 8 }, (_, i) => ({
      name: `Player ${i + 1}`,
      rank: Math.floor(1500 + Math.random() * 500)
    }));

    if (data.tipoEliminacion === 'Todos contra todos') {
        const matches = generateRoundRobinMatches(players, Number(data.numeroRondas) || 1, data.tipoSiembra === 'aleatorio');
        setRounds([{ title: 'Todos contra todos', matches }]);
    } else {
        const newRounds = generateBracketRounds(players);
        setRounds(newRounds);
    }
    
    setView("banner");
  };

  const handleBackToForm = () => {
    setTournamentData(null);
    setRounds([]);
    setView("form");
  };
  
  const handleUpdateMatch = (updatedMatch: Match) => {
      const newRounds = rounds.map(round => ({
        ...round,
        matches: round.matches.map(match => {
          if (match.id === updatedMatch.id) {
            const p1Score = Number(updatedMatch.p1.score);
            const p2Score = Number(updatedMatch.p2.score);
            const winner = p1Score > p2Score ? updatedMatch.p1 : (p2Score > p1Score ? updatedMatch.p2 : undefined);
            
            return { ...updatedMatch, winner, isFinished: p1Score > 0 || p2Score > 0 };
          }
          return match;
        }),
      }));
      
      // Propagate winner to next round
      for (let i = 0; i < newRounds.length - 1; i++) {
        for (const match of newRounds[i].matches) {
           if (match.winner) {
              for (const nextRoundMatch of newRounds[i+1].matches) {
                 if (nextRoundMatch.p1.name === `Winner of ${match.title}`) {
                    nextRoundMatch.p1.name = match.winner.name;
                    nextRoundMatch.p1.rank = match.winner.rank;
                 }
                 if (nextRoundMatch.p2.name === `Winner of ${match.title}`) {
                    nextRoundMatch.p2.name = match.winner.name;
                    nextRoundMatch.p2.rank = match.winner.rank;
                 }
              }
           }
        }
      }

      setRounds(newRounds);
  };

  const renderView = () => {
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
                />;
      case "podium":
        return <Podium tournament={tournamentData!} rounds={rounds} />;
      default:
        return <TournamentForm onSubmit={handleCreateTournament} />;
    }
  };
  
  const NavButtons = () => {
    if (view === "form") return null;
    
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

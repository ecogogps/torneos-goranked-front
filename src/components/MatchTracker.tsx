import type { Tournament } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Pencil, Save, Users, Swords, Info } from "lucide-react";
import * as React from "react";
import { TIPO_SIEMBRA_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MatchTrackerProps {
  tournament: Tournament;
}

export default function MatchTracker({ tournament }: MatchTrackerProps) {
  const isGroupStage = tournament.tipoEliminacion === 'Por Grupos';
  const isRoundRobin = tournament.tipoEliminacion === 'Todos contra todos';
  const isDirectElimination = tournament.tipoEliminacion === 'Eliminacion Directa';

  // Dummy players for demonstration
  const players = Array.from({ length: Number(tournament.numeroParticipantes) || 8 }, (_, i) => ({
    name: `Player ${i + 1}`,
    rank: Math.floor(1500 + Math.random() * 500)
  }));


  const generateRoundRobinMatches = () => {
    const numPlayers = players.length;
    if (numPlayers < 2) return [];

    let allMatches: any[] = [];
    for (let i = 0; i < numPlayers; i++) {
        for (let j = i + 1; j < numPlayers; j++) {
            allMatches.push({
                p1: { name: players[i].name, rank: players[i].rank, score: 0, sets: [] },
                p2: { name: players[j].name, rank: players[j].rank, score: 0, sets: [] },
            });
        }
    }
    
    // Shuffle matches for randomness only if seeding is 'aleatorio'
    if (tournament.tipoSiembra === 'aleatorio') {
      for (let i = allMatches.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allMatches[i], allMatches[j]] = [allMatches[j], allMatches[i]];
      }
    }

    const rounds = Number(tournament.numeroRondas) || 1;
    if (rounds > 1) {
        const singleRoundMatches = [...allMatches];
        for(let r = 1; r < rounds; r++) {
            allMatches = allMatches.concat(singleRoundMatches.map(m => ({...m}))); // Create new objects
        }
    }
    
    return allMatches;
  }
  
  const generateBracketRounds = () => {
      const numPlayers = players.length;
      let rounds = [];
      let currentPlayers = [...players];

      // Create initial round
      let roundMatches = [];
      if(numPlayers > 0) {
        if (numPlayers % 2 !== 0) {
            currentPlayers.push({ name: 'BYE', rank: 0 });
        }
        for (let i = 0; i < currentPlayers.length; i += 2) {
            roundMatches.push({ 
                p1: currentPlayers[i], 
                p2: currentPlayers[i+1] || { name: 'BYE', rank: 0 },
                title: `Match ${roundMatches.length + 1}`
            });
        }
        rounds.push({ title: `Round 1`, matches: roundMatches });
      }

      // Generate subsequent rounds
      let winners = roundMatches;
      while(winners.length > 1) {
          let nextRoundMatches = [];
          for (let i = 0; i < winners.length; i += 2) {
              nextRoundMatches.push({
                  p1: { name: `Winner of ${winners[i].title}` },
                  p2: { name: `Winner of ${winners[i+1]?.title || 'BYE'}` },
                  title: `Match ${roundMatches.length + nextRoundMatches.length + 1}`
              });
          }
          const roundNumber = rounds.length + 1;
          let roundTitle = `Round ${roundNumber}`;
          if(nextRoundMatches.length === 1) roundTitle = 'Final';
          if(nextRoundMatches.length === 2) roundTitle = 'Semi-Finals';
          if(nextRoundMatches.length <= 4) roundTitle = 'Quarter-Finals';

          rounds.push({ title: roundTitle, matches: nextRoundMatches });
          winners = nextRoundMatches;
      }
      return rounds;
  }

  const renderBrackets = () => {
    if (isRoundRobin) {
       const allMatches = generateRoundRobinMatches();
       return <RoundRobinView matches={allMatches} />;
    }

    if (isDirectElimination || isGroupStage) {
      const rounds = generateBracketRounds();
      const allMatches = rounds.flatMap(round => round.matches.map(match => ({ ...match, roundTitle: round.title })));

      return (
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><Swords />Cuadro del Torneo</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
             <Tabs defaultValue="cronograma">
              <TabsList>
                <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
                <TabsTrigger value="mesa">Mesa</TabsTrigger>
              </TabsList>
              <TabsContent value="cronograma" className="overflow-x-auto py-4">
                <div className="flex gap-4">
                  {rounds.map((round, roundIndex) => (
                    <div key={roundIndex} className="flex flex-col items-center flex-shrink-0 w-64">
                       <h3 className="text-xl font-bold mb-4">{round.title}</h3>
                       <div className="flex flex-col gap-8 w-full">
                          {round.matches.map((match, matchIndex) => (
                             <BracketMatch key={matchIndex} match={match} matchNumber={matchIndex + 1} />
                          ))}
                       </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="mesa">
                <ResultsTableView rounds={rounds} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Desarrollo del Torneo</CardTitle>
          <CardDescription>
            TORNEO # 000236 - Siga los partidos en vivo e ingrese los resultados.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {isGroupStage && <GroupStage />}

      {renderBrackets()}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info />Manejo de Jugadores Incompletos (BYE)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Si el número de jugadores no es una potencia de 2 (e.g. 4, 8, 16, 32), el sistema creará los BYEs necesarios para completar la llave. Un BYE otorga un pase libre a la siguiente ronda.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const BracketMatch = ({ match, matchNumber }: { match: any, matchNumber: number }) => {
  return (
    <div className="bg-card border rounded-lg w-full relative">
       <div className="p-2 border-b bg-muted text-sm font-semibold">{match.title}</div>
       <div className="p-2 flex justify-between items-center">
         <span>{match.p1.name}</span>
         <Badge variant="secondary">0</Badge>
       </div>
       <div className="p-2 flex justify-between items-center border-t">
         <span>{match.p2.name}</span>
         <Badge variant="secondary">0</Badge>
       </div>
    </div>
  )
}

const GroupStage = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users />Fase de Grupos</CardTitle>
            <CardDescription>Configuración y visualización de grupos generados por siembra {TIPO_SIEMBRA_OPTIONS.find(o => o.value === 'aleatorio')?.label}.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader><CardTitle>GROUP 1</CardTitle></CardHeader>
                <CardContent className="space-y-2"><p>Participant 1</p><p>Participant 8</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>GROUP 2</CardTitle></CardHeader>
                <CardContent className="space-y-2"><p>Participant 2</p><p>Participant 7</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>GROUP 3</CardTitle></CardHeader>
                <CardContent className="space-y-2"><p>Participant 3</p><p>Participant 6</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>GROUP 4</CardTitle></CardHeader>
                <CardContent className="space-y-2"><p>Participant 4</p><p>Participant 5</p></CardContent>
            </Card>
        </CardContent>
    </Card>
)

const RoundRobinView = ({ matches }: { matches: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><Swords />Partidos (Todos contra todos)</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match, i) => (
          <Card key={`${match.p1.name}-${match.p2.name}-${i}`}>
             <CardHeader className="p-4 flex-row items-center justify-between">
                <p className="font-semibold">Match {i + 1}</p>
                <div>
                  <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><Save className="h-4 w-4" /></Button>
                </div>
             </CardHeader>
             <CardContent className="p-4 pt-0 space-y-2">
               <div className="flex justify-between items-center">
                 <span>{match.p1.name} {match.p1.rank ? `(${match.p1.rank})` : ''}</span>
                 <Badge variant={match.p1.score > match.p2.score ? "default" : "secondary"}>{match.p1.score}</Badge>
               </div>
                <div className="flex justify-between items-center">
                 <span>{match.p2.name} {match.p2.rank ? `(${match.p2.rank})` : ''}</span>
                 <Badge variant={match.p2.score > match.p1.score ? "default" : "secondary"}>{match.p2.score}</Badge>
               </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ResultsTableView = ({ rounds }: { rounds: any[] }) => {
  // Mock scores and winners for display
  const matchesWithScores = rounds.flatMap(r => r.matches).map((match, i) => ({
    ...match,
    matchNumber: i + 1,
    table: i + 1,
    p1: { ...match.p1, score: Math.floor(Math.random() * 4) },
    p2: { ...match.p2, score: Math.floor(Math.random() * 4) },
  }));

  return (
    <div className="space-y-4">
      {rounds.map((round, roundIndex) => {
        const roundMatches = matchesWithScores.filter(m => round.matches.some(rm => rm.title === m.title));
        return (
            <div key={roundIndex}>
                <h3 className="text-lg font-semibold my-2 p-2 bg-muted rounded-md">{round.title} - TORNEO #000236</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">INFORME DETALLADO</TableHead>
                            <TableHead className="w-[100px]">Mesa</TableHead>
                            <TableHead className="text-center">PARTICIPANTES</TableHead>
                            <TableHead className="w-[100px] text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roundMatches.map((match) => (
                            <TableRow key={match.matchNumber}>
                                <TableCell>Match {match.matchNumber}</TableCell>
                                <TableCell>
                                    <Select defaultValue={`Mesa #${match.table}`}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={`Mesa #${match.table}`}>Mesa #{match.table}</SelectItem>
                                            <SelectItem value="Mesa #1">Mesa #1</SelectItem>
                                            <SelectItem value="Mesa #2">Mesa #2</SelectItem>
                                            <SelectItem value="Mesa #3">Mesa #3</SelectItem>
                                            <SelectItem value="Mesa #4">Mesa #4</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {match.p1.score > match.p2.score && <div className="w-4 h-4 rounded-full bg-green-500"></div>}
                                        <Badge variant="secondary" className="text-lg">{match.p1.score}</Badge>
                                        <div className="text-right">
                                            <p>{match.p1.name}</p>
                                            <p className="text-xs text-muted-foreground">{match.p1.rank}</p>
                                        </div>
                                        <span className="mx-2 font-bold">Vs</span>
                                        <div className="text-left">
                                           <p>{match.p2.name}</p>
                                           <p className="text-xs text-muted-foreground">{match.p2.rank}</p>
                                        </div>
                                        <Badge variant="secondary" className="text-lg">{match.p2.score}</Badge>
                                        {match.p2.score > match.p1.score && <div className="w-4 h-4 rounded-full bg-green-500"></div>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon"><Save className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
      })}
    </div>
  );
};

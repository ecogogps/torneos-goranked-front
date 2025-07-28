import type { Tournament } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Pencil, Save, Users, Swords, Info } from "lucide-react";
import * as React from "react";
import { TIPO_SIEMBRA_OPTIONS } from "@/lib/constants";

interface MatchTrackerProps {
  tournament: Tournament;
}

const renderSetTable = (sets: number[]) => (
  <Table className="mt-2 text-xs">
    <TableHeader>
      <TableRow>
        {sets.map((_, i) => <TableHead key={i}>Set {i+1}</TableHead>)}
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        {sets.map((score, i) => <TableCell key={i}>{score}</TableCell>)}
      </TableRow>
    </TableBody>
  </Table>
);


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
            allMatches = allMatches.concat(singleRoundMatches);
        }
    }
    
    return allMatches;
  }

  const renderBrackets = () => {
    if (isRoundRobin) {
       const allMatches = generateRoundRobinMatches();
       return <Round title={`Partidos (Ronda Única)`} matches={allMatches} />
    }

    if (isDirectElimination || isGroupStage) {
       // Logic for knockout stages
       const round1Matches = [];
       for (let i = 0; i < players.length; i += 2) {
         if (players[i+1]) {
           round1Matches.push({ p1: players[i], p2: players[i+1], p1_score: 0, p2_score:0, sets1: [], sets2: [] });
         } else {
            // Handle BYE
            round1Matches.push({ p1: players[i], p2: { name: 'BYE', rank: 0}, p1_score: 0, p2_score:0, sets1: [], sets2: [] });
         }
       }
       // Dummy data for subsequent rounds
       const semiFinalsMatches = round1Matches.slice(0, round1Matches.length / 2).map((_, i) => ({ p1: { name: 'Winner M' + (2*i+1), rank: ''}, p2: { name: 'Winner M' + (2*i+2), rank: ''}, p1_score: 0, p2_score:0, sets1: [], sets2: [] }));
       const finalMatch = [{ p1: { name: 'Winner SF1', rank: ''}, p2: { name: 'Winner SF2', rank: ''}, p1_score: 0, p2_score:0, sets1: [], sets2: [] }];

        return (
            <>
              <Round title="Round 1" matches={round1Matches.map(m => ({ p1: {...m.p1, score: m.p1_score, sets: m.sets1}, p2: {...m.p2, score: m.p2_score, sets: m.sets2} }))} />
              <Round title="Semi-Finals" matches={semiFinalsMatches.map(m => ({ p1: {...m.p1, score: m.p1_score, sets: m.sets1}, p2: {...m.p2, score: m.p2_score, sets: m.sets2} }))} />
              <Round title="Final" matches={finalMatch.map(m => ({ p1: {...m.p1, score: m.p1_score, sets: m.sets1}, p2: {...m.p2, score: m.p2_score, sets: m.sets2} }))} isFinal />
            </>
        )
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
            Si el número de jugadores no es una potencia de 2 (4, 8, 16, 32...), el sistema creará los BYEs necesarios para completar la llave. Un BYE otorga un pase libre a la siguiente ronda.
          </p>
        </CardContent>
      </Card>
    </div>
  );
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

const Round = ({ title, matches, isFinal = false }: { title: string, matches: any[], isFinal?: boolean }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><Swords /> {title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Match</TableHead>
            <TableHead>Jugadores (Ranking)</TableHead>
            <TableHead className="text-center">Resultado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match, i) => (
            <React.Fragment key={`${match.p1.name}-${match.p2.name}-${i}`}>
              <TableRow>
                <TableCell className="font-medium">{isFinal ? 'Final Match 01' : `Match ${i + 1}`}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-between">
                    <span>{match.p1.name} {match.p1.rank ? `(${match.p1.rank})` : ''}</span>
                    <span className="text-muted-foreground mx-2">Vs</span>
                    <span>{match.p2.name} {match.p2.rank ? `(${match.p2.rank})` : ''}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={match.p1.score > match.p2.score ? "default" : "secondary"}>{match.p1.score}</Badge>
                  <span className="mx-2">-</span>
                  <Badge variant={match.p2.score > match.p1.score ? "default" : "secondary"}>{match.p2.score}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><Save className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <div className="p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">Detalle de Puntos por Set:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="font-medium">{match.p1.name}</p>
                            {renderSetTable(match.p1.sets)}
                        </div>
                        <div>
                            <p className="font-medium">{match.p2.name}</p>
                            {renderSetTable(match.p2.sets)}
                        </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

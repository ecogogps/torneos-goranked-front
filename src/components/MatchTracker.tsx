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

      <Round title="Round 1" matches={round1Matches} />
      <Round title="Semi-Finals" matches={semiFinalsMatches} />
      <Round title="Final" matches={finalMatch} isFinal />

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
            <React.Fragment key={i}>
              <TableRow>
                <TableCell className="font-medium">{isFinal ? 'Final Match 01' : `Match ${i + 1}`}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-between">
                    <span>{match.p1.name} ({match.p1.rank})</span>
                    <span className="text-muted-foreground mx-2">Vs</span>
                    <span>{match.p2.name} ({match.p2.rank})</span>
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

const round1Matches = [
    { p1: { name: 'Luis Prado', rank: 1325, score: 3, sets: [11, 8, 11, 12] }, p2: { name: 'Luis Fernando Gonzales', rank: 1650, score: 1, sets: [8, 11, 9, 10] } },
    { p1: { name: 'Walter Aguirre', rank: 1623, score: 2, sets: [11, 9, 7, 11, 8] }, p2: { name: 'Luis Nan', rank: 1783, score: 3, sets: [8, 11, 11, 9, 11] } },
    { p1: { name: 'Carlos Freire', rank: 1432, score: 2, sets: [11, 9, 11, 5, 7] }, p2: { name: 'Luis Valencia', rank: 1653, score: 3, sets: [8, 11, 9, 11, 11] } },
    { p1: { name: 'Luis Coco Rodriguez', rank: 1789, score: 3, sets: [11, 11, 9, 11] }, p2: { name: 'Jose Gomez', rank: 1610, score: 1, sets: [8, 9, 11, 9] } },
];
const semiFinalsMatches = [
    { p1: { name: 'Luis Prado', rank: 1325, score: 1, sets: [8, 11, 9, 10] }, p2: { name: 'Luis Nan', rank: 1783, score: 3, sets: [11, 8, 11, 12] } },
    { p1: { name: 'Luis Valencia', rank: 1653, score: 3, sets: [11, 9, 11, 11] }, p2: { name: 'Luis Coco Rodríguez', rank: 1789, score: 1, sets: [8, 11, 9, 9] } },
];
const finalMatch = [
    { p1: { name: 'Luis Valencia', rank: 1653, score: 3, sets: [11, 8, 11, 12] }, p2: { name: 'Luis Nan', rank: 1783, score: 1, sets: [8, 11, 9, 10] } },
];

const TIPO_SIEMBRA_OPTIONS = [
  { value: "aleatorio", label: "Aleatorio" },
  { value: "tradicional", label: "Tradicional" },
  { value: "secuencial", label: "Secuencial" },
  { value: "culebrita", label: "Culebrita" },
];

"use client";

import type { Tournament, Round, Match, Player } from "@/lib/types";
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
import { Input } from "./ui/input";


interface MatchTrackerProps {
  tournament: Tournament;
  rounds: Round[];
  onUpdateMatch: (match: Match) => void;
  seededPlayers: Player[];
}

export default function MatchTracker({ tournament, rounds, onUpdateMatch, seededPlayers }: MatchTrackerProps) {
  const isGroupStage = tournament.tipoEliminacion === 'Por Grupos';
  const isRoundRobin = tournament.tipoEliminacion === 'Todos contra todos';

  const renderBrackets = () => {
    if (isRoundRobin) {
       const allMatches = rounds.flatMap(r => r.matches);
       return <RoundRobinView matches={allMatches} onUpdateMatch={onUpdateMatch} />;
    }

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
                  <div key={round.title} className="flex flex-col items-center flex-shrink-0 w-64">
                     <h3 className="text-xl font-bold mb-4">{round.title}</h3>
                     <div className="flex flex-col gap-8 w-full">
                        {round.matches.map((match) => (
                           <BracketMatch key={match.id} match={match} />
                        ))}
                     </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="mesa">
              <ResultsTableView rounds={rounds} onUpdateMatch={onUpdateMatch}/>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
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
      
      {isGroupStage && tournament.tipoSiembra === 'tradicional' && <GroupStageView seededPlayers={seededPlayers} />}

      {renderBrackets()}

    </div>
  );
}

const BracketMatch = ({ match }: { match: Match }) => {
  return (
    <div className={cn("bg-card border rounded-lg w-full relative", { 'border-green-500': match.isFinished })}>
       <div className="p-2 border-b bg-muted text-sm font-semibold">{match.title}</div>
       <div className="p-2 flex justify-between items-center">
         <span className={cn({ 'font-bold text-primary': match.winner?.name === match.p1.name })}>{match.p1.name}</span>
         <Badge variant={match.winner?.name === match.p1.name ? "default" : "secondary"}>{match.p1.score}</Badge>
       </div>
       <div className="p-2 flex justify-between items-center border-t">
         <span className={cn({ 'font-bold text-primary': match.winner?.name === match.p2.name })}>{match.p2.name}</span>
         <Badge variant={match.winner?.name === match.p2.name ? "default" : "secondary"}>{match.p2.score}</Badge>
       </div>
    </div>
  )
}

const GroupStageView = ({ seededPlayers }: { seededPlayers: Player[] }) => {
    const numPlayers = seededPlayers.length;
    if (numPlayers === 0) return null;

    const groups: Player[][] = [];
    for (let i = 0; i < numPlayers; i += 2) {
        const group: Player[] = [seededPlayers[i]];
        if (seededPlayers[i+1]) {
            group.push(seededPlayers[i+1]);
        }
        groups.push(group);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users />Fase de Grupos</CardTitle>
                <CardDescription>Configuración y visualización de grupos generados por siembra {TIPO_SIEMBRA_OPTIONS.find(o => o.value === 'tradicional')?.label}.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {groups.map((group, index) => (
                    <Card key={index}>
                        <CardHeader><CardTitle>GROUP {index + 1}</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {group.map(player => <p key={player.name}>{player.name} {player.rank ? `(${player.rank})` : ''}</p>)}
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
    );
}

const RoundRobinView = ({ matches, onUpdateMatch }: { matches: Match[], onUpdateMatch: (match: Match) => void }) => {
  const [editingMatchId, setEditingMatchId] = React.useState<string | null>(null);
  const [currentScores, setCurrentScores] = React.useState<{ p1: number, p2: number }>({ p1: 0, p2: 0 });

  const handleEdit = (match: Match) => {
    setEditingMatchId(match.id);
    setCurrentScores({ p1: match.p1.score, p2: match.p2.score });
  };

  const handleSave = (match: Match) => {
    onUpdateMatch({
      ...match,
      p1: { ...match.p1, score: currentScores.p1 },
      p2: { ...match.p2, score: currentScores.p2 },
    });
    setEditingMatchId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Swords />Partidos (Todos contra todos)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <Card key={match.id} className={cn({'border-green-400': match.isFinished})}>
               <CardHeader className="p-4 flex-row items-center justify-between">
                  <p className="font-semibold">{match.title}</p>
                  <div>
                    {editingMatchId === match.id ? (
                       <Button variant="ghost" size="icon" onClick={() => handleSave(match)}><Save className="h-4 w-4" /></Button>
                    ) : (
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(match)}><Pencil className="h-4 w-4" /></Button>
                    )}
                  </div>
               </CardHeader>
               <CardContent className="p-4 pt-0 space-y-2">
                 <div className="flex justify-between items-center">
                   <span className={cn({'font-bold': match.winner?.name === match.p1.name})}>{match.p1.name} {match.p1.rank ? `(${match.p1.rank})` : ''}</span>
                   {editingMatchId === match.id ? (
                      <Input type="number" className="w-16 h-8" value={currentScores.p1} onChange={(e) => setCurrentScores(s => ({ ...s, p1: Number(e.target.value) }))} />
                   ) : (
                      <Badge variant={match.winner?.name === match.p1.name ? "default" : "secondary"}>{match.p1.score}</Badge>
                   )}
                 </div>
                  <div className="flex justify-between items-center">
                   <span className={cn({'font-bold': match.winner?.name === match.p2.name})}>{match.p2.name} {match.p2.rank ? `(${match.p2.rank})` : ''}</span>
                    {editingMatchId === match.id ? (
                      <Input type="number" className="w-16 h-8" value={currentScores.p2} onChange={(e) => setCurrentScores(s => ({ ...s, p2: Number(e.target.value) }))} />
                   ) : (
                      <Badge variant={match.winner?.name === match.p2.name ? "default" : "secondary"}>{match.p2.score}</Badge>
                   )}
                 </div>
               </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const ResultsTableView = ({ rounds, onUpdateMatch }: { rounds: Round[], onUpdateMatch: (match: Match) => void }) => {
  const [editingMatchId, setEditingMatchId] = React.useState<string | null>(null);
  const [currentScores, setCurrentScores] = React.useState<{ p1: number, p2: number }>({ p1: 0, p2: 0 });

  const handleEdit = (match: Match) => {
    setEditingMatchId(match.id);
    setCurrentScores({ p1: match.p1.score, p2: match.p2.score });
  };

  const handleSave = (match: Match) => {
    onUpdateMatch({
      ...match,
      p1: { ...match.p1, score: currentScores.p1 },
      p2: { ...match.p2, score: currentScores.p2 },
    });
    setEditingMatchId(null);
  };
  
  return (
    <div className="space-y-4">
      {rounds.map((round) => (
        <div key={round.title}>
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
                    {round.matches.map((match) => (
                        <TableRow key={match.id} className={cn({'bg-green-100 dark:bg-green-900/20': match.isFinished})}>
                            <TableCell>{match.title}</TableCell>
                            <TableCell>
                                <Select defaultValue={`Mesa #${match.table}`}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 16 }, (_, i) => i + 1).map(i => 
                                          <SelectItem key={i} value={`Mesa #${i}`}>Mesa #{i}</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    {match.winner?.name === match.p1.name && <div className="w-4 h-4 rounded-full bg-green-500"></div>}
                                    
                                    {editingMatchId === match.id ? (
                                      <Input type="number" className="w-16 h-8 text-lg" value={currentScores.p1} onChange={(e) => setCurrentScores(s => ({ ...s, p1: Number(e.target.value) }))} />
                                    ) : (
                                      <Badge variant="secondary" className="text-lg">{match.p1.score}</Badge>
                                    )}

                                    <div className="text-right">
                                        <p className={cn({ 'font-bold text-primary': match.winner?.name === match.p1.name })}>{match.p1.name}</p>
                                        {match.p1.rank && <p className="text-xs text-muted-foreground">{match.p1.rank}</p>}
                                    </div>
                                    <span className="mx-2 font-bold">Vs</span>
                                    <div className="text-left">
                                       <p className={cn({ 'font-bold text-primary': match.winner?.name === match.p2.name })}>{match.p2.name}</p>
                                       {match.p2.rank && <p className="text-xs text-muted-foreground">{match.p2.rank}</p>}
                                    </div>

                                    {editingMatchId === match.id ? (
                                      <Input type="number" className="w-16 h-8 text-lg" value={currentScores.p2} onChange={(e) => setCurrentScores(s => ({ ...s, p2: Number(e.target.value) }))} />
                                    ) : (
                                      <Badge variant="secondary" className="text-lg">{match.p2.score}</Badge>
                                    )}

                                    {match.winner?.name === match.p2.name && <div className="w-4 h-4 rounded-full bg-green-500"></div>}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {editingMatchId === match.id ? (
                                   <Button variant="ghost" size="icon" onClick={() => handleSave(match)}><Save className="h-4 w-4" /></Button>
                                ) : (
                                   <Button variant="ghost" size="icon" onClick={() => handleEdit(match)} disabled={match.p1.name.startsWith('Winner') || match.p2.name.startsWith('Winner')}><Pencil className="h-4 w-4" /></Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      ))}
    </div>
  );
};

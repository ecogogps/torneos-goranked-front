import type { Tournament, Round, Player } from "@/lib/types";
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
import { Button } from "./ui/button";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";

interface PodiumProps {
  tournament: Tournament;
  rounds: Round[];
}

export default function Podium({ tournament, rounds }: PodiumProps) {
  const finalStandings = useMemo(() => {
    if (!rounds || rounds.length === 0) return [];
    
    let standings: { player: Player, position: number, points: number, prize: number }[] = [];
    const allPlayers = new Map<string, Player>();

    rounds.forEach(round => {
        round.matches.forEach(match => {
            if (match.p1.name !== 'BYE') allPlayers.set(match.p1.name, match.p1);
            if (match.p2.name !== 'BYE') allPlayers.set(match.p2.name, match.p2);
        });
    });

    if (tournament.tipoEliminacion === 'Todos contra todos') {
        const playerScores: { [key: string]: number } = {};
        
        rounds[0].matches.forEach(match => {
            if (!playerScores[match.p1.name]) playerScores[match.p1.name] = 0;
            if (!playerScores[match.p2.name]) playerScores[match.p2.name] = 0;
            if (match.winner) {
                playerScores[match.winner.name]++;
            }
        });

        const sortedPlayers = Array.from(allPlayers.values()).sort((a, b) => playerScores[b.name] - playerScores[a.name]);
        standings = sortedPlayers.map((p, i) => ({
            player: p,
            position: i + 1,
            points: 36 - i * 8, // Dummy points
            prize: 123 - i * 20, // Dummy prize
        }));

    } else { // Direct Elimination or Group Stage (simplified)
        const finalRound = rounds[rounds.length - 1];
        const semiFinalRound = rounds[rounds.length - 2];
        
        const winner = finalRound?.matches[0]?.winner;
        const runnerUp = finalRound?.matches[0] ? (finalRound.matches[0].winner?.name === finalRound.matches[0].p1.name ? finalRound.matches[0].p2 : finalRound.matches[0].p1) : undefined;
        
        let thirdPlace: Player | undefined;
        let fourthPlace: Player | undefined;

        if (semiFinalRound && semiFinalRound.matches.length === 2) {
            const losers = semiFinalRound.matches.map(m => m.winner?.name === m.p1.name ? m.p2 : m.p1);
            thirdPlace = losers[0]; // Simplified: just picking one
            fourthPlace = losers[1];
        }

        if (winner) standings.push({ player: winner, position: 1, points: 36, prize: 123 });
        if (runnerUp && runnerUp.name !== 'BYE') standings.push({ player: runnerUp, position: 2, points: 24, prize: 115 });
        if (thirdPlace && thirdPlace.name !== 'BYE') standings.push({ player: thirdPlace, position: 3, points: 12, prize: 70 });
        if (fourthPlace && fourthPlace.name !== 'BYE') standings.push({ player: fourthPlace, position: 4, points: 6, prize: 67 });
    }

    return standings;
  }, [rounds, tournament.tipoEliminacion]);

  const champion = finalStandings.find(s => s.position === 1)?.player;

  return (
    <div className="space-y-8">
      <Card className="text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Resumen del Torneo "{tournament.nombreTorneo}"
          </CardTitle>
          <CardDescription>Podio y actualización de ranking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-2">
            <Trophy className="w-16 h-16 text-yellow-500" />
            <h3 className="text-2xl font-semibold">Champion</h3>
            <p className="text-4xl font-bold text-primary">{champion?.name || 'Por definir'}</p>
            {champion && (
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                Ranking: {champion.rank} <ArrowRightSmall /> {champion.rank ? champion.rank + 36 : 'N/A'} <TrendingUp className="text-green-500" />
              </p>
            )}
          </div>
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            ACTUALIZAR RANKING DEL TORNEO
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tabla de Podio Final</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Puesto</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead className="text-right">Premio ($)</TableHead>
                <TableHead className="text-right">Puntos Ranking</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finalStandings.map((playerResult, index) => (
                <TableRow key={playerResult.player.name} className={index < 3 ? 'bg-secondary' : ''}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                    {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                    {index === 2 && <Trophy className="w-5 h-5 text-yellow-700" />}
                    {playerResult.position}º Puesto
                  </TableCell>
                  <TableCell>{playerResult.player.name}</TableCell>
                  <TableCell className="text-right">${playerResult.prize.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className={`flex items-center justify-end gap-1 font-mono ${playerResult.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {playerResult.points > 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                      {playerResult.points > 0 ? `+${playerResult.points}` : playerResult.points}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

const ArrowRightSmall = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
)

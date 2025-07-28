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
import { Button } from "./ui/button";
import { Trophy, Star, TrendingUp, TrendingDown } from "lucide-react";

const finalStandings = [
  { puesto: "Primer puesto", jugador: "Luis Valencia", premio: 123, puntos: 36 },
  { puesto: "Segundo puesto", jugador: "Luis Nan", premio: 115, puntos: 24 },
  { puesto: "Tercer puesto", jugador: "Luis Coco Rodríguez", premio: 70, puntos: 12 },
  { puesto: "Cuarto puesto", jugador: "Luis Fernando Prado", premio: 67, puntos: 6 },
  { puesto: "Quinto puesto", jugador: "Walter Aguirre", premio: 39, puntos: -4 },
  { puesto: "Sexto puesto", jugador: "Carlos Freire", premio: 36, puntos: -6 },
  { puesto: "Séptimo puesto", jugador: "José Gómez", premio: 37, puntos: -12 },
  { puesto: "Octavo Puesto", jugador: "Luis Fernando Gonzales", premio: 31, puntos: -21 },
];

interface PodiumProps {
  tournament: Tournament;
}

export default function Podium({ tournament }: PodiumProps) {
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
            <p className="text-4xl font-bold text-primary">Luis Valencia</p>
            <p className="text-lg text-muted-foreground flex items-center gap-2">
              Ranking: 1653 <ArrowRightSmall /> 1689 <TrendingUp className="text-green-500" />
            </p>
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
              {finalStandings.map((player, index) => (
                <TableRow key={player.jugador} className={index < 3 ? 'bg-secondary' : ''}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                    {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                    {index === 2 && <Trophy className="w-5 h-5 text-yellow-700" />}
                    {player.puesto}
                  </TableCell>
                  <TableCell>{player.jugador}</TableCell>
                  <TableCell className="text-right">${player.premio.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className={`flex items-center justify-end gap-1 font-mono ${player.puntos > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {player.puntos > 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                      {player.puntos > 0 ? `+${player.puntos}` : player.puntos}
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

import type { Tournament } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Ticket, Award, Phone } from "lucide-react";

interface TournamentBannerProps {
  tournament: Tournament;
}

export default function TournamentBanner({ tournament }: TournamentBannerProps) {
  const formattedDate = tournament.fecha
    ? format(new Date(tournament.fecha), "EEEE dd 'de' MMMM", { locale: es })
    : "Fecha no definida";
  const formattedTime = tournament.hora || "Hora no definida";
  
  const systemInfo = `cod ${tournament.codigoTorneo} - PPH - ${tournament.modalidad} - U1800 - 60 - TODOS - RSI`;

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-2xl">
      <CardContent className="p-0">
        <div className="relative h-[400px] w-full text-white">
          <Image
            src="https://placehold.co/1200x600.png"
            alt="Fondo del torneo"
            layout="fill"
            objectFit="cover"
            className="z-0"
            data-ai-hint="abstract sport"
          />
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div className="relative z-20 p-8 flex flex-col justify-between h-full">
            <div>
              <Badge variant="secondary" className="text-lg bg-accent text-accent-foreground">{tournament.rankingDesde ? `TORNEO U-${tournament.rankingDesde}` : 'TORNEO ABIERTO'}</Badge>
              <h2 className="text-5xl font-extrabold mt-2 text-shadow-lg shadow-black/50">
                {tournament.nombreTorneo}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-lg">
              <div className="flex items-center gap-3">
                <Ticket className="w-6 h-6 text-accent" />
                <span>Costo: <span className="font-bold">$6.00</span></span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-accent" />
                <span className="capitalize">{formattedDate}</span>
              </div>
               <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-accent" />
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-accent" />
                <span>Premiación: Medallas y premios especiales</span>
              </div>
               <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-accent" />
                <span>{tournament.direccionClub} - {tournament.club}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-accent" />
                <span>{tournament.telefono}</span>
              </div>
            </div>
            <div className="text-center text-xs text-gray-300 font-mono tracking-widest pt-4 border-t border-gray-500 mt-4">
              {systemInfo}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

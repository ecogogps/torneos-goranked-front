import type { Tournament } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface TournamentBannerProps {
  tournament: Tournament;
  previewImage?: string | null;
}

export default function TournamentBanner({ tournament, previewImage }: TournamentBannerProps) {
  const systemInfo = `cod ${tournament.codigoTorneo} - PPH - ${tournament.modalidad} - U1800 - 60 - TODOS - RSI`;

  const imageSrc = previewImage || tournament.bannerImage || "https://placehold.co/1080x1080.png";

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg">
      <CardContent className="p-0">
        <div className="relative aspect-square w-full">
          <Image
            src={imageSrc}
            alt="Fondo del torneo"
            layout="fill"
            objectFit="cover"
            data-ai-hint="abstract sport"
          />
        </div>
      </CardContent>
       <CardFooter className="bg-muted/40 p-2">
        <p className="w-full text-center text-xs text-muted-foreground font-mono tracking-widest">
            {systemInfo}
        </p>
      </CardFooter>
    </Card>
  );
}

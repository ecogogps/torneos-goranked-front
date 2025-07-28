"use client";

import { useState } from "react";
import TournamentForm from "@/components/TournamentForm";
import TournamentBanner from "@/components/TournamentBanner";
import MatchTracker from "@/components/MatchTracker";
import Podium from "@/components/Podium";
import type { Tournament } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

type View = "form" | "banner" | "match" | "podium";

export default function Home() {
  const [view, setView] = useState<View>("form");
  const [tournamentData, setTournamentData] = useState<Tournament | null>(null);

  const handleCreateTournament = (data: Tournament) => {
    setTournamentData(data);
    setView("banner");
  };

  const handleBackToForm = () => {
    setTournamentData(null);
    setView("form");
  };

  const renderView = () => {
    switch (view) {
      case "form":
        return <TournamentForm onSubmit={handleCreateTournament} />;
      case "banner":
        return <TournamentBanner tournament={tournamentData!} />;
      case "match":
        return <MatchTracker tournament={tournamentData!} />;
      case "podium":
        return <Podium tournament={tournamentData!} />;
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

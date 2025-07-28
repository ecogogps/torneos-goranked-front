import { Rocket } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-card border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-primary">
            MatchPoint Manager
          </h1>
        </div>
      </div>
    </header>
  );
}

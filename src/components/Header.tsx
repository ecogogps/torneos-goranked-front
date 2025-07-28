import { Rocket } from "lucide-react";

const PingPongRacket = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6 text-primary"
  >
    <path d="M20.5 16.5c.3-1.3.3-2.7 0-4s-1.2-2.4-2.2-3.2c-2.3-1.7-5.1-1.5-7.1.3-.6.5-1.1 1.2-1.4 2" />
    <path d="M14.5 13.5c1.3.3 2.7.3 4 0" />
    <path d="m5 16 2.5 2.5" />
    <path d="M4.5 17c1.8-1.5 4-2.5 6.5-2.5" />
    <path d="M11.5 12.5c0-2.5 1.5-4.5 4-5.5" />
    <circle cx="15" cy="8" r="7" />
  </svg>
);


export default function Header() {
  return (
    <header className="bg-card border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <PingPongRacket />
          <h1 className="text-xl font-bold text-primary">
            Racket Power
          </h1>
        </div>
      </div>
    </header>
  );
}

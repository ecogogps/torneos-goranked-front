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
    <path d="m13.75 13.75 3.5 3.5" />
    <path d="M5.06 5.06c-2.3 2.3-2.3 6.07 0 8.36C7.36 15.72 11.14 15.72 13.4 13.4l3.54-3.54c.45-.45.7-1.06.7-1.7s-.25-1.25-.7-1.7c-.95-.95-2.46-.95-3.4 0L10 10" />
    <path d="M14 14.5c1 .5 2.2.5 3.2 0" />
    <path d="M20 21v-4.5" />
    <path d="M17.5 14h4" />
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

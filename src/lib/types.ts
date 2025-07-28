import { z } from "zod";

export const TournamentSchema = z.object({
  codigoTorneo: z.string(),
  pais: z.string().min(1, "País es requerido"),
  provincia: z.string().min(1, "Provincia es requerida"),
  ciudad: z.string().min(1, "Ciudad es requerida"),
  club: z.string().min(1, "Club es requerido"),
  direccionClub: z.string().min(1, "Dirección es requerida"),
  fecha: z.date({ required_error: "Fecha es requerida" }),
  hora: z.string().min(1, "Hora es requerida"),
  fechaCierreInscripciones: z.date({ required_error: "Fecha de cierre es requerida" }),
  nombreTorneo: z.string().min(1, "Nombre del torneo es requerido"),
  modalidad: z.string(),
  tipoPartidos: z.string(),
  tipoSiembra: z.string(),
  tipoEliminacion: z.string(),
  numeroParticipantes: z.string().optional(),
  numeroRondas: z.string().optional(),
  rankingDesde: z.string().optional(),
  rankingHasta: z.string().optional(),
  edadDesde: z.string().optional(),
  edadHasta: z.string().optional(),
  sexo: z.string(),
  afectaRanking: z.enum(["si", "no"]),
  sorteoSaque: z.enum(["si", "no"]),
  premio1: z.string().optional(),
  premio2: z.string().optional(),
  premio3: z.string().optional(),
  premio4: z.string().optional(),
  premio5: z.string().optional(),
  contacto: z.string().min(1, "Contacto es requerido"),
  telefono: z.string().min(1, "Teléfono es requerido"),
  ballInfo: z.string().optional(),
});

export type Tournament = z.infer<typeof TournamentSchema>;

export interface Player {
  name: string;
  rank?: number;
}

export interface PlayerResult extends Player {
    score: number;
    sets: number[];
}

export interface Match {
    id: string;
    p1: PlayerResult;
    p2: PlayerResult;
    title: string;
    winner?: Player;
    table: number;
    isFinished: boolean;
}

export interface Round {
    title: string;
    matches: Match[];
}

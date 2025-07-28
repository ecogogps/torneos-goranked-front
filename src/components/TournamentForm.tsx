"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Tournament } from "@/lib/types";
import { TournamentSchema } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MODALIDAD_OPTIONS,
  TIPO_PARTIDOS_OPTIONS,
  TIPO_SIEMBRA_OPTIONS,
  TIPO_ELIMINACION_OPTIONS,
  SEXO_OPTIONS,
  NUMERO_PARTICIPANTES_OPTIONS,
} from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Send, Rocket } from "lucide-react";

interface TournamentFormProps {
  onSubmit: (data: Tournament) => void;
}

export default function TournamentForm({ onSubmit }: TournamentFormProps) {
  const { toast } = useToast();
  const form = useForm<Tournament>({
    resolver: zodResolver(TournamentSchema),
    defaultValues: {
      codigoTorneo: "GENERADO AUTOMÁTICAMENTE",
      pais: "Ecuador",
      provincia: "Guayas",
      ciudad: "Guayaquil",
      club: "Ping Pong House",
      direccionClub: "Urdenor II",
      fecha: new Date("2026-06-28T14:30:00"),
      hora: "2:30 p.m.",
      fechaCierreInscripciones: new Date("2025-06-15T23:59:00"),
      nombreTorneo: "Los indomables",
      modalidad: "Singles",
      tipoPartidos: "al mejor de: 2 de 3 sets",
      tipoSiembra: "aleatorio",
      tipoEliminacion: "Por Grupos",
      numeroParticipantes: "8",
      numeroRondas: "1",
      rankingDesde: "U800",
      rankingHasta: "",
      edadDesde: "",
      edadHasta: "",
      sexo: "masculino",
      afectaRanking: "si",
      sorteoSaque: "si",
      premio1: "$ 100,00",
      premio2: "$ 75,00",
      premio3: "orden de comida",
      premio4: "pases de cine",
      premio5: "horas de juego",
      contacto: "Gabriel Ramos",
      telefono: "984131574",
      ballInfo: "Victa 40+",
    },
  });

  const tipoEliminacion = form.watch("tipoEliminacion");

  const getSiembraOptions = () => {
    if (tipoEliminacion === 'Todos contra todos') {
      return TIPO_SIEMBRA_OPTIONS.filter(o => o.value === 'aleatorio' || o.value === 'secuencial');
    }
    return TIPO_SIEMBRA_OPTIONS.filter(o => o.value !== 'tradicional');
  }

  function handleSendInvitations() {
    toast({
      title: "Invitaciones Enviadas",
      description: "Las invitaciones al torneo se han enviado correctamente.",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Formulario de Creación de Torneo
            </CardTitle>
            <CardDescription>
              Complete los detalles para crear un nuevo torneo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-3 gap-6 items-start">
              <FormField
                control={form.control}
                name="codigoTorneo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código del Torneo</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <FormLabel>Logo del Club</FormLabel>
                <div className="flex items-center gap-4">
                  <Image
                    src="https://placehold.co/40x40.png"
                    alt="Logo del club"
                    width={40}
                    height={40}
                    className="rounded-full"
                    data-ai-hint="logo club"
                  />
                  <span className="text-sm text-muted-foreground">
                    Tomado del perfil del club
                  </span>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <FormField name="pais" render={({ field }) => <FormItem><FormLabel>País</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
              <FormField name="provincia" render={({ field }) => <FormItem><FormLabel>Provincia</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
              <FormField name="ciudad" render={({ field }) => <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
              <FormField name="club" render={({ field }) => <FormItem><FormLabel>Club</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
              <FormField name="direccionClub" render={({ field }) => <FormItem><FormLabel>Dirección Club</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
              <FormField name="nombreTorneo" render={({ field }) => <FormItem><FormLabel>Nombre del Torneo</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
              <FormField name="fecha" render={({ field }) => <FormItem><FormLabel>Fecha</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl></FormItem>} />
              <FormField name="hora" render={({ field }) => <FormItem><FormLabel>Hora</FormLabel><FormControl><Input {...field} placeholder="hh:mm am/pm" /></FormControl></FormItem>} />
              <FormField name="fechaCierreInscripciones" render={({ field }) => <FormItem><FormLabel>Cierre de Inscripciones</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl></FormItem>} />
            </div>

            <Separator />

            {/* Tournament Parameters */}
            <h3 className="text-lg font-medium">Parámetros del Torneo</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <FormField name="modalidad" render={({ field }) => <FormItem><FormLabel>Modalidad</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{MODALIDAD_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></FormItem>} />
              <FormField name="tipoPartidos" render={({ field }) => <FormItem><FormLabel>Tipo de Partidos</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{TIPO_PARTIDOS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></FormItem>} />
              
              <FormField
                control={form.control}
                name="tipoEliminacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Eliminación</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('tipoSiembra', 'aleatorio');
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="ring-2 ring-accent">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPO_ELIMINACION_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                  control={form.control}
                  name="numeroParticipantes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Participantes</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione número" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NUMERO_PARTICIPANTES_OPTIONS.map(o => <SelectItem key={o} value={String(o)}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                        {tipoEliminacion === 'Por Grupos' && form.getValues('numeroParticipantes') && (
                        <FormDescription>
                          Se generarán {Number(form.getValues('numeroParticipantes')) / 2} grupos.
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />
              
              <FormField
                control={form.control}
                name="tipoSiembra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Siembra</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Elija orden de siembra" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getSiembraOptions().map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {tipoEliminacion === 'Todos contra todos' && (
                <FormField
                  control={form.control}
                  name="numeroRondas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Rondas</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={1}/>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <FormItem><FormLabel>Ranking</FormLabel><div className="flex gap-2 items-center"><FormControl><Input {...form.register("rankingDesde")} placeholder="Desde" /></FormControl><span>a</span><FormControl><Input {...form.register("rankingHasta")} placeholder="Hasta" /></FormControl></div></FormItem>
              <FormItem><FormLabel>Edad</FormLabel><div className="flex gap-2 items-center"><FormControl><Input {...form.register("edadDesde")} placeholder="Desde" /></FormControl><span>a</span><FormControl><Input {...form.register("edadHasta")} placeholder="Hasta" /></FormControl></div></FormItem>
              <FormField name="sexo" render={({ field }) => <FormItem><FormLabel>Sexo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{SEXO_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></FormItem>} />
            </div>

            {/* Additional Config */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormField name="afectaRanking" render={({ field }) => <FormItem><FormLabel>Afecta al ranking</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4"><FormItem><FormControl><RadioGroupItem value="si" /></FormControl><FormLabel>SI</FormLabel></FormItem><FormItem><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>NO</FormLabel></FormItem></RadioGroup></FormControl></FormItem>} />
              <FormField name="sorteoSaque" render={({ field }) => <FormItem><FormLabel>Sorteo de Saque</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4"><FormItem><FormControl><RadioGroupItem value="si" /></FormControl><FormLabel>SI</FormLabel></FormItem><FormItem><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>NO</FormLabel></FormItem></RadioGroup></FormControl></FormItem>} />
            </div>

            <Separator />
            
            {/* Prizes */}
            <h3 className="text-lg font-medium">Premios</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField name="premio1" render={({ field }) => <FormItem><FormLabel>1er Premio</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                <FormField name="premio2" render={({ field }) => <FormItem><FormLabel>2do Premio</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                <FormField name="premio3" render={({ field }) => <FormItem><FormLabel>3er Premio</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                <FormField name="premio4" render={({ field }) => <FormItem><FormLabel>4to Premio</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                <FormField name="premio5" render={({ field }) => <FormItem><FormLabel>5to Premio</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
            </div>

            <Separator />

            {/* Contact Info */}
            <h3 className="text-lg font-medium">Información de Contacto</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <FormField name="contacto" render={({ field }) => <FormItem><FormLabel>Contacto</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
              <FormField name="telefono" render={({ field }) => <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
              <FormField name="ballInfo" render={({ field }) => <FormItem><FormLabel>Ball Info</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" size="lg" onClick={handleSendInvitations}>
            <Send className="mr-2" /> ENVIAR invitaciones
          </Button>
          <Button type="submit" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Rocket className="mr-2" /> CREAR TORNEO
          </Button>
        </div>
      </form>
    </Form>
  );
}

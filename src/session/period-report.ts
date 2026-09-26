import type { GameState } from "../core/types.js";
import { getSportMatchModelStore, type MatchHomeAway } from "../simulation/match-model.js";

export interface PeriodMatch {
  date: string;
  club: string;
  opponent: string;
  homeAway: MatchHomeAway;
  homeGoals: number | null;
  awayGoals: number | null;
  participation: string;
  minutes: number;
  rating: number | null;
}
export interface PeriodReport {
  fixtures: PeriodMatch[];
  context: string[];
}

/** Read-only projection. A historical match is never re-labelled as a new one. */
export function buildPeriodReport(state: GameState, fromDate: string, toDate: string): PeriodReport {
  const rows = (getSportMatchModelStore(state)?.fixtures ?? [])
    .filter(row => row.date > fromDate && row.date <= toDate)
    .slice().sort((a, b) => a.date.localeCompare(b.date));
  const fixtures = rows.map(row => ({
    date: row.date, club: row.club, opponent: row.opponent, homeAway: row.homeAway,
    homeGoals: row.result?.homeGoals ?? null, awayGoals: row.result?.awayGoals ?? null,
    participation: row.player.injuryUnavailable ? "Baja por lesión"
      : row.player.suspensionUnavailable ? "Sancionado"
      : !row.player.calledUp ? "No convocado"
      : !row.player.appeared ? "Suplente sin minutos"
      : row.player.started ? "Titular" : "Entraste desde el banquillo",
    minutes: row.player.minutes,
    rating: typeof row.stats?.rating === "number" ? row.stats.rating : null
  }));
  const context: string[] = [];
  if (fromDate === toDate) return { fixtures, context: ["La historia se ha detenido antes de avanzar el calendario."] };
  const injury = rows.filter(row => row.player.injuryUnavailable).length;
  const suspension = rows.filter(row => row.player.suspensionUnavailable).length;
  if (injury) context.push(`La lesión te ha dejado fuera de ${injury} ${injury === 1 ? "encuentro" : "encuentros"} de este periodo.`);
  if (suspension) context.push(`Te has perdido ${suspension} ${suspension === 1 ? "encuentro" : "encuentros"} por sanción.`);
  if (rows.length) {
    const appearances = rows.filter(row => row.player.appeared).length;
    const minutes = rows.reduce((sum, row) => sum + row.player.minutes, 0);
    context.push(`Has participado en ${appearances} de ${rows.length} ${rows.length === 1 ? "partido registrado" : "partidos registrados"}: ${minutes} minutos en el campo.`);
  } else {
    const sameMonth = fromDate.slice(0, 7) === toDate.slice(0, 7);
    const month = toDate.slice(5, 7);
    context.push(sameMonth && month === "07"
      ? "Julio es tiempo de preparación: no hay partidos oficiales registrados en este tramo."
      : sameMonth && month === "06"
      ? "El calendario de liga descansa en junio. Este tramo no registra partidos oficiales."
      : "No hay partidos oficiales registrados en este periodo. El contador de apariciones se mantiene si no juegas.");
  }
  return { fixtures, context: context.slice(0, 3) };
}

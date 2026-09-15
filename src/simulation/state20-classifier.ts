import type { GameState, State20Tag } from "../core/types.js";

function num(v: unknown, fallback = 0): number { return typeof v === "number" ? v : fallback; }
function bool(v: unknown): boolean { return v === true; }

export interface State20Classification {
  tags: State20Tag[];
  primary: State20Tag;
  signature: string;
}

/**
 * Adaptador canónico 18–20 → 20–23. Las etiquetas son combinables.
 * No puntúa el éxito: describe las puertas que existen al cumplir 20.
 */
export function classifyState20(state: GameState): State20Classification {
  const tags: State20Tag[] = [];
  const role = num(state.sport.roleScore);
  const trust = state.relationships.find(r => r.npcId === "NPC_CCH_01")?.trust ?? 45;
  const market = num(state.reputation.marketHeat);
  const risk = num(state.body.risk);
  const owner = typeof state.world.ownerClub === "string" ? state.world.ownerClub : state.club;
  const loan = bool(state.flags.LOAN_ACTIVE) || owner !== state.club;
  const bigContext = bool(state.flags.BIG_CLUB) || state.club === "BIG_CLUB" || state.tier <= 2;
  const conflict = bool(state.flags.CONFLICT_EXIT) || (state.club !== "UDV" && trust < 30);
  const injury = bool(state.flags.RECOVERING_INJURY) || bool(state.flags.LONG_INJURY) || state.body.acuteInjury === true || risk >= 65;
  const abroadStrong = bool(state.flags.ABROAD_STRONG) || (bool(state.flags.ABROAD_ROUTE) && state.tier <= 2);

  if (state.club === "UDV" && role >= 60) tags.push("STATE20_HOME_STARTER");
  if (state.club === "UDV" && role >= 18 && role < 60 && trust >= 25) tags.push("STATE20_HOME_ROTATION");
  if (loan) tags.push("STATE20_LOAN");
  if (bigContext && role < 45) tags.push("STATE20_BIG_RESERVE");
  if (conflict) tags.push("STATE20_CONFLICT_EXIT");
  if ((state.tier <= 2 || abroadStrong) && market >= 42) tags.push("STATE20_EARLY_ASCENT");
  if (injury) tags.push("STATE20_INJURY_REBUILD");
  if (state.tier >= 4 || bool(state.flags.LOWER_REBUILD)) tags.push("STATE20_LOWER_REBUILD");

  if (!tags.length) {
    // Estado seguro de continuidad: una ruta intermedia nunca se interpreta como final.
    tags.push(state.club === "UDV" ? "STATE20_HOME_ROTATION" : "STATE20_LOWER_REBUILD");
  }

  // Orden primario por capacidad de alterar el próximo tramo, no por prestigio.
  const priority: State20Tag[] = [
    "STATE20_INJURY_REBUILD",
    "STATE20_CONFLICT_EXIT",
    "STATE20_LOAN",
    "STATE20_BIG_RESERVE",
    "STATE20_EARLY_ASCENT",
    "STATE20_LOWER_REBUILD",
    "STATE20_HOME_STARTER",
    "STATE20_HOME_ROTATION"
  ];
  const primary = priority.find(x => tags.includes(x)) ?? tags[0]!;
  return { tags, primary, signature: [...tags].sort().join("+") };
}

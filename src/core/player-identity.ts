export const PLAYER_ID = "PLR_001" as const;
export const LEGACY_PLAYER_DISPLAY_NAME = "Jugador";
export const PLAYER_DISPLAY_NAME_MAX_CODE_POINTS = 64;

export interface PlayerIdentity {
  id: typeof PLAYER_ID;
  displayName: string;
}

const ALLOWED_PLAYER_NAME = /^[\p{L}\p{M}](?:[\p{L}\p{M}\p{Zs}'’.-]*[\p{L}\p{M}.])?$/u;

export function normalizePlayerDisplayName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalizedSpaces = trimmed.replace(/\p{Zs}+/gu, " ");
  const length = Array.from(normalizedSpaces).length;
  if (length < 1 || length > PLAYER_DISPLAY_NAME_MAX_CODE_POINTS) return null;
  if (!ALLOWED_PLAYER_NAME.test(normalizedSpaces)) return null;
  return normalizedSpaces;
}

export function makePlayerIdentity(displayName: unknown = LEGACY_PLAYER_DISPLAY_NAME): PlayerIdentity {
  const normalized = normalizePlayerDisplayName(displayName);
  if (!normalized) throw new Error("Nombre de jugador no válido.");
  return { id: PLAYER_ID, displayName: normalized };
}

export function inspectPlayerIdentity(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "playerIdentity no es un objeto";
  const row = value as Record<string, unknown>;
  if (row.id !== PLAYER_ID) return "playerIdentity.id no es PLR_001";
  const normalized = normalizePlayerDisplayName(row.displayName);
  if (!normalized) return "playerIdentity.displayName no es un nombre válido";
  if (row.displayName !== normalized) return "playerIdentity.displayName no está en forma canónica";
  return null;
}

/**
 * Historical saves/snapshots may omit identity because schema 8 predates ID-01.
 * Upgrade is deterministic, consumes no RNG and never overwrites a persisted identity.
 */
export function ensurePlayerIdentityInPlace(state: unknown): PlayerIdentity {
  if (!state || typeof state !== "object" || Array.isArray(state)) throw new Error("Estado inválido para identidad de jugador.");
  const row = state as Record<string, unknown>;
  if (row.playerIdentity === undefined) row.playerIdentity = makePlayerIdentity();
  const issue = inspectPlayerIdentity(row.playerIdentity);
  if (issue) throw new Error(issue);
  return row.playerIdentity as PlayerIdentity;
}

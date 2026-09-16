import { npcKnows } from "./npc-knowledge.js";
import type { DataValue, GameState } from "./types.js";

function relationshipLookup(root: unknown, path: string): unknown {
  if (!path.startsWith("rel.")) return undefined;
  const [, npcId, axis] = path.split(".");
  if (!npcId || !axis || !root || typeof root !== "object") return undefined;
  const relationships = (root as Partial<GameState>).relationships;
  if (!Array.isArray(relationships)) return undefined;
  const relation = relationships.find(r => r.npcId === npcId);
  return relation ? (relation as unknown as Record<string, unknown>)[axis] : undefined;
}

function knowledgeLookup(root: unknown, path: string): unknown {
  if (!path.startsWith("know.")) return undefined;
  const [, npcId, ...factParts] = path.split(".");
  const factId = factParts.join(".");
  if (!npcId || !factId || !root || typeof root !== "object") return undefined;
  return npcKnows(root as GameState, npcId, factId);
}

export function getPath(root: unknown, path: string): unknown {
  if (path.startsWith("rel.")) return relationshipLookup(root, path);
  if (path.startsWith("know.")) return knowledgeLookup(root, path);
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, root);
}

export function setPath(root: object, path: string, value: DataValue): void {
  if (path.startsWith("know.")) throw new Error(`Knowledge paths are read-only: ${path}`);
  if (path.startsWith("rel.")) {
    const [, npcId, axis] = path.split(".");
    const relationships = (root as Partial<GameState>).relationships;
    if (!npcId || !axis || !Array.isArray(relationships)) throw new Error(`Invalid relationship path: ${path}`);
    const relation = relationships.find(r => r.npcId === npcId);
    if (!relation) throw new Error(`Unknown relationship target: ${npcId}`);
    (relation as unknown as Record<string, unknown>)[axis] = value;
    return;
  }

  const keys = path.split(".");
  let cursor = root as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!;
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[keys[keys.length - 1]!] = value;
}
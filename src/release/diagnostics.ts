export interface ReleaseBuildIdentity {
  gitSha?: string | null;
  sourceBranch?: string | null;
  engineBuild?: string | null;
  contentIdentity?: string | null;
  saveSchema?: number | null;
  sessionSchema?: number | null;
  buildVariant?: string | null;
  buildTimestamp?: string | null;
  webBundleIdentity?: string | null;
  manifestIdentity?: string | null;
  android?: {
    applicationId?: string | null;
    versionCode?: number | null;
    versionName?: string | null;
  } | null;
}

export interface ReleaseRuntimeInfo {
  platform?: string;
  androidRelease?: string;
  sdkInt?: number;
  webViewVersion?: string;
  deviceClass?: string;
  manufacturer?: string;
  model?: string;
  memoryClassMb?: number;
  locale?: string;
  orientation?: string;
}

export interface ReleaseMigrationInfo {
  status?: string;
  fromContentIdentity?: string;
  errorCode?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function text(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
function bool(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}
function rngPositions(rngState: unknown): Record<string, { draws: number | null }> {
  if (!isRecord(rngState)) return {};
  const result: Record<string, { draws: number | null }> = {};
  for (const name of ["narrative", "football", "microfeed", "qa"]) {
    const stream = rngState[name];
    if (!isRecord(stream)) continue;
    result[name] = { draws: finite(stream.draws) };
  }
  return result;
}
function allowedRuntime(runtime: ReleaseRuntimeInfo): ReleaseRuntimeInfo {
  const result: ReleaseRuntimeInfo = {};
  for (const key of [
    "platform", "androidRelease", "sdkInt", "webViewVersion", "deviceClass",
    "manufacturer", "model", "memoryClassMb", "locale", "orientation"
  ] as const) {
    const value = runtime[key];
    if (value !== undefined) (result as Record<string, unknown>)[key] = value;
  }
  return result;
}

/**
 * Builds a shareable support diagnostic from a session snapshot without mutating it.
 * This function never schedules events, resolves choices, constructs a gameplay RNG,
 * or exposes raw RNG seed/state. Stream draw positions are sufficient to identify
 * deterministic execution position without disclosing the stream internals.
 */
export function createReleaseDiagnostics(
  build: ReleaseBuildIdentity,
  snapshot: unknown,
  runtime: ReleaseRuntimeInfo = {},
  migration: ReleaseMigrationInfo = {},
  generatedAt = new Date().toISOString()
): Record<string, unknown> {
  const envelope = isRecord(snapshot) ? snapshot : {};
  const state = isRecord(envelope.state) ? envelope.state : envelope;
  const history = Array.isArray(state.history) ? state.history : [];
  const last = history.length > 0 && isRecord(history[history.length - 1])
    ? history[history.length - 1] as Record<string, unknown>
    : {};
  const pending = isRecord(envelope.pendingDecision) ? envelope.pendingDecision : {};
  const pendingEvent = isRecord(pending.event) ? pending.event : {};
  const stateRuntime = isRecord(state.runtime) ? state.runtime : {};
  const retirement = isRecord(state.retirement) ? state.retirement : {};
  const epilogue = isRecord(state.epilogue) ? state.epilogue : {};

  return {
    schemaVersion: 1,
    generatedAt,
    privacy: {
      containsSavePayload: false,
      containsJournalText: false,
      containsSessionId: false,
      containsRawRngState: false,
      containsRemoteIdentifiers: false
    },
    build: {
      gitSha: build.gitSha ?? null,
      sourceBranch: build.sourceBranch ?? null,
      versionName: build.android?.versionName ?? null,
      versionCode: build.android?.versionCode ?? null,
      applicationId: build.android?.applicationId ?? null,
      engineBuild: build.engineBuild ?? null,
      contentIdentity: build.contentIdentity ?? null,
      saveSchema: build.saveSchema ?? null,
      sessionSchema: build.sessionSchema ?? null,
      buildVariant: build.buildVariant ?? null,
      buildTimestamp: build.buildTimestamp ?? null,
      webBundleIdentity: build.webBundleIdentity ?? null,
      manifestIdentity: build.manifestIdentity ?? null
    },
    runtime: allowedRuntime(runtime),
    save: {
      sessionVersion: finite(envelope.sessionVersion),
      stateSchemaVersion: finite(state.schemaVersion),
      sourceBuild: text(envelope.build),
      sourceContentIdentity: text(envelope.contentIdentity),
      revision: finite(envelope.revision),
      age: finite(state.age),
      date: text(state.date),
      season: text(state.season),
      phase: text(state.phase),
      runtimeDay: finite(stateRuntime.day),
      historyLength: history.length,
      lastEventId: text(last.eventId),
      pendingEventId: text(pendingEvent.id),
      pendingPresent: Object.keys(pending).length > 0,
      retirementStatus: text(retirement.status),
      epilogueGenerated: bool(epilogue.generated),
      rngPositions: rngPositions(state.rngState),
      migration: {
        status: text(migration.status) ?? "unknown",
        fromContentIdentity: text(migration.fromContentIdentity),
        errorCode: text(migration.errorCode)
      }
    }
  };
}

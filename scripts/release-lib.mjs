import { createHash } from 'node:crypto';

export function sha256(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return createHash('sha256').update(bytes).digest('hex');
}

export function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function manifestIdentity(manifest) {
  const { manifestIdentity: _ignored, ...rest } = manifest;
  return sha256(stableJson(rest));
}

function safeRng(rngState) {
  if (!rngState || typeof rngState !== 'object') return {};
  const out = {};
  for (const name of ['narrative', 'football', 'microfeed', 'qa']) {
    const stream = rngState[name];
    if (!stream || typeof stream !== 'object') continue;
    out[name] = {
      draws: Number.isFinite(stream.draws) ? stream.draws : null,
      stateHash: sha256(stableJson({ seed: stream.seed, state: stream.state, draws: stream.draws }))
    };
  }
  return out;
}

function cleanRuntime(runtime) {
  if (!runtime || typeof runtime !== 'object') return {};
  const allowed = [
    'platform', 'androidRelease', 'sdkInt', 'webViewVersion', 'deviceClass',
    'manufacturer', 'model', 'memoryClassMb', 'locale', 'orientation'
  ];
  return Object.fromEntries(allowed.filter(key => runtime[key] !== undefined).map(key => [key, runtime[key]]));
}

export function createDiagnostics({ buildManifest, snapshot, runtime = {}, migration = {}, generatedAt = new Date().toISOString() }) {
  const state = snapshot?.state && typeof snapshot.state === 'object' ? snapshot.state : snapshot;
  const history = Array.isArray(state?.history) ? state.history : [];
  const last = history.length ? history[history.length - 1] : null;
  const pending = snapshot?.pendingDecision && typeof snapshot.pendingDecision === 'object' ? snapshot.pendingDecision : null;
  const pendingEvent = pending?.event && typeof pending.event === 'object' ? pending.event : null;
  const build = buildManifest && typeof buildManifest === 'object' ? buildManifest : {};

  return {
    schemaVersion: 1,
    generatedAt,
    privacy: {
      containsSavePayload: false,
      containsJournalText: false,
      containsRemoteIdentifiers: false
    },
    build: {
      gitSha: build.gitSha ?? null,
      sourceBranch: build.sourceBranch ?? null,
      versionName: build.android?.versionName ?? build.versionName ?? null,
      versionCode: build.android?.versionCode ?? build.versionCode ?? null,
      applicationId: build.android?.applicationId ?? build.applicationId ?? null,
      engineBuild: build.engineBuild ?? null,
      contentIdentity: build.contentIdentity ?? null,
      saveSchema: build.saveSchema ?? null,
      sessionSchema: build.sessionSchema ?? null,
      buildVariant: build.buildVariant ?? null,
      buildTimestamp: build.buildTimestamp ?? null,
      webBundleIdentity: build.webBundleIdentity ?? null,
      manifestIdentity: build.manifestIdentity ?? null
    },
    runtime: cleanRuntime(runtime),
    save: {
      sessionVersion: Number.isFinite(snapshot?.sessionVersion) ? snapshot.sessionVersion : null,
      stateSchemaVersion: Number.isFinite(state?.schemaVersion) ? state.schemaVersion : null,
      sourceBuild: typeof snapshot?.build === 'string' ? snapshot.build : null,
      sourceContentIdentity: typeof snapshot?.contentIdentity === 'string' ? snapshot.contentIdentity : null,
      revision: Number.isFinite(snapshot?.revision) ? snapshot.revision : null,
      age: Number.isFinite(state?.age) ? state.age : null,
      date: typeof state?.date === 'string' ? state.date : null,
      season: typeof state?.season === 'string' ? state.season : null,
      phase: typeof state?.phase === 'string' ? state.phase : null,
      runtimeDay: Number.isFinite(state?.runtime?.day) ? state.runtime.day : null,
      historyLength: history.length,
      lastEventId: typeof last?.eventId === 'string' ? last.eventId : null,
      pendingEventId: typeof pendingEvent?.id === 'string' ? pendingEvent.id : null,
      pendingInstancePresent: Boolean(pending?.instanceId),
      retirementStatus: typeof state?.retirement?.status === 'string' ? state.retirement.status : null,
      epilogueGenerated: typeof state?.epilogue?.generated === 'boolean' ? state.epilogue.generated : null,
      rng: safeRng(state?.rngState),
      migration: {
        status: typeof migration.status === 'string' ? migration.status : 'unknown',
        fromContentIdentity: typeof migration.fromContentIdentity === 'string' ? migration.fromContentIdentity : null,
        errorCode: typeof migration.errorCode === 'string' ? migration.errorCode : null
      }
    }
  };
}

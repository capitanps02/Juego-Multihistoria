// Presentation-only adapter: the engine stays deterministic when called directly,
// while player-facing entry points never start every fresh installation from the same seed.
const LEGACY_INITIAL_SEED = 424242;

export function createPlayerSessionApi(GameSession, cryptoApi = globalThis.crypto) {
  const freshSeed = () => {
    if (!cryptoApi?.getRandomValues) throw new Error('No hay una fuente segura disponible para iniciar una carrera.');
    const value = new Uint32Array(1);
    cryptoApi.getRandomValues(value);
    return value[0];
  };

  return Object.freeze({
    fromSave: (...args) => GameSession.fromSave(...args),
    create: (seed, options) => GameSession.create(seed === LEGACY_INITIAL_SEED ? freshSeed() : seed, options)
  });
}

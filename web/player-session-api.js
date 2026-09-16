// Presentation-only adapter: the engine stays deterministic when called directly,
// while player-facing entry points never start every fresh installation from the same seed.
const LEGACY_INITIAL_SEED = 424242;

export function createPlayerSessionApi(GameSession, cryptoApi = globalThis.crypto, getKnownPlayerContacts = null) {
  const freshSeed = () => {
    if (!cryptoApi?.getRandomValues) throw new Error('No hay una fuente segura disponible para iniciar una carrera.');
    const value = new Uint32Array(1);
    cryptoApi.getRandomValues(value);
    return value[0];
  };

  const present = session => {
    if (!session || typeof getKnownPlayerContacts !== 'function') return session;
    const presentView = view => view && typeof view === 'object'
      ? { ...view, contacts: getKnownPlayerContacts(session) }
      : view;
    const presentDispatchResult = result => {
      const project = value => value && typeof value === 'object' && value.view
        ? { ...value, view: presentView(value.view) }
        : value;
      return result && typeof result.then === 'function' ? result.then(project) : project(result);
    };
    return Object.freeze({
      getView: (...args) => presentView(session.getView(...args)),
      dispatch: (...args) => presentDispatchResult(session.dispatch(...args)),
      exportSnapshot: (...args) => session.exportSnapshot(...args)
    });
  };
  const presentResult = result => result && typeof result.then === 'function' ? result.then(present) : present(result);

  const fromSave = async (...args) => {
    try {
      return present(await GameSession.fromSave(...args));
    } catch (error) {
      if (error?.code !== 'CONTENT_CHANGED' || typeof GameSession.migrateFromSave !== 'function') throw error;
      return present(await GameSession.migrateFromSave(...args));
    }
  };

  return Object.freeze({
    fromSave,
    migrateFromSave: (...args) => presentResult(GameSession.migrateFromSave(...args)),
    create: (seed, options) => presentResult(GameSession.create(seed === LEGACY_INITIAL_SEED ? freshSeed() : seed, options))
  });
}

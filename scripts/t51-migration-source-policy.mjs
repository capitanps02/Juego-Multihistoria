export function migrationSourceCoverage({ currentIdentity, preIdentity, sourceIdentities, routes }) {
  const registered = new Set(sourceIdentities);
  const missingCurrentSource = currentIdentity === preIdentity || registered.has(currentIdentity)
    ? []
    : [currentIdentity];

  const requiredSources = [...registered].filter(identity => identity !== currentIdentity).sort();
  const missingRoutes = requiredSources.filter(sourceIdentity =>
    !routes.some(route => route.sourceContentIdentity === sourceIdentity && route.targetContentIdentity === currentIdentity)
  );

  return {
    currentIdentity,
    registeredSources: [...registered].sort(),
    requiredSources,
    missingCurrentSource,
    missingRoutes,
    ok: missingCurrentSource.length === 0 && missingRoutes.length === 0
  };
}

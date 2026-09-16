function countAcyclicPaths(sourceIdentity, targetIdentity, routes) {
  if (sourceIdentity === targetIdentity) return 1;
  const outgoing = new Map();
  for (const route of routes) {
    const list = outgoing.get(route.sourceContentIdentity) ?? [];
    list.push(route.targetContentIdentity);
    outgoing.set(route.sourceContentIdentity, list);
  }

  let count = 0;
  const walk = (current, visited) => {
    if (count > 1) return;
    for (const next of outgoing.get(current) ?? []) {
      if (visited.has(next)) continue;
      if (next === targetIdentity) {
        count += 1;
        if (count > 1) return;
        continue;
      }
      const nextVisited = new Set(visited);
      nextVisited.add(next);
      walk(next, nextVisited);
      if (count > 1) return;
    }
  };

  walk(sourceIdentity, new Set([sourceIdentity]));
  return count;
}

export function migrationSourceCoverage({ currentIdentity, preIdentity, sourceIdentities, routes }) {
  const registered = new Set(sourceIdentities);
  const missingCurrentSource = currentIdentity === preIdentity || registered.has(currentIdentity)
    ? []
    : [currentIdentity];

  const routeEndpointSet = new Set();
  for (const route of routes) {
    if (!registered.has(route.sourceContentIdentity)) routeEndpointSet.add(route.sourceContentIdentity);
    if (!registered.has(route.targetContentIdentity)) routeEndpointSet.add(route.targetContentIdentity);
  }

  const requiredSources = [...registered].filter(identity => identity !== currentIdentity).sort();
  const missingPaths = [];
  const ambiguousPaths = [];
  for (const sourceIdentity of requiredSources) {
    const count = countAcyclicPaths(sourceIdentity, currentIdentity, routes);
    if (count === 0) missingPaths.push(sourceIdentity);
    if (count > 1) ambiguousPaths.push(sourceIdentity);
  }

  const unknownRouteEndpoints = [...routeEndpointSet].sort();
  return {
    currentIdentity,
    registeredSources: [...registered].sort(),
    requiredSources,
    missingCurrentSource,
    missingPaths,
    ambiguousPaths,
    unknownRouteEndpoints,
    ok: missingCurrentSource.length === 0 && missingPaths.length === 0 && ambiguousPaths.length === 0 && unknownRouteEndpoints.length === 0
  };
}

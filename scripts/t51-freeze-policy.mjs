export function evaluateT51FreezeTransition({
  frozenContentIdentity,
  activeContentIdentity,
  preT51ContentIdentity,
  findRoute
}) {
  if (frozenContentIdentity !== preT51ContentIdentity) {
    throw new Error('Frozen T5.1 manifest no longer matches PRE_T51_CONTENT_IDENTITY');
  }

  if (activeContentIdentity === frozenContentIdentity) {
    return {
      mode: 'pre-t51-content-still-active',
      migrationRouteRegistered: false,
      route: null
    };
  }

  const route = findRoute(frozenContentIdentity, activeContentIdentity);
  if (!route) {
    throw new Error(`Active contentIdentity ${activeContentIdentity} differs from frozen pre-T5.1 baseline without a registered migration route`);
  }

  return {
    mode: 'post-t51-content-route-registered',
    migrationRouteRegistered: true,
    route
  };
}

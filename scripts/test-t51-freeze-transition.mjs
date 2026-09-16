import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateT51FreezeTransition } from './t51-freeze-policy.mjs';

const PRE = 'pre';

test('unchanged active content needs no migration route', () => {
  const result = evaluateT51FreezeTransition({
    frozenContentIdentity: PRE,
    activeContentIdentity: PRE,
    preT51ContentIdentity: PRE,
    findRoute: () => { throw new Error('route lookup should not run'); }
  });
  assert.equal(result.mode, 'pre-t51-content-still-active');
  assert.equal(result.migrationRouteRegistered, false);
});

test('changed active content is accepted only with an explicit route', () => {
  const route = { from: PRE, to: 'next' };
  const result = evaluateT51FreezeTransition({
    frozenContentIdentity: PRE,
    activeContentIdentity: 'next',
    preT51ContentIdentity: PRE,
    findRoute: (from, to) => from === PRE && to === 'next' ? route : null
  });
  assert.equal(result.mode, 'post-t51-content-route-registered');
  assert.equal(result.migrationRouteRegistered, true);
  assert.equal(result.route, route);
});

test('changed active content without route fails closed', () => {
  assert.throws(() => evaluateT51FreezeTransition({
    frozenContentIdentity: PRE,
    activeContentIdentity: 'unauthorized',
    preT51ContentIdentity: PRE,
    findRoute: () => null
  }), /without a registered migration route/);
});

test('mutating the frozen baseline identity is always rejected', () => {
  assert.throws(() => evaluateT51FreezeTransition({
    frozenContentIdentity: 'tampered',
    activeContentIdentity: 'tampered',
    preT51ContentIdentity: PRE,
    findRoute: () => null
  }), /no longer matches PRE_T51_CONTENT_IDENTITY/);
});

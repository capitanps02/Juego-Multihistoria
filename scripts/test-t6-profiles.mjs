import test from 'node:test';
import assert from 'node:assert/strict';
import { T6_PROFILES, chooseForProfile, validateT6Profiles } from './t6-profiles.mjs';

const byId = id => T6_PROFILES.find(profile => profile.id === id);
const event = choices => ({ id: 'SYNTHETIC_T6_PROFILE_TEST', choices });

function choice(id, label, intentTags = []) {
  return { id, label, intentTags };
}

test('T6 defines exactly 15 valid unique semantic profiles', () => {
  assert.equal(T6_PROFILES.length, 15);
  assert.deepEqual(validateT6Profiles(), []);
  assert.equal(new Set(T6_PROFILES.map(profile => profile.id)).size, 15);
});

test('profiles do not encode concrete event ids or opaque choice ids', () => {
  for (const profile of T6_PROFILES) {
    for (const token of Object.keys(profile.weights)) {
      assert.equal(/(?:^|_)EVT_|EVT_/i.test(token), false, `${profile.id}:${token}`);
      assert.equal(/^[a-d]$/i.test(token), false, `${profile.id}:${token}`);
    }
  }
});

test('health-first follows health/recovery semantics', () => {
  const result = chooseForProfile(byId('health-first'), event([
    choice('PLAY', 'Force the next match', ['risk', 'competition']),
    choice('REST', 'Protect the body', ['health', 'recovery', 'rest'])
  ]), 0);
  assert.equal(result.choiceId, 'REST');
  assert.equal(result.usedFallback, false);
});

test('money-first follows contract/money semantics', () => {
  const result = chooseForProfile(byId('money-first'), event([
    choice('LOYAL', 'Stay for the project', ['loyalty', 'team']),
    choice('CASH', 'Take the stronger financial package', ['money', 'contract'])
  ]), 0);
  assert.equal(result.choiceId, 'CASH');
  assert.equal(result.usedFallback, false);
});

test('semantic matching is accent-insensitive instead of splitting diacritics', () => {
  const profile = { id: 'accent-test', offer: 'delegate', fallback: 'first', weights: { decision: 10 } };
  const result = chooseForProfile(profile, event([
    choice('WAIT', 'Esperar'),
    choice('DECIDE', 'Tomar una decisión propia')
  ]), 0);
  assert.equal(result.choiceId, 'DECIDE');
  assert.equal(result.usedFallback, false);
});

test('semantic scoring requires token boundaries', () => {
  const health = chooseForProfile(byId('health-first'), event([
    choice('PRESTIGE', 'Buscar prestigio', ['prestige']),
    choice('NEUTRAL', 'Mantener el plan', ['career'])
  ]), 0);
  assert.equal(health.usedFallback, true);

  const fame = chooseForProfile(byId('fame-first'), event([
    choice('PRESSURE', 'Aceptar la presión', ['pressure']),
    choice('MEDIA', 'Hablar con la prensa', ['press'])
  ]), 0);
  assert.equal(fame.choiceId, 'MEDIA');
  assert.equal(fame.matchedTokens.includes('press'), true);
});

test('semantic token boundaries still support underscored intent tags', () => {
  const profile = { id: 'compound-test', offer: 'accept', fallback: 'last', weights: { national: 10 } };
  const result = chooseForProfile(profile, event([
    choice('LOCAL', 'Seguir en el club', ['club']),
    choice('COUNTRY', 'Aceptar la llamada', ['national_team'])
  ]), 0);
  assert.equal(result.choiceId, 'COUNTRY');
  assert.equal(result.usedFallback, false);
});

test('cross-age vocabulary reaches 20-23 protection and compromise choices semantically', () => {
  const synthetic = event([
    choice('A', 'Iniciativa', ['initiative']),
    choice('B', 'Esperar', ['patience']),
    choice('C', 'Proteger', ['self_protection']),
    choice('D', 'Solución intermedia', ['compromise'])
  ]);
  assert.equal(chooseForProfile(byId('control-first'), synthetic, 0).choiceId, 'C');
  assert.equal(chooseForProfile(byId('agent-led'), synthetic, 0).choiceId, 'D');
});

test('cross-age vocabulary reaches ceiling, adaptation and wait routes', () => {
  const peak = event([
    choice('A', 'Techo', ['ceiling']),
    choice('B', 'Estabilidad', ['stability']),
    choice('C', 'Control', ['control']),
    choice('D', 'Balance', ['balance'])
  ]);
  assert.equal(chooseForProfile(byId('ambitious'), peak, 0).choiceId, 'A');

  const veteran = event([
    choice('A', 'Competir', ['competition']),
    choice('B', 'Estabilidad', ['stability']),
    choice('C', 'Adaptar', ['adapt']),
    choice('D', 'Esperar', ['wait'])
  ]);
  assert.equal(chooseForProfile(byId('agent-led'), veteran, 0).choiceId, 'C');
  assert.equal(chooseForProfile(byId('control-first'), veteran, 0).choiceId, 'D');
});

test('conditional vocabulary distinguishes action, distance and intermediary channel', () => {
  const young = event([
    choice('A', 'Actuar', ['react']),
    choice('B', 'Esperar', ['wait']),
    choice('C', 'Canal', ['channel'])
  ]);
  assert.equal(chooseForProfile(byId('risk-taker'), young, 0).choiceId, 'A');
  assert.equal(chooseForProfile(byId('control-first'), young, 0).choiceId, 'B');
  assert.equal(chooseForProfile(byId('agent-led'), young, 0).choiceId, 'C');

  const adult = event([
    choice('A', 'Directo', ['direct']),
    choice('B', 'Distancia', ['distance']),
    choice('C', 'Canal', ['channel'])
  ]);
  assert.equal(chooseForProfile(byId('risk-taker'), adult, 0).choiceId, 'A');
  assert.equal(chooseForProfile(byId('risk-averse'), adult, 0).choiceId, 'B');
  assert.equal(chooseForProfile(byId('agent-led'), adult, 0).choiceId, 'C');

  const peak = event([
    choice('A', 'Intervenir', ['act']),
    choice('B', 'Esperar', ['wait']),
    choice('C', 'Proteger', ['protect'])
  ]);
  assert.equal(chooseForProfile(byId('risk-taker'), peak, 0).choiceId, 'A');
  assert.equal(chooseForProfile(byId('control-first'), peak, 0).choiceId, 'B');
  assert.equal(chooseForProfile(byId('health-first'), peak, 0).choiceId, 'C');
});

test('retirement semantics distinguish continue, resist, private and public routes', () => {
  const retirement = event([
    choice('A', 'Retirarse', ['retire']),
    choice('B', 'Seguir', ['continue']),
    choice('C', 'Esperar', ['wait']),
    choice('D', 'Resistir', ['resist'])
  ]);
  assert.equal(chooseForProfile(byId('legacy-builder'), retirement, 0).choiceId, 'A');
  assert.equal(chooseForProfile(byId('ambitious'), retirement, 0).choiceId, 'B');
  assert.equal(chooseForProfile(byId('control-first'), retirement, 0).choiceId, 'C');
  assert.equal(chooseForProfile(byId('risk-taker'), retirement, 0).choiceId, 'D');

  const announcement = event([
    choice('PUBLIC', 'Público', ['public']),
    choice('PRIVATE', 'Privado', ['private']),
    choice('WAIT', 'Esperar', ['wait'])
  ]);
  assert.equal(chooseForProfile(byId('fame-first'), announcement, 0).choiceId, 'PUBLIC');
  assert.equal(chooseForProfile(byId('family-first'), announcement, 0).choiceId, 'PRIVATE');
});

test('positive semantic ties use the profile fallback instead of first-option order', () => {
  const tied = event([
    choice('A', 'Primera', ['money']),
    choice('B', 'Segunda', ['money']),
    choice('C', 'Tercera', ['money'])
  ]);
  assert.equal(chooseForProfile(byId('money-first'), tied, 0).choiceId, 'C');

  const middleProfile = { id: 'middle-tie', offer: 'delegate', fallback: 'middle', weights: { team: 10 } };
  const middle = event([
    choice('A', 'Primera', ['team']),
    choice('B', 'Segunda', ['team']),
    choice('C', 'Tercera', ['team'])
  ]);
  assert.equal(chooseForProfile(middleProfile, middle, 0).choiceId, 'B');
});

test('alternating fallback also breaks positive semantic ties deterministically', () => {
  const profile = { id: 'alternating-tie', offer: 'accept', fallback: 'alternating', weights: { risk: 10 } };
  const tied = event([
    choice('A', 'Primera', ['risk']),
    choice('B', 'Segunda', ['risk']),
    choice('C', 'Tercera', ['risk'])
  ]);
  assert.equal(chooseForProfile(profile, tied, 0).choiceId, 'A');
  assert.equal(chooseForProfile(profile, tied, 1).choiceId, 'C');
});

test('contrarian explorer alternates deterministic fallback edges', () => {
  const synthetic = event([
    choice('A', 'A'),
    choice('B', 'B'),
    choice('C', 'C')
  ]);
  assert.equal(chooseForProfile(byId('contrarian-explorer'), synthetic, 0).choiceId, 'A');
  assert.equal(chooseForProfile(byId('contrarian-explorer'), synthetic, 1).choiceId, 'C');
  assert.equal(chooseForProfile(byId('contrarian-explorer'), synthetic, 2).choiceId, 'A');
});

# T5.2/T5.4 — Pruebas de scope para consecuencias diferidas

Fecha: 2026-09-16

## Objetivo

El audit de consecuencias diferidas demuestra factibilidad temporal por edad, pero deliberadamente no infiere continuidad de club o temporada. Cuando una seed con `origin_club` u `origin_season` posee un consumidor positivo runtime, esa cadena requiere una prueba adicional.

Este follow-up convierte `scopeProofRequired` en un ratchet de CI sin cambiar gameplay.

## Registry

`scripts/t52-seed-scope-proofs.mjs` registra cada obligación acreditada con:

- `seedId`;
- scope (`origin_club` u `origin_season`);
- productor runtime acreditado;
- consumidor runtime positivo acreditado;
- tipo de prueba.

El suite exige correspondencia exacta entre los IDs presentes en `deferred-consequences.json.scopeProofRequired` y el registry. Una nueva obligación sin prueba, una prueba stale o un mapping productor/consumidor incorrecto hacen fallar CI.

## Obligación actual

`SEED_PRIVATE_CHAT`

- scope: `origin_club`;
- productor: `EVT_24_LOCK_001` — **El chat privado**;
- consumidor: `CEVT_24_CHAT_01` — **La captura existe**;
- regla causal: el callback solo puede depender de esa memoria mientras el jugador siga en el club donde nació.

La regresión dirigida comprueba sobre contenido/runtime real:

1. el productor contiene una transición `create` para `SEED_PRIVATE_CHAT`;
2. con una instancia viva y el club de origen intacto, el gate real de `CEVT_24_CHAT_01` pasa;
3. después de una transferencia, `expireDueSeedsInPlace()` cierra la instancia con `__t52TerminalReason = "club_scope"`;
4. `HAS_SEED_PRIVATE_CHAT` pasa a `false`;
5. el gate real del callback deja de pasar.

Esto impide que una memoria local de vestuario sobreviva causalmente a un traslado de club.

## Límites

- no modifica resolver, scheduler, eventos, seeds ni scopes;
- no cambia saves, history, contentIdentity o RNG;
- no convierte una prueba de scope en autorización de nuevo wiring canónico;
- no infiere conocimiento NPC;
- futuras seeds `origin_season` deberán añadir una prueba equivalente antes de que el suite pueda volver a quedar verde.

# MUIR P1 — Copy contract

Base: P0 certified SHA `c5b6d0d6d18802a62d174bf450c95ebf1d0403c0`.

Copy is part of interaction design. P1 defines roles; it does not rewrite every production string.

## Copy categories

### NARRATIVE
Purpose: emotion, atmosphere, career identity, consequences.

Rules:
- expressive but concrete;
- may use rhythm and metaphor sparingly;
- must not imply hidden mechanics or guaranteed future outcomes;
- longer than operational copy is acceptable when the player is reading a story moment;
- preserve football/career tone without melodrama becoming system information.

Typical surfaces: Home hero, decision body, result narrative, epilogue.

### OPERATIONAL
Purpose: tell the player what action will happen.

Rules:
- short;
- unambiguous;
- verb-led when actionable;
- scannable on mobile;
- no decorative wording that hides the action;
- labels must match real commands.

Examples of current canonical patterns: `Simular`, `Pausar simulación`, `Reanudar simulación`, `Aceptar oferta`, `Volver a carrera`.

### SYSTEM
Purpose: state of save/simulation/application.

Rules:
- factual and neutral;
- state first, explanation second;
- no invented progress percentage;
- distinguish paused, busy, saved and interrupted states.

### FEEDBACK
Purpose: confirm an action/result.

Rules:
- state what happened;
- include public consequence when available;
- avoid exaggerated success language when outcome is neutral;
- favorable/unfavorable must be understandable without color.

### ERROR
Purpose: explain a failure and recovery path.

Rules:
- name the failed operation when known;
- preserve user agency with a concrete next action;
- do not blame the user;
- do not claim data loss unless proven;
- use danger visuals plus text/role semantics.

### HELP
Purpose: explain rules or terminology.

Rules:
- concise;
- available where the concept is encountered;
- not permanently repeated if later design can make it discoverable elsewhere;
- cannot reveal private probabilities/effect keys.

## Narrative vs operational boundary

Narrative copy may be expressive. Operational copy must remain short, literal and tappable. A CTA must never require interpreting a metaphor.

Bad pattern: a poetic CTA whose result is unclear.
Contract pattern: narrative heading + literal action button.

## Mobile contract

- Primary operational labels should normally fit one or two short lines.
- Important state should appear before explanation.
- Avoid long parenthetical text in buttons.
- Critical instructions must not depend on hover.
- Copy may wrap; truncation must not remove command meaning.

## Data/authority guard

Copy may not assert:
- player name/GRL/attributes that do not exist publicly;
- standings/market state not exposed;
- probability of a choice result;
- hidden relationship state;
- guaranteed transfer/selection/contract outcomes;
- hidden Player Action effects.

## Consistency terms

Use the product's public vocabulary consistently:
- `Forma`
- `Estado físico`
- `Fatiga`
- `Tu partida`
- `Gestionar mi carrera`
- `Resumen del periodo`
- `Carrera`, `Mundo`, `Relaciones`, `Perfil`

Terminology changes require a separate copy/content decision if they alter player understanding.

## Accessibility

- Avoid all-caps for long copy; eyebrows may remain uppercase.
- Error/feedback text must be announced where current semantics provide role/status.
- Icon-only controls require an accessible label independent of tooltip/visual icon.

# Flujo ChatGPT → GitHub → Codex

## Objetivo

Usar GitHub como fuente de verdad y punto de coordinación entre:

- **ChatGPT**: análisis, planificación, auditoría, definición de tareas, cambios seguros y revisión.
- **Codex**: implementación extensa, refactors, ejecución de tareas de programación y trabajo que requiera recorrer muchos archivos o ejecutar el repositorio.
- **GitHub**: historial, ramas, PRs, criterios de aceptación, revisión y trazabilidad.

## Regla principal

Ningún trabajo importante se ejecuta directamente sobre `main`.

Cada tarea relevante debe vivir en una rama y, preferiblemente, en un Pull Request con:

1. contexto,
2. alcance,
3. archivos/sistemas afectados,
4. criterios de aceptación,
5. pruebas requeridas,
6. restricciones,
7. riesgos conocidos.

## Qué hará ChatGPT

ChatGPT puede operar directamente sobre GitHub para:

- inspeccionar el repositorio;
- analizar arquitectura y código;
- mantener documentación de producto y técnica;
- preparar auditorías y especificaciones;
- crear ramas;
- crear o actualizar archivos de texto;
- crear issues y pull requests;
- revisar diffs y PRs;
- añadir comentarios de revisión;
- preparar tareas listas para Codex;
- comprobar resultados de GitHub Actions cuando existan;
- proponer y aplicar cambios pequeños/seguros cuando no sea necesaria una sesión de Codex.

ChatGPT no debe fusionar una rama en `main` salvo orden explícita del usuario.

## Qué se delegará a Codex

Codex se utilizará preferentemente para:

- implementaciones que afecten a varios archivos;
- refactors;
- cambios con build/test iterativo;
- regeneración de artefactos;
- correcciones que requieran inspeccionar el repositorio completo;
- ejecución de suites de pruebas;
- tareas largas de implementación definidas previamente en el PR.

## Comando de conversación

Cuando el usuario escriba:

> **ejecuta Codex**

ChatGPT debe:

1. identificar el PR/tarea activa;
2. comprobar que el briefing y los criterios de aceptación están completos;
3. añadir al PR un comentario `@codex` con la instrucción concreta de implementación;
4. incluir en ese comentario la obligación de leer `AGENTS.md` y la descripción del PR;
5. pedir a Codex que implemente, pruebe y deje los cambios en la rama del PR;
6. no fusionar automáticamente el resultado.

Forma recomendada del comentario:

```text
@codex Implementa esta tarea siguiendo estrictamente AGENTS.md y la descripción de este PR.

Antes de cambiar código:
- revisa los archivos relevantes y confirma el alcance en tu análisis interno;
- no amplíes el scope;
- preserva determinismo, compatibilidad de saves y límites arquitectónicos existentes.

Al terminar:
- ejecuta las pruebas indicadas en los criterios de aceptación;
- deja los cambios en la rama de este PR;
- resume archivos modificados, pruebas ejecutadas, resultados y cualquier limitación pendiente.
```

Si la tarea necesita instrucciones adicionales, ChatGPT las añade debajo de este bloque.

## Después de Codex

Cuando Codex haya actualizado el PR, ChatGPT debe revisar:

1. diff completo;
2. cumplimiento de los criterios de aceptación;
3. cambios accidentales fuera de alcance;
4. determinismo/RNG si aplica;
5. compatibilidad de guardado si aplica;
6. pruebas y workflows;
7. artefactos generados;
8. deuda o riesgos introducidos.

El resultado de esa revisión será uno de estos estados:

- **LISTO PARA MERGE** — cumple alcance y criterios.
- **REQUIERE CORRECCIONES** — ChatGPT deja comentarios concretos en el PR.
- **BLOQUEADO** — falta una decisión del usuario, evidencia externa o capacidad de entorno.

La decisión final de fusionar corresponde al usuario.

## Estructura sugerida para tareas

### Título

`T?.? — descripción concreta`

### Contexto

Por qué existe la tarea y qué problema resuelve.

### Alcance

Qué debe cambiar.

### Fuera de alcance

Qué no debe tocarse.

### Criterios de aceptación

Lista verificable y binaria cuando sea posible.

### Validación

Comandos o comprobaciones requeridas.

### Riesgos / invariantes

Determinismo, save compatibility, rendimiento, canon, UI, Android, etc.

## Convención operativa

A partir de la adopción de este documento:

- ChatGPT mantendrá el trabajo trazable en GitHub siempre que la tarea afecte al proyecto.
- Los análisis relevantes deben terminar convertidos en una acción concreta: archivo, issue, PR, checklist o criterio de aceptación.
- El repositorio prevalece sobre contexto informal de conversaciones anteriores.
- `AGENTS.md` contiene las reglas permanentes que deben leer los agentes de programación.

## Estado inicial recomendado

El primer trabajo de producto a continuar tras configurar este flujo es el bloque de reconciliación canónica **T5.1**, actualmente identificado como uno de los mayores riesgos funcionales del proyecto. Antes de enviarlo a Codex, conviene descomponer las 87 correspondencias principales pendientes en lotes revisables y establecer evidencia explícita para cada alias aceptado.

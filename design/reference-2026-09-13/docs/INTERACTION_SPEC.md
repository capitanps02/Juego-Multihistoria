# INTERACTION & MOTION SPEC

## Navegación
- Sidebar fija/flotante en estados normales.
- Pantalla activa cambia con transición corta.
- No usar animaciones largas para navegación repetida.

## Duraciones
- press feedback: 100–180 ms
- hover/focus: 140–220 ms
- cambio de vista: 220–450 ms
- curtain a cinemática: ~450–550 ms
- aparición escalonada de decisiones: 350–650 ms total

## Simulación
1. Reiniciar timeline.
2. Activar día actual.
3. Marcar anteriores como completados.
4. Actualizar barra.
5. Si hay evento, mostrar aviso breve.
6. Transición a cinemática.

La simulación debe poder acelerarse en una versión futura.

## Decisiones
- aparición después de terminar la cinemática;
- el primer foco debe ir a la opción recomendada por posición, no por probabilidad;
- confirmar selección con respuesta visual;
- no desvelar stats ocultas.

## Mando/teclado
- flechas / tab: mover foco;
- enter / espacio: activar;
- escape: atrás;
- foco visible y no dependiente solo de color.

## Accesibilidad
- respetar `prefers-reduced-motion`;
- posibilidad de mayor contraste;
- no poner cuerpo de texto esencial sobre fondos en movimiento sin protección;
- tamaño táctil futuro recomendado >= 44 pt equivalente.

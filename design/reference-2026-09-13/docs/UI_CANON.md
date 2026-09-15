# UI CANON — MULTIHISTORIA

## 1. Visión

Multihistoria es un juego narrativo de carrera de futbolista. La interfaz tiene dos velocidades:

1. **Simulación tranquila y rápida** para semanas normales.
2. **Interrupción cinematográfica** para acontecimientos capaces de cambiar la carrera.

La UI debe facilitar el juego, no competir con la historia.

## 2. Dirección visual canónica

Nombre interno: **Premium Cinematic / Apple Product Layer**

Influencias transformadas:
- interfaces de producto de Apple: jerarquía, espacio, geometría, material y respuesta;
- videojuegos deportivos AAA: lectura inmediata del partido y estado del jugador;
- documental deportivo: imágenes grandes, momentos, fechas, tensión;
- simuladores narrativos: decisiones claras, consecuencias parcialmente ocultas.

No copiar literalmente interfaces, marcas, escudos o assets de terceros.

## 3. Principios obligatorios

### Content first
Las imágenes del futbolista, estadio o escena narrativa pueden ocupar grandes áreas. El HUD se reduce.

### Progressive disclosure
La pantalla principal no enseña todas las estadísticas. La profundidad existe detrás de Perfil, Carrera, Mundo y Relaciones.

### Una acción primaria
Cada estado de juego debe dejar claro cuál es la acción natural:
- Simular semana
- Continuar
- Elegir respuesta
- Simular partido
- Aceptar / negociar / rechazar

### La narrativa suspende el dashboard
En un momento importante desaparecen la mayoría de paneles. El evento debe sentirse excepcional.

### Consecuencias no totalmente transparentes
No mostrar “+5 ambición”, “-8 familia”, probabilidades o resultados futuros salvo que la mecánica específica lo justifique.

### Mundo vivo
Las noticias no deben tratar siempre del protagonista.

## 4. Materiales

Usar vidrio/translucidez únicamente en:
- sidebar;
- toolbar superior;
- selector contextual;
- decision sheet;
- controles transitorios;
- hints.

Usar materiales sólidos en:
- tarjetas de noticias;
- estadísticas;
- calendario;
- relaciones;
- historial;
- atributos.

Evitar “glassmorphism por todas partes”.

## 5. Geometría

Jerarquía de radios recomendada:
- ventana principal: 34–36 px;
- navegación flotante: 26–28 px;
- cards grandes: 22–28 px;
- decision sheet: 24–28 px;
- botones primarios: 14–15 px;
- botones secundarios: 11–13 px;
- pills: radio completo.

Los radios interiores deben guardar relación visual con los exteriores.

## 6. Color

Base:
- negro / gris casi negro;
- blanco no puro para texto general;
- grises fríos para contenido secundario.

Acción primaria:
- azul sistema aproximado `#0A84FF`.

Positivo:
- verde `#30D158`.

Advertencia:
- naranja `#FF9F0A`.

Peligro:
- rojo `#FF453A`.

Identidad:
- dorado suave `#D6B86A`, solo como acento de marca, hitos, trofeos o detalles especiales.

## 7. Tipografía

Usar stack de sistema:
`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif`

No distribuir fuentes propietarias.

Jerarquía:
- nombres/hitos grandes: Bold 26–43 px;
- títulos de vista: Semibold 12–14 px;
- títulos de card: Semibold 11–13 px;
- body: Regular/Medium 9–12 px en el prototipo 16:9;
- metadatos: 8–10 px.

Evitar mayúsculas constantes. Reservarlas para microetiquetas, competición o estados.

## 8. Motion

El movimiento debe responder a acciones:
- hover: escala 1.005–1.012;
- press: escala ~0.98;
- entrada de pantalla: 200–450 ms;
- decision options: entrada escalonada;
- cinemática: drift muy lento;
- progreso de simulación: movimiento lineal claro.

Compatibilidad con `prefers-reduced-motion`.

## 9. Focus / mando

El foco nunca se comunica solo por color.
Combinar:
- halo azul;
- escala ligera;
- elevación/sombra;
- posición consistente.

Arrow keys / Tab: navegación.
Enter/Space: activar.
Escape: volver.

## 10. Prohibiciones

No:
- llenar Inicio de KPI;
- usar dorado en cada botón;
- mostrar consecuencias numéricas de narrativa;
- usar más de una acción primaria por bloque;
- poner texto fino sobre imagen sin degradado/protección;
- usar glass en todos los paneles;
- convertir decisiones en popups administrativos;
- mostrar 8–12 opciones a la vez;
- depender de logos reales o licencias;
- usar iconos Unicode como acabado final.

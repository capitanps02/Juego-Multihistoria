# T4.6 · ciclo de juego y tutorial

## Entrega

El flujo visible de la carrera queda conectado entre Inicio, Carrera, Mundo, Relaciones, Perfil y Tu partida. Inicio explica cómo avanzar, leer el contexto, elegir y continuar; la pausa bloquea las acciones que mutan la sesión y el guardado sigue siendo automático.

Los resultados de escenas deportivas incluyen un resumen de partido con fecha, partidos disputados, forma y estado físico. El resumen usa únicamente datos públicos de `PlayerView` y no muestra códigos de eventos, semillas ni rutas internas.

## Verificación

`scripts/test-t46.mjs` comprueba las seis vistas, las instrucciones del tutorial, el resumen deportivo, los estilos responsive y la ausencia de identificadores internos en el texto de interfaz. El build TypeScript y la prueba dirigida pasan el 15 de septiembre.

Regresión completa: **63/63 pruebas** de sesión, guardados, hitos, memoria, lotes T4 y ciclo de interfaz; gate general v0.8 correcto.

## Límite

La observación con personas y las mejoras basadas en comprensión, deseo de continuar y fricción quedan para T4.7 y T4.8.

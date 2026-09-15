# Cómo probar el juego

## Disponible ahora: interfaz Multihistoria del handoff

**Online:** [Jugar en PlayCanvas](https://launch.playcanvas.com/2593315?debug=true). Ya está instalado en tu escena y probado en Chrome con tu sesión de PlayCanvas. No requiere arrancar el servidor local. La actualización del 14 de septiembre recuperó tu carrera del 16 de julio con cuatro decisiones. Continúa desde el estado que muestre tu navegador.

**Local:** abre [el juego de prueba](http://127.0.0.1:4173) en este ordenador. El servidor está preparado para escuchar únicamente en este ordenador. Puedes usar el navegador de Codex o Chrome; usa siempre el mismo navegador y la misma dirección para recuperar su partida.

La interfaz ya sigue el handoff del autor: presentación oscura, retrato, navegación Inicio/Carrera/Mundo/Relaciones/Perfil y decisiones sobre imágenes. Las decisiones se resuelven con el motor real. Al iniciar una carrera, pulsa **Simular semana**; se detendrá en una escena. Si ya había una partida pendiente, se recupera automáticamente.

Tu partida conserva la clave y el origen local de T2.1/T2.2. La sección **Tu partida** permite descargar una copia, importar una sesión validada y recuperar el último estado válido anterior a un cambio guardado. La confirmación muestra la fecha y decisiones de la copia. No importa directamente los JSON históricos del motor que carecen de contenedor interactivo.

La integración en [tu escena PlayCanvas](https://playcanvas.com/editor/scene/2593315) está instalada y Launch comprobado. La partida online es independiente de la local; puedes trasladarla con Descargar copia e Importar copia. [Estado y límites](T3_1_INTEGRACION_PLAYCANVAS.md).

### Si el enlace deja de funcionar

En Finder, abre la carpeta del proyecto y ejecuta **Probar juego.command**. Mantén abierta la ventana de Terminal que se inicia y entra en `http://127.0.0.1:4173`.

- [Abrir el lanzador](</Users/capitanps/Downloads/multihistoria-engine-v0.8/Probar juego.command>)
- Carpeta: `/Users/capitanps/Downloads/multihistoria-engine-v0.8`.

El enlace al lanzador puede mostrar su contenido dentro de Codex; ejecútalo desde Finder. En este ordenador utiliza el Node.js y TypeScript ya disponibles y regenera el paquete visual. En otro equipo con Node.js y npm, desde la carpeta del proyecto: `npm ci`, después `npm run play`.

Detener el servidor no borra el guardado del navegador. Borrar los datos del sitio, usar otro navegador, otro perfil o una dirección distinta no conserva automáticamente esa misma partida. `localhost:4173` y `127.0.0.1:4173` son almacenamientos distintos: usa la dirección indicada arriba. El servidor local no permite acceso desde el teléfono. El enlace PlayCanvas funciona sin ese servidor; su comportamiento en Android físico todavía no está comprobado.

### T3.3 · paquete Android offline preparado

El proyecto Android está en [`android`](../android). Ejecuta `npm run android:offline` para copiar el motor, la interfaz y las imágenes a `android/app/src/main/assets/`; después `npm run test:android:offline` verifica el manifiesto SHA-256, las rutas locales, la ausencia de red y la persistencia IndexedDB. La actividad no declara `INTERNET` y abre los recursos locales con WebViewAssetLoader.

Java 17, Gradle 8.9 y SDK API 35 están instalados dentro del proyecto. Ya existe [APK de depuración](../android/app/build/outputs/apk/debug/app-debug.apk), con firma verificada. El emulador Android 15 comprobó arranque, guardado y reapertura en modo avión. La importación/exportación usa ahora los selectores nativos de Android; queda validar su interacción en un teléfono físico.

### Primera prueba recomendada

1. Lee «La lista de 26» y recarga antes de elegir: deben mantenerse la escena y sus opciones.
2. Elige una acción y recarga en el resultado: debe mantenerse el mismo resultado y una sola decisión registrada.
3. Pulsa Continuar para volver a Inicio y Simular semana para avanzar. Abre Carrera para comprobar lo que elegiste.
4. Cierra la pestaña, vuelve al mismo enlace y verifica que sigues en la misma escena.
5. Al valorar una escena, anota título, semilla, decisión y qué esperabas que ocurriera. Importa especialmente si entiendes la elección, reconoces la consecuencia y quieres seguir jugando.

Puedes recorrer la carrera actual hasta su cierre. Las opciones genéricas, renovaciones automáticas y epílogos todavía necesitan el trabajo identificado en T1. El visor muestra un resumen de cierre y el recorrido; el epílogo narrativo final se desarrollará en T5. Su guardado usa IndexedDB con copia anterior y verificación de integridad, entregados en T2.3.

## Próximos lugares de prueba

| Entrega | Dónde se probará | Qué demostrará |
|---|---|---|
| Visor del handoff · disponible | Navegador de este ordenador | Escenas interactivas, comandos protegidos y continuidad básica |
| T3.1 · disponible | Launch de la escena PlayCanvas 2593315 | Interfaz visual conectada al motor; elección y recarga verificadas |
| T3.3 | Proyecto Android offline + manifest de recursos | Motor, interfaz, imágenes locales y guardado preparados para compilar |
| T3.4 | APK instalado en un Android de prueba | Misma historia, guardado, arranque y funcionamiento sin conexión medidos en el emulador; teléfono físico pendiente |
| T4 | Demo del primer tramo con contenido revisado | Claridad y atractivo contrastados con personas |
| T7–T8 | Beta y distribución por Google Play | Comportamiento real en dispositivos y candidata para publicación |

El [proyecto PlayCanvas del autor](https://playcanvas.com/project/1598208/overview/historia-jugador) es el espacio previsto para la integración. La escena ya ejecuta el juego mediante Launch; el APK de depuración está compilado y verificado en un emulador Android 15. El enlace local actual no es una publicación en Internet.

### Guardado actualizado durante T2.3

Se conserva una copia anterior en cada cambio. Tu partida → Recuperar copia anterior permite revisarla y confirmar su recuperación. Esa copia se renueva al seguir jugando: descarga una exportación si quieres conservar una carrera concreta. El adaptador IndexedDB ya está comprobado; T2.3 se cerró el 15 de septiembre.

### Actualización del 15 de septiembre: IndexedDB disponible en local

En http://127.0.0.1:4173/ ya funciona el guardado transaccional. La partida local del autor se recuperó en «Cinco minutos más», 6 de julio, una decisión. No se eligieron opciones. La copia antigua se mantiene y puede descargarse desde Tu partida. Las pruebas reales de IndexedDB superaron 100 ciclos.

La actualización también está subida a PlayCanvas. Launch mostró IndexedDB y conservó la carrera online (16 de julio, cuatro decisiones) después de recargar.

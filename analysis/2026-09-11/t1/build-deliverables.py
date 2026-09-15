"""Produce la trazabilidad T1 y el plan por pasadas; no modifica el motor."""
import hashlib
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
A = ROOT / 'analysis/2026-09-11'
OUT = A / 't1'
PROJECT = ROOT / 'project'
DOC = Path('/Users/capitanps/Downloads/Documento_Maestro_Carrera_Futbolista (1).docx')

# La regeneración de T1 no debe borrar avance de pasadas posteriores.
tracking_path = A / 'plan-seguimiento.json'
if tracking_path.exists():
    tracking = json.loads(tracking_path.read_text())
    if tracking.get('revision', 1) > 2 or tracking.get('earnedPercent', 0) > 6:
        raise SystemExit('El plan ya avanzó después de T1; conservar seguimiento y revisar la regeneración.')

def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def link(path, label):
    return f'[{label}](<{path}>)'

text = (A / 'guion-extraido.txt').read_text()
lines = text.splitlines()
catalog = json.loads((A / 'content-audit.json').read_text())['events']
engine = {e['id']: e for e in catalog}
pilot_engine = {e['id']: e for e in json.loads((OUT / 'engine-pilot.json').read_text())}
phase_map = {'20':'18_20', '21':'20_23', '22':'23_26', '23':'26_30', '24':'30_34', '25':'34_plus'}
canonical = []
for i, line in enumerate(lines):
    match = re.search(r'^B(\d+) Heading3 (2[0-5])\..*?\b(EVT_[A-Z0-9_]+)\b', line)
    if not match:
        continue
    end = i + 1
    while end < len(lines) and not re.match(r'^B\d+ Heading[123] ', lines[end]):
        end += 1
    fields = {}
    for row in lines[i + 1:end]:
        if ' | ' in row:
            key, value = row.split(' | ', 1)
            fields[key] = value
    scene_id = match[3]
    source = line.split('Heading3 ', 1)[1]
    title = re.split(r'\s+[—–-]\s+(?=EVT_)', source, maxsplit=1)[0]
    canonical.append({'canonicalId': scene_id, 'sourceBlock': 'B'+match[1], 'sourceHeading': source,
                      'title': title, 'phase': phase_map[match[2]], 'sourceFields': fields,
                      'sourceExcerpt': '\n'.join(lines[i:end]).strip(),
                      'literalEngineId': scene_id if scene_id in engine else None,
                      'mappingStatus': 'literal_id_only' if scene_id in engine else 'unresolved',
                      'semanticReview': 'not_reviewed'})
canon_by_id = {s['canonicalId']: s for s in canonical}

# Juicios de auditoría, separados de las extracciones y de futuras implementaciones.
reviews = [
 ('EVT_18_PRE_001','EVT_18_PRE_001','M','T4',
  'Conserva las tres acciones, personajes y semillas. Los seis resultados usan pesos fijos 55/45, sin modificadores por afinidad o personalidad como pide el canon.',
  'Conservar escena y opciones; añadir influencia contextual acotada, memoria que pueda reaparecer y una prioridad de inicio comprobable.',
  ['Inicio nuevo presenta convocatoria una sola vez antes de escenas que la presuponen.', 'Cambiar afinidad/reserva modifica los pesos pertinentes, conservando incertidumbre.', 'La llamada a Nano y a Rivas dejan recuerdos distintos y recuperables.']),
 ('EVT_18_MED_001','EVT_18_MED_001','L','T4',
  'Conserva cuatro acciones y consecuencias específicas. El evento solo exige BODY_WINDOW y meses: no comprueba por sí mismo la oportunidad por sanción. No tiene modificadores de riesgo. Pedir prueba se resuelve inmediatamente y no guarda una cita futura.',
  'Modelar oportunidad deportiva y prueba pendiente, separar molestia de lesión efectiva y contextualizar riesgo y confianza médica.',
  ['Sin oportunidad verificada no se afirma que Bruno está sancionado.', 'La prueba diferida reaparece en la fecha de juego prevista tras guardar/cargar.', 'Arriesgar permite recuperación o empeoramiento según contexto; el mensaje coincide con el cuerpo simulado.']),
 ('EVT_20_CCH_001','EVT_20_CCH_001','L','T5',
  'El cuerpo identifica promesa y fichaje, pero hay cuatro opciones genéricas, sin gates para esos antecedentes, NPC ni semilla declarada. La opción B no registra esperar tres jornadas.',
  'Recuperar hablar con técnico, esperar tres jornadas, acudir a dirección y sondear con agente. Registrar promesa, competencia y vencimiento de mercado.',
  ['Solo aparece con promesa y competidor pertinentes o contexto adaptado explícito.', 'Esperar consume tres jornadas y puede cerrar mercado.', 'Técnico, dirección y agente recuerdan acciones diferentes sin conocimiento imposible.']),
 ('EVT_21_PRS_001','EVT_21_PRS_001','M','T5',
  'Mismo ID y etiqueta verified, pero decisiones y mensajes genéricos. El gate es mediaHeat >=20 y meses fijos; solo declara PUBLIC_CONTRACT, sin lectura de FIRST_LEAK ni NPC.',
  'Recuperar las cuatro posturas de desmentido, noticia con cifra distinta al salario real, atribución incierta y reacción de club/vestuario.',
  ['Dar cifra exacta y negar sin cifras generan información pública diferente.', 'Pedir corrección al club crea respuesta pendiente y no equivale a publicarla personalmente.', 'Una filtración previa modifica contexto o recuerdo sin revelar automáticamente al culpable.']),
 ('EVT_23_AGT_001','EVT_23_AGT_001','L','T5',
  'Cambia título, usa cuerpo y opciones genéricos, no exige contacto ni interés de mercado. Escribe DIRECT_RECRUIT; no enlaza AGENT_POWER ni identifica interlocutores.',
  'Restituir contacto directo, convocatoria con/sin agente y quién conoce cada conversación. Mantener oportunidad separada de oferta formal.',
  ['Aceptar y avisar después difiere de reenviar antes de contestar.', 'El agente no recuerda una conversación que aún desconoce.', 'No responder mantiene ausencia de compromiso contractual y puede perder oportunidad.']),
 ('EVT_24_MATCH_001','EVT_24_MATCH_001','L','T5',
  'Las cuatro etiquetas sí corresponden al guion, pero el cuerpo es genérico, faltan gates de partido/en campo y los efectos no ejecutan un penalti. Decir que lo tiras tú lleva intentTag patience y mensaje de espera.',
  'Separar decisión de jerarquía, ejecución deportiva con RNG de fútbol e interpretación social con RNG narrativo; corregir intenciones semánticas.',
  ['Solo aparece durante un penalti válido estando en campo.', 'Puede marcarse o fallarse; un gol no borra el conflicto de jerarquía.', 'El resultado del partido y la memoria de PENALTY_HIERARCHY concuerdan tras recargar.']),
 ('EVT_26_BRIDGE_001','EVT_26_IDN_001','M','T5',
  'Falta el ID canónico. El candidato comparte edad, tema y PEAK_IDENTITY, pero título, cuerpo y opciones difieren. No es un alias confirmado.',
  'Resolver correspondencia explícita y recuperar reunión sobre rol, dinero, sucesión y mercado. Conservar historia de saves previos.',
  ['El cruce a 26 ofrece esta reunión una sola vez sin depender de ganar una lotería ordinaria.', 'Pedir rol, negociar dinero y preguntar fichajes cambian información o propuesta distinta.', 'Migración o conservación del ID antiguo impide repetición de la misma escena.']),
 ('EVT_26_MKT_001','EVT_26_MKT_001','L','T5',
  'Igual ID, pero título del motor Quieren construir alrededor de ti coincide temáticamente con otra escena del guion. Opciones genéricas, gate de mercado >=42 y efectos de atributos sin traspaso concreto. Falta PROJECT_FACE entre semillas escritas.',
  'Reconciliar con EVT_27_MKT_001 antes de asignar identidad; crear oferta comparativa, condiciones de refuerzos y espera real.',
  ['Mostrar destino, rol, salario y ambición conocidos sin garantizar títulos.', 'Aceptar mueve club/inscripción/contrato de forma coherente; quedarse no lo hace.', 'Exigir refuerzos crea condición comprobable; esperar puede caducar la oferta.']),
 ('EVT_30_BRIDGE_001','EVT_30_IDN_001','M','T5',
  'Falta ID canónico; candidato con mismo título y VETERAN_LABEL. Sus opciones genéricas no conservan revisión mensual ni partidos prioritarios; no declara AGE30_PRIORITY.',
  'Fijar correspondencia sin reinterpretar historia; representar plan de uso, objeción a etiqueta, petición concreta y observación.',
  ['Al cumplir 30 no se salta el puente por la cuota de eventos ordinarios.', 'La revisión mensual se recuerda; el plan puede proteger o reducir rol.', 'Los datos del hito a 30 no se reescriben al retirarse.']),
 ('EVT_31_RETURN_001','EVT_31_RETURN_001','L','T5',
  'Título coincide pero cuerpo y opciones son genéricos. RECOVERING_INJURY no prueba por sí mismo alta médica y preparación. Fija meses y crea COMEBACK_PACING sin lectura de SURGERY_31.',
  'Distinguir alta, ritmo, recaída, vuelta progresiva y decisión del staff. Activar por retorno real y ofrecer filial/amistoso solo si existe.',
  ['No se presenta como alta con lesión incompatible con jugar.', 'Esperar dos semanas de juego cambia calendario y conserva la decisión pendiente.', 'Preparación y carga afectan la vuelta; cirugía previa tiene consecuencia reconocible.']),
 ('EVT_34_CON_001','EVT_34_CON_001','L','T5',
  'Mismo ID, título Un año o dos, cuerpo genérico y cuatro prioridades. Solo exige seguir jugando. No hay oferta multianual, cláusula, NPC ni semillas y cada elección tiene un resultado determinista genérico.',
  'Implementar oferta y cláusula de salida, contraoferta bilateral, alternativa anual y rechazo. Diferenciar firmar condiciones de su desenlace futuro.',
  ['Solo aparece con oferta multianual que contiene cláusula identificable.', 'Bilateral y unilateral conceden derechos distintos; rechazar no firma nada.', 'Una caída posterior de rol ejecuta o no la cláusula según términos, dejando memoria y epílogo.']),
 ('EVT_RET_LASTMATCH_001','EVT_RET_LAST_001','L','T5',
  'Falta ID canónico; candidato de mismo título reduce cuatro opciones a dos. PLAY activa LAST_MATCH_PLAYED y cierra carrera directamente sin comprobar disponibilidad o decisión del entrenador en la resolución.',
  'Restituir petición condicionada, aceptación técnica, minutos según marcador y renuncia por lesión; separar solicitud, autorización, partido y cierre.',
  ['Pedir jugar estando no apto no garantiza participación ni gol.', 'Probar despedida completa, pocos minutos y ninguna participación con sus condiciones.', 'Cada cierre permite epílogo coherente, sin perder resultado tras interrupción.']),
]

pilot = []
for n, (cid, eid, size, stage, finding, repair, acceptance) in enumerate(reviews, 1):
    src = canon_by_id[cid]
    e = pilot_engine[eid]
    source_files = []
    for path in sorted((ROOT/'src/content/events').rglob('*.ts')):
        for number, line in enumerate(path.read_text().splitlines(), 1):
            if f'"{eid}"' in line:
                source_files.append({'path':str(path.relative_to(ROOT)), 'line':number})
                break
    row = {'pilotId':f'P{n:02}', 'canonicalId':cid, 'engineId':eid,
           'phase':src['phase'], 'sourceBlock':src['sourceBlock'], 'sourceHeading':src['sourceHeading'],
           'mappingStatus':'literal_id_semantically_reviewed' if cid==eid else 'candidate_not_approved',
           'implementationStatus':'repair_required', 'complexity':size, 'plannedStage':stage,
           'finding':finding, 'repair':repair, 'acceptanceCriteria':acceptance,
           'canonFields':src['sourceFields'], 'engineTitle':e['text']['title'],
           'engineChoices':[c['label'] for c in e['choices']], 'engineSource':source_files}
    pilot.append(row)
    src['semanticReview'] = 'pilot_repair_required'
    if cid != eid:
        src['candidateEngineId'] = eid
        src['candidateStatus'] = 'not_approved'

inventory = {'method':'254 principales extraídos de Heading3. Igualdad de ID no acredita equivalencia semántica. Los 134 condicionales se inventarían semánticamente en T5.1; no se declaran revisados en T1.',
             'sourceDocSha256': hashlib.sha256(DOC.read_bytes()).hexdigest(),
             'sourceManifest':'analysis/2026-09-11/source-manifest.json',
             'canonicalPrincipalCount':len(canonical),
             'literalMatches':sum(s['literalEngineId'] is not None for s in canonical),
             'unresolvedLiteralCount':sum(s['literalEngineId'] is None for s in canonical),
             'semanticPilotCount':len(pilot), 'scenes':canonical,
             'engineIdsWithoutLiteralCanonicalPrincipal':[e['id'] for e in catalog if e['id'].startswith('EVT_') and e['id'] not in canon_by_id]}
dump(OUT/'principal-traceability.json',inventory)
dump(OUT/'pilot-review.json',pilot)

md = ['# T1 · Auditoría de doce escenas', '',
      'Muestra intencional de dos escenas principales por cada uno de los seis tramos. Se incluyen relaciones, lesión, entrenador, prensa, agente, partido, mercado, madurez, contrato y retirada. No es una muestra estadística ni acredita fidelidad de las otras 376 escenas.', '',
      'Resultado: las doce necesitan alguna reparación. Tres conservan las acciones concretas del guion (convocatoria, aductor y penalti), con diferencias de resolución o contexto. Nueve sustituyen o reducen las acciones. Hay tres candidatos con ID diferente; ninguno se autoriza como alias por esta auditoría. Complejidad M: reparación focalizada; L: depende de lógica de mundo, memoria o acciones diferidas. Esta clasificación estima dificultad, no pasadas consumidas.', '',
      f'Inventario completo de principales: **{len(canonical)}**, **{inventory["literalMatches"]}** coincidencias literales y **{inventory["unresolvedLiteralCount"]}** sin el mismo ID. Solo doce están revisados semánticamente. La etiqueta `verified` del motor no sustituye esta revisión.', '',
      'Los localizadores B pertenecen a la extracción conservada de este DOCX, no son números de página. Las fichas distinguen lo que pide el guion, lo que ejecuta la definición actual y la reparación pendiente.', '',
      link(A/'guion-extraido.txt','Guion extraído')+' · '+link(OUT/'engine-pilot.json','Definiciones actuales completas')+' · '+link(OUT/'principal-traceability.json','Inventario de 254 principales'), '']
for s in pilot:
    md += [f'## {s["pilotId"]} · {s["sourceHeading"]}', '',
           f'Fuente: {s["sourceBlock"]}. Motor: `{s["engineId"]}`. Correspondencia: {s["mappingStatus"]}. Complejidad: {s["complexity"]}. Reparación: {s["plannedStage"]}.', '',
           '**Decisiones del guion:** '+s['canonFields'].get('Opciones jugables','No extraídas'), '',
           '**Disparador del guion:** '+s['canonFields'].get('Ventana / disparador','No extraído'), '',
           '**Memoria del guion:** '+s['canonFields'].get('Memoria / semillas','No extraída'), '',
           '**Decisiones actuales:** '+' / '.join(s['engineChoices']), '',
           '**Hallazgo:** '+s['finding'], '', '**Reparación definida:** '+s['repair'], '',
           '**Aceptación futura:**', ''] + ['- '+x for x in s['acceptanceCriteria']] + ['']
    md += ['Fuente de implementación: '+', '.join(link(f'{ROOT / x["path"]}:{x["line"]}',x['path'].split('/')[-1]) for x in s['engineSource']), '']
md += ['## Decisión para los lotes', '',
       'No convertir 388 títulos en 388 escenas terminadas. Cada lote deberá dejar decisiones, condiciones, consecuencias y memoria comprobadas. Si requiere un subsistema nuevo, se separa la pasada de infraestructura y se reduce el lote; no se genera una plantilla genérica para mantener la cifra. T1 solo auditó: el ritmo de implementación se medirá con el primer lote de T4.', '']
(PROJECT/'T1_AUDITORIA_12_ESCENAS.md').write_text('\n'.join(md))

def entry(name, done, external=False):
    return {'title':name,'acceptance':done,'externalEvidenceRequired':external}

stage_data = [
 ('T1','Alcance y trazabilidad piloto',6,1,1,[
  entry('Definir alcance, auditar piloto y recalibrar plan','Alcance y contrato escritos, 12 fichas con reparación, 254 IDs inventariados y plan validado')]),
 ('T2','Sesión y guardado',11,4,6,[
  entry('Base reproducible y GameSession','Build identificado; evento pendiente, consultas puras, revisión y comandos protegidos con pruebas'),
  entry('Validación de guardados y migraciones','Rechazo de corrupción y casos de cada versión declarada compatible'),
  entry('Persistencia transaccional y recuperación','100 ciclos pendientes, interrupciones antes/después de commit y reintento sin doble efecto'),
  entry('Ofertas y autoridad del jugador','Proponer, aceptar, rechazar o delegar sin firmas silenciosas'),
  entry('Hitos de edad y gates fiables','Instantáneas históricas preservadas, gates con exit code fallido y regresión de integración')]),
 ('T3','Demo PlayCanvas en Android',11,3,6,[
  entry('Adaptador web y escena de decisión','Escena, estado y resultado muestran solo datos conocidos; equivalencia con motor'),
  entry('Presentación y continuidad','Texto largo, tacto, atrás, pausa y reanudación comprobados en navegador'),
  entry('Empaquetado Android offline','APK compilado con recursos locales y guardado funcional'),
  entry('Ensayo en Android y decisión de presentación','APK instalado, misma historia y medición de latencia/inicio en teléfono; resolver fallos del ensayo',True)]),
 ('T4','Primer tramo y atractivo',11,6,10,[
  entry('Cadena piloto de memoria y consecuencia diferida','Creación, reaparición y cierre; NPC recuerda información que pudo conocer'),
  *[entry(f'Lote 18–20 {i+1}: {min(12,44-i*12)} escenas', 'Fuente, acciones, gates y consecuencias específicos; pruebas dirigidas y continuidad') for i in range(4)],
  entry('Ciclo de juego y tutorial','Pantallas esenciales y resumen de partido integrados; sin lectura de códigos internos'),
  entry('Observación humana y mejora 1','Recoger comprensión, deseo de continuar y fricción; implementar correcciones',True),
  entry('Observación humana y mejora 2','8–12 participantes entre rondas; contrastar J01/J02 y recalibrar lotes',True)]),
 ('T5','Carrera completa, memoria y epílogos',33,32,48,[
  entry('Reconciliación completa e identidad del contenido','134 condicionales y 87 IDs discrepantes reconciliados; sin equivalencias silenciosas'),
  entry('Ciclo de vida de semillas','Transiciones y consumidores/cierres con pruebas de repetición y caducidad'),
  entry('Personajes y conocimiento','Agenda, acceso, recuerdos y relaciones coherentes con acontecimientos'),
  entry('Consecuencias diferidas entre tramos','Promesas, cirugía, contratos y decisiones que sobreviven cambios de edad/club'),
  *[entry(f'Lote {phase} {i+1}: {min(12,count-i*12)} escenas', 'Ficha canónica reconciliada, implementación específica, memoria y pruebas de cada escena')
    for phase,count in [('20–23',51),('23–26',60),('26–30',75),('30–34',76),('34+',82)] for i in range(math.ceil(count/12))],
  entry('Retirada y compatibilidad de familias','Estados de cierre y combinaciones de finales sin contradicción'),
  entry('Epílogos con hechos de la carrera','Hitos relevantes redactados y trazables, con variantes de recuerdos y relaciones'),
  entry('Auditoría cruzada de contenido completo','388 escenas revisadas, 210 semillas con destino y 20 NPC trazables; integración entre tramos')]),
 ('T6','Alfa y balance',11,3,5,[
  entry('Perfiles semánticos y cobertura','15 perfiles seleccionan intención real; casos raros con estados dirigidos'),
  entry('Simulación estratificada y diagnóstico','Lote inicial para medir coste y hasta 10000 carreras en candidata; cobertura y distribución explícitas'),
  entry('Corrección de balance y carreras largas','Eliminar bloqueos, vacíos de oportunidades y estados imposibles reproducibles'),
  entry('Validación narrativa de la alfa','20 epílogos auditados y contraste de rutas, densidad y efectos diferidos')]),
 ('T7','Beta Android',8,2,4,[
  entry('Matriz de dispositivos e interrupción','Tres teléfonos de distinta capacidad; actualización, modo avión y guardado',True),
  entry('Rendimiento, accesibilidad y correcciones','Límites medidos, texto ampliado, navegación y problemas detectados corregidos',True),
  entry('Cierre de beta','Cinco carreras humanas completas; cero incidencias críticas o altas abiertas',True)]),
 ('T8','Publicación',7,2,4,[
  entry('Candidata y ficha de tienda','AAB firmado, capturas reales, clasificación y declaraciones coherentes'),
  entry('Pruebas y preparación de envío','Evidencia de pruebas exigibles, cuenta y firma listas; paquete concreto revisable',True),
  entry('Revisión y disponibilidad','Resolver observaciones y verificar disponibilidad real para público acordado',True)]),
 ('T9','Estabilización',2,2,3,[
  entry('Diagnóstico de producción','Revisar evidencia real del periodo de observación de 14 días y resolver incidencias',True),
  entry('Cierre y mantenimiento','Actualización con saves preservados, cero fallos graves y guía de producción/recuperación',True)])
]

stages = []
cumulative = 0
for sid,title,weight,low,high,entries in stage_data:
    cumulative += weight
    # Reparto exacto en centésimas, fijado antes de ejecutar subpasadas.
    units, remainder = divmod(weight*100,len(entries))
    passes = []
    for i,e in enumerate(entries):
        passes.append({'id':sid if sid=='T1' else f'{sid}.{i+1}', **e,
                       'weightPercent':(units+(i<remainder))/100,
                       'status':'complete' if sid=='T1' else 'not_started',
                       'earnedPercent':weight if sid=='T1' else 0})
    stages.append({'id':sid,'title':title,'status':'complete' if sid=='T1' else 'not_started',
                   'baselinePasses':len(entries),'rangePasses':[low,high],
                   'weightPercent':weight,'cumulativeTargetPercent':cumulative,
                   'earnedPercent':weight if sid=='T1' else 0,
                   'dependencies':[] if sid=='T1' else [f'T{int(sid[1:])-1}'], 'passes':passes})
baseline = sum(s['baselinePasses'] for s in stages)
low,high = (sum(s['rangePasses'][i] for s in stages) for i in (0,1))
plan = {'baselineDate':'2026-09-11','revision':2,'product':'Carrera de Futbolista Android v1',
        'authority':'Instrucción del usuario: planificación en pasadas del asistente; ejecutar T1.',
        'baselineStatus':'engineering_baseline_provisional_until_first_implemented_content_batch',
        'unit':'Una pasada es un paquete acotado de trabajo del asistente con entregable y comprobación; no una llamada de herramienta, un día ni una cantidad fija de tokens.',
        'percentageMeaning':'Avance ponderado de entregables T1–T9 desde la auditoría T0; no madurez histórica del motor ni diversión. Los pesos de hito no son proporcionales al número de pasadas.',
        'baselinePasses':baseline,'rangePasses':[low,high],
        'contingencyPasses':math.ceil(baseline*.2),'completedPasses':1,'remainingBaselinePasses':baseline-1,
        'earnedPercent':6,'nextPass':'T2.1',
        'externalEvidencePolicy':'Esperas de tienda, participación humana y pruebas físicas se registran aparte y no se reemplazan por pasadas. Preparar artefacto no acredita la evidencia externa.',
        'recalibration':'Tras T2, T3 y primer lote implementado T4; también tras dos pasadas consecutivas sin cerrar su entrega o desviación prevista >20%. Conservar línea base y registrar previsión nueva.',
        'stages':stages}
dump(A/'plan-seguimiento.json',plan)

plan_md = ['# Plan de ejecución por pasadas · revisión 2', '',
           '**T1 completada. Avance ganado: 6 %. Siguiente: T2.1.**', '',
           'Esta revisión sustituye la estimación anterior basada en disponibilidad humana. T1–T9 identifican etapas; T2.1, T2.2, etc. identifican mis pasadas ejecutables. Cada una contiene trabajo, comprobación y registro. Una pasada difícil se divide si lo exige la evidencia; no se cierra por haber consumido una respuesta.', '',
           f'Previsión inicial: **{baseline} pasadas en total**, incluida T1; quedan **{baseline-1}**. Rango de trabajo previsto: **{low}–{high}**; reserva adicional de **{plan["contingencyPasses"]}** pasadas para correcciones del alcance previsto. La base más reserva es {baseline+plan["contingencyPasses"]}; el rango y la reserva describen incertidumbre y no se suman automáticamente entre sí. No hay un máximo garantizado. Demo Android: diez pasadas contando T1, sujeta a acceso al dispositivo y herramientas.', '',
           'La previsión tiene confianza limitada hasta implementar el primer lote. El dato observado hoy es una pasada de alcance con doce comparaciones, no doce escenas reparadas. La base divide las 388 escenas en cuatro lotes de 18–20 y 31 lotes posteriores, de hasta doce escenas. Añade trabajo separado para sesión, presentación, memoria, personajes, epílogos y verificación. Compartir infraestructura puede reducir lotes; dependencias nuevas o reescrituras pueden aumentarlos.', '',
           '| Etapa | Pasadas base | Rango | Peso | Acumulado al cerrar | Estado |',
           '|---|---:|---:|---:|---:|---|']
for s in stages:
    plan_md.append(f'| {s["id"]} · {s["title"]} | {s["baselinePasses"]} | {s["rangePasses"][0]}–{s["rangePasses"][1]} | {s["weightPercent"]} % | {s["cumulativeTargetPercent"]} % | {"Completada" if s["status"]=="complete" else "Pendiente"} |')
plan_md += ['', '## Reglas para cumplir el plan', '',
            '- El porcentaje se gana al cumplir el criterio de la subpasada. La distribución exacta está en el JSON; trabajar parcialmente no gana su peso completo.',
            '- Mantengo los pesos de hito de T0 para conservar continuidad. Miden entrega del producto; una pasada de contenido y una de integración no tienen el mismo peso.',
            '- Cada cierre informa: cambios, comprobaciones, defectos pendientes, porcentaje y siguiente pasada. Los criterios se fijan antes de implementar.',
            '- Si una pasada requiere un subsistema no previsto, lo registro y divido el trabajo. Dos pasadas consecutivas sin cerrar su entrega o una previsión que crezca más del 20 % obligan a recalibrar con motivo explícito.',
            '- Tras T2, T3 y el primer lote implementado de T4 reviso el número de pasadas restante. Los lotes solo se aceleran manteniendo evidencia de fidelidad y comportamiento.',
            '- La revisión visual del autor se incorpora cuando llegue su interfaz. No se atribuye diversión a pruebas automáticas.',
            '- Instalación física, participantes, cuenta/firma y revisión de tienda se registran como dependencias externas. Una espera no consume una pasada ni gana porcentaje. Los periodos reales exigidos para pruebas o estabilización conservan su duración.',
            '- Antes de cualquier envío público no autorizado se deja la candidata concreta preparada para revisión. El trabajo técnico y los borradores continúan dentro del alcance.',
            '- Este plan organiza la ejecución de la tarea; no crea una automatización ni supone trabajo entre intervenciones.', '',
            '## Pasadas y criterios de cierre', '']
for s in stages:
    plan_md += [f'### {s["id"]} · {s["title"]}', '']
    for p in s['passes']:
        ext = ' Requiere evidencia externa.' if p['externalEvidenceRequired'] else ''
        plan_md += [f'- **{p["id"]} — {p["title"]}.** {p["acceptance"]}.{ext}']
    plan_md += ['']
plan_md += ['## Cierre T1', '',
            'Completados: alcance Android y flujo funcional; contrato de sesión/persistencia; doce escenas contrastadas con el canon y reparación definida; inventario de los 254 IDs principales; línea base por pasadas y criterios. Los tres posibles alias del piloto siguen pendientes de decisión técnica con migración. No se considera terminada ninguna reparación de contenido por haber documentado el defecto.', '',
            link(PROJECT/'T1_ALCANCE_Y_CONTRATO.md','Alcance y contrato')+' · '+link(PROJECT/'T1_AUDITORIA_12_ESCENAS.md','Doce fichas de auditoría')+' · '+link(A/'plan-seguimiento.json','Seguimiento estructurado'), '']
(PROJECT/'PLAN_PASADAS.md').write_text('\n'.join(plan_md))
print(json.dumps({'canonical':len(canonical),'literal':inventory['literalMatches'],'unresolved':inventory['unresolvedLiteralCount'],'pilot':len(pilot),'baselinePasses':baseline,'range':[low,high],'T5Passes':stages[4]['baselinePasses']},ensure_ascii=False))

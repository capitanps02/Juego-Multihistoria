"""Comprueba consistencia de los entregables T1; no es un test del videojuego."""
import hashlib
import json
import re
from collections import Counter
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
A = ROOT/'analysis/2026-09-11'
T = A/'t1'
load = lambda p: json.loads(p.read_text())
plan = load(A/'plan-seguimiento.json')
inventory = load(T/'principal-traceability.json')
pilot = load(T/'pilot-review.json')
engine = load(T/'engine-pilot.json')
checks = []

def check(name, condition):
    checks.append({'name':name,'passed':bool(condition)})

stages = plan['stages']
passes = [p for s in stages for p in s['passes']]
check('68 pasadas únicas y 67 pendientes', len(passes)==68 and len({p['id'] for p in passes})==68 and sum(p['status']=='not_started' for p in passes)==67)
check('Pesos de etapas suman 100',sum(s['weightPercent'] for s in stages)==100)
check('Pesos de subpasadas suman cada etapa',all(sum(Decimal(str(p['weightPercent'])) for p in s['passes'])==s['weightPercent'] for s in stages))
check('Avance ganado coherente en los tres niveles',sum(Decimal(str(p['earnedPercent'])) for p in passes)==sum(s['earnedPercent'] for s in stages)==plan['earnedPercent']==6)
seen = set()
acyclic = True
cum = 0
for s in stages:
    acyclic &= all(d in seen for d in s['dependencies'])
    seen.add(s['id'])
    cum += s['weightPercent']
    check('Acumulado '+s['id'],cum==s['cumulativeTargetPercent'])
check('Dependencias ordenadas sin ciclos',acyclic)
check('Todas las pasadas tienen aceptación',all(p['acceptance'] for p in passes))
check('Límites y previsión coherentes',all(s['rangePasses'][0]<=s['baselinePasses']<=s['rangePasses'][1] for s in stages) and plan['rangePasses']==[sum(s['rangePasses'][i] for s in stages) for i in (0,1)])
check('Solo T1 figura terminada', [p['id'] for p in passes if p['status']=='complete']==['T1'])
check('Sin unidades de calendario de trabajo heredadas',not any('Hours' in k or 'Weeks' in k for k in plan))
check('254 principales únicos',len(inventory['scenes'])==len({s['canonicalId'] for s in inventory['scenes']})==254)
check('167 coincidencias y 87 pendientes literales',sum(s['literalEngineId'] is not None for s in inventory['scenes'])==167 and sum(s['literalEngineId'] is None for s in inventory['scenes'])==87)
check('Doce fichas únicas, dos por tramo',len(pilot)==len({s['canonicalId'] for s in pilot})==12 and sorted(Counter(s['phase'] for s in pilot).values())==[2]*6)
check('Tres candidatos sin alias aplicado',sum(s['mappingStatus']=='candidate_not_approved' for s in pilot)==3)
check('Doce reparaciones con criterios y fuente',all(s['repair'] and len(s['acceptanceCriteria'])>=3 and s['engineSource'] and s['canonFields'].get('Opciones jugables') for s in pilot))
check('Extracciones actuales coinciden con fichas',{e['id'] for e in engine}=={p['engineId'] for p in pilot})
check('Ninguna reparación aparece implementada',all(s['implementationStatus']=='repair_required' for s in pilot))
manifest = load(A/'source-manifest.json')
changed = [name for name,digest in manifest.items() if hashlib.sha256((ROOT/name).read_bytes()).hexdigest()!=digest]
check('Fuentes del motor coinciden con la base auditada',not changed)
broken = []
for doc in (ROOT/'project').glob('*.md'):
    for match in re.finditer(r'\]\(<?(/[^)]+?)>?\)',doc.read_text()):
        target = re.sub(r':\d+$','',match[1].rstrip('>'))
        if not Path(target).exists():
            broken.append({'doc':doc.name,'target':target})
check('Enlaces locales de entregables existen',not broken)
result = {'scope':'Verificación de artefactos T1; las pruebas funcionales anteriores no se han vuelto a ejecutar porque T1 no modifica el motor.',
          'passed':all(c['passed'] for c in checks),'checks':checks,'changedSourceFiles':changed,'brokenLinks':broken,
          'earnedPercent':6,'nextPass':'T2.1'}
(T/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'passed':result['passed'],'checks':len(checks),'failures':[c['name'] for c in checks if not c['passed']]},ensure_ascii=False))
raise SystemExit(0 if result['passed'] else 1)

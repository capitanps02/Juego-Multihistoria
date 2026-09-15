import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const serial = process.argv[2];
if (!serial?.startsWith('emulator-')) throw Error('Indica el serial de un emulador dedicado; esta prueba no opera teléfonos.');
const adb = path.join(root, '.android-tools/sdk/platform-tools/adb');
const apk = path.join(root, 'android/app/build/outputs/apk/debug/app-debug.apk');
const testApk = path.join(root, 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk');
const report = {
  pass: 'T3.4', serial,
  apkSha256: createHash('sha256').update(fs.readFileSync(apk)).digest('hex'),
  startup: {}, phases: [], passed: false,
  physicalDevicePending: true
};
const call = (...args) => execFileSync(adb, ['-s', serial, ...args], {encoding: 'utf8', timeout: 120000});
const parseStartup = output => {
  const match = output.match(/TotalTime:\s*(\d+)/);
  return match ? Number(match[1]) : null;
};
try {
  const bootDeadline = Date.now() + 120000;
  while (call('shell', 'getprop', 'sys.boot_completed').trim() !== '1') {
    if (Date.now() > bootDeadline) throw Error('Android no terminó de arrancar');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  report.device = call('shell', 'getprop', 'ro.build.fingerprint').trim();
  report.webview = call('shell', 'dumpsys', 'webviewupdate');
  call('install', '-r', apk); call('install', '-r', testApk);
  call('shell', 'cmd', 'connectivity', 'airplane-mode', 'enable');
  report.airplaneMode = call('shell', 'settings', 'get', 'global', 'airplane_mode_on').trim();
  if (report.airplaneMode !== '1') throw Error('No se activó modo avión');

  call('shell', 'am', 'force-stop', 'com.multihistoria');
  const cold = call('shell', 'am', 'start', '-W', '-n', 'com.multihistoria/.MainActivity');
  report.startup.coldTotalTimeMs = parseStartup(cold);
  report.startup.coldOutput = cold;
  const warm = call('shell', 'am', 'start', '-W', '-n', 'com.multihistoria/.MainActivity');
  report.startup.warmTotalTimeMs = parseStartup(warm);
  report.startup.warmOutput = warm;

  for (const phase of ['create', 'resume']) {
    call('shell', 'am', 'force-stop', 'com.multihistoria');
    if (phase === 'create') call('shell', 'pm', 'clear', 'com.multihistoria');
    const output = call('shell', 'am', 'instrument', '-r', '-w', '-e', 'phase', phase,
      'com.multihistoria.test/com.multihistoria.OfflineProbe');
    report.phases.push({phase, output});
    console.log(output);
    if (!output.includes('PASS ' + phase + ':') || !output.includes('INSTRUMENTATION_CODE: -1')) {
      throw Error('Falló fase ' + phase);
    }
    const startup = output.match(/startupMs=(\d+)/);
    if (startup) report.phases.at(-1).startupMs = Number(startup[1]);
  }
  report.passed = report.startup.coldTotalTimeMs !== null && report.startup.warmTotalTimeMs !== null;
} catch (error) {
  report.error = error.message;
  process.exitCode = 1;
} finally {
  fs.writeFileSync(path.join(root, 'analysis/2026-09-15/T3.4-android-runtime.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({passed: report.passed, error: report.error}));
}

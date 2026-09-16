import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const serial = process.argv[2];
if (!serial) throw Error('Indica el serial ADB del teléfono físico.');
if (serial.startsWith('emulator-')) throw Error('Este recolector es solo para teléfono físico; usa test:android:t34 para emulador.');

const localAdb = path.join(root, '.android-tools/sdk/platform-tools/adb');
const sdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
const sdkAdb = sdkRoot ? path.join(sdkRoot, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb') : null;
const adb = fs.existsSync(localAdb) ? localAdb : (sdkAdb && fs.existsSync(sdkAdb) ? sdkAdb : 'adb');
const apk = path.join(root, 'android/app/build/outputs/apk/debug/app-debug.apk');
const reportPath = path.join(root, 'analysis/2026-09-15/T3.4-physical-evidence.json');
const call = (...args) => execFileSync(adb, ['-s', serial, ...args], {encoding: 'utf8', timeout: 120000});
const prop = key => call('shell', 'getprop', key).trim();
const parseStartup = output => {
  const total = output.match(/TotalTime:\s*(\d+)/);
  const wait = output.match(/WaitTime:\s*(\d+)/);
  return {totalTimeMs: total ? Number(total[1]) : null, waitTimeMs: wait ? Number(wait[1]) : null, raw: output.trim()};
};
const parsePackage = output => ({
  versionName: output.match(/versionName=([^\s]+)/)?.[1] ?? null,
  versionCode: output.match(/versionCode=(\d+)/)?.[1] ?? null
});
const firstLineMatching = (text, pattern) => text.split(/\r?\n/).map(line => line.trim()).find(line => pattern.test(line)) ?? null;

const report = {
  pass: 'T3.4-physical-evidence',
  serial,
  collectedAt: new Date().toISOString(),
  physicalDevice: false,
  t34Closed: false,
  status: 'collecting',
  destructiveActionsPerformed: false,
  apk: null,
  device: {},
  installedPackage: {},
  startup: {},
  manualChecks: {
    airplaneModeOfflinePlay: false,
    createAdvanceDecision: false,
    closeAndResume: false,
    androidBack: false,
    exportSaved: false,
    exportCancelled: false,
    importValid: false,
    rejectCorruptJsonWithoutLoss: false,
    recoverPreviousCopy: false,
    safeAreasAndLongText: false,
    systemPickers: false
  }
};

try {
  const state = call('get-state').trim();
  if (state !== 'device') throw Error(`ADB no ve el dispositivo como listo: ${state}`);
  const qemu = [prop('ro.kernel.qemu'), prop('ro.boot.qemu')].filter(Boolean);
  if (qemu.includes('1')) throw Error('ADB identifica este dispositivo como emulador; T3.4 exige hardware físico.');

  report.device = {
    manufacturer: prop('ro.product.manufacturer'),
    model: prop('ro.product.model'),
    device: prop('ro.product.device'),
    androidRelease: prop('ro.build.version.release'),
    sdk: Number(prop('ro.build.version.sdk')),
    fingerprint: prop('ro.build.fingerprint')
  };
  report.physicalDevice = true;

  const webviewDump = call('shell', 'dumpsys', 'webviewupdate');
  report.device.webView = firstLineMatching(webviewDump, /Current WebView package|com\.google\.android\.webview|com\.android\.webview/i);

  const packageDump = call('shell', 'dumpsys', 'package', 'com.multihistoria');
  report.installedPackage = parsePackage(packageDump);
  report.installedPackage.path = call('shell', 'pm', 'path', 'com.multihistoria').trim() || null;

  if (fs.existsSync(apk)) {
    const bytes = fs.readFileSync(apk);
    report.apk = {
      path: path.relative(root, apk),
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex')
    };
  }

  call('shell', 'am', 'force-stop', 'com.multihistoria');
  report.startup.cold = parseStartup(call('shell', 'am', 'start', '-W', '-n', 'com.multihistoria/.MainActivity'));
  report.startup.warm = parseStartup(call('shell', 'am', 'start', '-W', '-n', 'com.multihistoria/.MainActivity'));

  report.status = 'metadata_collected';
} catch (error) {
  report.status = 'error';
  report.error = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  fs.mkdirSync(path.dirname(reportPath), {recursive: true});
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({status: report.status, physicalDevice: report.physicalDevice, t34Closed: report.t34Closed, report: path.relative(root, reportPath)}));
}

import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const serial=process.argv[2];
if(!serial?.startsWith('emulator-')) throw Error('Indica el serial de un emulador dedicado; esta prueba no opera teléfonos.');
const sdk=process.env.ANDROID_SDK_ROOT||process.env.ANDROID_HOME||path.join(root,'.android-tools','sdk');
const adb=path.join(sdk,'platform-tools',process.platform==='win32'?'adb.exe':'adb');
if(!fs.existsSync(adb)) throw Error('adb not found at '+adb);
const apk=path.join(root,'android/app/build/outputs/apk/debug/app-debug.apk');
const testApk=path.join(root,'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk');
const report={pass:'T3.3',serial,apkSha256:createHash('sha256').update(fs.readFileSync(apk)).digest('hex'),phases:[],passed:false};
const call=(...args)=>{
  try{return execFileSync(adb,['-s',serial,...args],{encoding:'utf8',timeout:180000});}
  catch(error){
    const details=[error?.stdout,error?.stderr].filter(Boolean).join('\n');
    if(details)console.error(details);
    if(details)error.message+='\n'+details;
    throw error;
  }
};
try {
  const bootDeadline=Date.now()+120000;
  while(call('shell','getprop','sys.boot_completed').trim()!=='1') {
    if(Date.now()>bootDeadline) throw Error('Android no terminó de arrancar');
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  report.device=call('shell','getprop','ro.build.fingerprint').trim();
  call('install','-r',apk); call('install','-r',testApk);
  report.webview=call('shell','dumpsys','webviewupdate');
  const packageDump=call('shell','dumpsys','package','com.multihistoria');
  report.internetPermissionRequested=/android\\.permission\\.INTERNET/.test(packageDump);
  if(report.internetPermissionRequested) throw Error('Android package unexpectedly requests INTERNET permission');
  report.offlineEnforcement={
    internetPermission:false,
    origin:'https://appassets.androidplatform.net/assets/',
    cspConnectSrc:'none'
  };
  for(const phase of ['create','resume','lifecycle']) {
    if(phase==='resume') call('shell','am','force-stop','com.multihistoria');
    const output=call('shell','am','instrument','-r','-w','-e','phase',phase,'com.multihistoria.test/com.multihistoria.OfflineProbe');
    report.phases.push({phase,output}); console.log(output);
    if(!output.includes('PASS '+phase+':') || !output.includes('INSTRUMENTATION_CODE: -1')) throw Error('Falló fase '+phase);
  }
  report.passed=true;
} catch(error) {report.error=error.message;process.exitCode=1;}
finally {
  fs.writeFileSync(path.join(root,'analysis/2026-09-15/T3.3-android-runtime.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,error:report.error}));
}

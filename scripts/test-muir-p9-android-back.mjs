import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const serial=process.argv[2];
if(!serial?.startsWith('emulator-'))throw Error('P9 Android Back requires a dedicated emulator serial.');
const sdk=process.env.ANDROID_SDK_ROOT||process.env.ANDROID_HOME||path.join(root,'.android-tools','sdk');
const adb=path.join(sdk,'platform-tools',process.platform==='win32'?'adb.exe':'adb');
if(!fs.existsSync(adb))throw Error('adb not found at '+adb);
const apk=path.join(root,'android/app/build/outputs/apk/debug/app-debug.apk');
const testApk=path.join(root,'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk');
for(const file of [apk,testApk])if(!fs.existsSync(file))throw Error('Missing APK: '+file);
const call=(...args)=>execFileSync(adb,['-s',serial,...args],{encoding:'utf8',timeout:180000});
const report={gate:'P9_ANDROID_BACK',serial,passed:false};
try{
  const deadline=Date.now()+180000;
  while(call('shell','getprop','sys.boot_completed').trim()!=='1'){
    if(Date.now()>deadline)throw Error('Android emulator did not finish booting');
    await new Promise(r=>setTimeout(r,1500));
  }
  report.device=call('shell','getprop','ro.build.fingerprint').trim();
  report.webview=call('shell','dumpsys','webviewupdate');
  call('install','-r',apk);
  call('install','-r',testApk);
  try{call('shell','pm','clear','com.multihistoria');}catch{}
  const output=call('shell','am','instrument','-r','-w','-e','phase','p9back','com.multihistoria.test/com.multihistoria.OfflineProbe');
  report.output=output;
  if(!output.includes('PASS p9back:')||!output.includes('INSTRUMENTATION_CODE: -1'))throw Error('Android P9 Back instrumentation failed\n'+output);
  report.passed=true;
}catch(error){
  report.error=error.message;
  report.stdout=error?.stdout?.toString?.()??null;
  report.stderr=error?.stderr?.toString?.()??null;
  if(report.stdout)console.error('ANDROID_BACK_STDOUT\n'+report.stdout);
  if(report.stderr)console.error('ANDROID_BACK_STDERR\n'+report.stderr);
  process.exitCode=1;
}finally{
  const dir=path.join(root,'analysis','muir','p9','evidence');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'p9-android-back.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({gate:report.gate,passed:report.passed,error:report.error??null}));
}

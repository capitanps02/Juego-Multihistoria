package com.multihistoria;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;
import org.json.JSONObject;
import java.lang.reflect.Field;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/** Runs only from the separate test APK on a dedicated emulator. */
public class OfflineProbe extends Instrumentation {
    private String phase;
    private WebView web;
    private static final String ROOT = "document.querySelector('#game')?.shadowRoot";
    @Override public void onCreate(Bundle args) {
        super.onCreate(args); phase = args.getString("phase", "create"); start();
    }
    private String lastStep = "init";
    private void step(String value) { lastStep=value; }
    private boolean canGoBackOnMain() {
        AtomicReference<Boolean> value = new AtomicReference<>(false);
        runOnMainSync(() -> value.set(web != null && web.canGoBack()));
        return Boolean.TRUE.equals(value.get());
    }
    private String js(String source) throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> value = new AtomicReference<>();
        runOnMainSync(() -> web.evaluateJavascript(source, result -> { value.set(result); done.countDown(); }));
        if (!done.await(10, TimeUnit.SECONDS)) throw new Exception("JavaScript timeout at "+lastStep+" source="+source);
        return value.get();
    }
    private void until(String expression) throws Exception {
        long end = System.currentTimeMillis() + 30000;
        while(System.currentTimeMillis() < end) {
            if("true".equals(js("Boolean(" + expression + ")"))) return;
            Thread.sleep(200);
        }
        throw new Exception("Timeout: " + expression + " UI=" + js(ROOT+"?.textContent"));
    }
    private void untilFast(String expression, long timeoutMs) throws Exception {
        long end = System.currentTimeMillis() + timeoutMs;
        while(System.currentTimeMillis() < end) {
            if("true".equals(js("Boolean(" + expression + ")"))) return;
            Thread.sleep(20);
        }
        throw new Exception("Fast timeout: " + expression + " UI=" + js(ROOT+"?.textContent"));
    }
    private void advanceUntilDecision() throws Exception {
        long end = System.currentTimeMillis() + 120000;
        while(System.currentTimeMillis() < end) {
            if("true".equals(js("Boolean("+ROOT+"?.querySelector('.choice:not(:disabled)'))"))) return;
            String action = js("(()=>{const r="+ROOT+";if(!r)return 'loading';const bs=[...r.querySelectorAll('button:not(:disabled)')];const summary=bs.find(b=>b.textContent.trim()==='Seguir simulando');if(summary){summary.click();return 'summary';}const reject=bs.find(b=>b.textContent.trim()==='Rechazar oferta');if(reject){reject.click();return 'offer-reject';}const sim=bs.find(b=>b.textContent.trim().startsWith('Simular'));if(sim&&!r.querySelector('.p5-live-status')){sim.click();return 'simulate';}return 'wait';})()");
            if(action != null && !action.equals("\"wait\"") && !action.equals("\"loading\"")) step("advance-"+action.replace("\"",""));
            Thread.sleep(250);
        }
        throw new Exception("Timeout waiting for Decision through auto-sim interruptions. UI=" + js(ROOT+"?.textContent"));
    }
    private void installDecisionFixture() throws Exception {
        step("decision-fixture-build");
        js("window.__p11DecisionFixture=null;(async()=>{try{const [{GameSession},{createIndexedSaveStore}]=await Promise.all([import(new URL('dist/session/game-session.js',location.href).href),import(new URL('web/indexed-save-store.js',location.href).href)]);const s=await GameSession.create(424242,{commit:async()=>{},sessionId:'p11-android-back-fixture'});for(let i=0;i<40;i++){const v=s.getView();if(v.screen==='decision')break;if(v.screen==='result'){await s.dispatch({type:'acknowledge',commandId:'p11-fixture-ack-'+i,expectedRevision:v.revision});continue;}if(v.screen==='offer'){await s.dispatch({type:'offer',offerId:v.offer.id,action:'reject',commandId:'p11-fixture-offer-'+i,expectedRevision:v.revision});continue;}await s.dispatch({type:'continue',maxDays:90,commandId:'p11-fixture-continue-'+i,expectedRevision:v.revision});}const v=s.getView();if(v.screen!=='decision')throw Error('Decision fixture not reached: '+v.screen);const store=createIndexedSaveStore({storage:localStorage,indexedDB,key:'historia-jugador.android.offline.session.v1',validate:()=>{}});const expected=await store.readRaw();await store.write(s.exportSnapshot(),expected);await store.close();window.__p11DecisionFixture='PASS';}catch(e){window.__p11DecisionFixture='ERROR:'+e.message;}})();");
        until("window.__p11DecisionFixture!==null");
        String encoded=js("window.__p11DecisionFixture");
        String outcome=new org.json.JSONArray("["+encoded+"]").getString(0);
        if(outcome.startsWith("ERROR:"))throw new Exception(outcome);
        step("decision-fixture-reload");
        js("location.reload();true");
        until(ROOT+"?.querySelector('.choice:not(:disabled)')");
    }
    private void installLifecycleFixture() throws Exception {
        step("lifecycle-fixture-build");
        js("window.__p11LifecycleFixture=null;(async()=>{try{const [{GameSession},{createIndexedSaveStore}]=await Promise.all([import(new URL('dist/session/game-session.js',location.href).href),import(new URL('web/indexed-save-store.js',location.href).href)]);const s=await GameSession.create(424242,{commit:async()=>{},sessionId:'p11-android-lifecycle-fixture'});const v=s.getView();await s.dispatch({type:'auto',action:'start',maxWeeks:12,commandId:'p11-lifecycle-start',expectedRevision:v.revision});if(s.getView().simulation.mode!=='auto_simulating')throw Error('Lifecycle fixture did not enter auto_simulating');const store=createIndexedSaveStore({storage:localStorage,indexedDB,key:'historia-jugador.android.offline.session.v1',validate:()=>{}});const expected=await store.readRaw();await store.write(s.exportSnapshot(),expected);await store.close();window.__p11LifecycleFixture='PASS';}catch(e){window.__p11LifecycleFixture='ERROR:'+e.message;}})();");
        until("window.__p11LifecycleFixture!==null");
        String encoded=js("window.__p11LifecycleFixture");
        String outcome=new org.json.JSONArray("["+encoded+"]").getString(0);
        if(outcome.startsWith("ERROR:"))throw new Exception(outcome);
        step("lifecycle-fixture-reload");
        js("location.reload();true");
        untilFast(ROOT+"?.querySelector('.p5-live-status')", 1500);
    }

    private String snapshot() throws Exception {
        js("window.__probe=null; (async()=>{try{const {createIndexedSaveStore}=await import(new URL('web/indexed-save-store.js',location.href).href); const store=createIndexedSaveStore({storage:localStorage,indexedDB,key:'historia-jugador.android.offline.session.v1',validate:()=>{}});window.__probe=await store.read();await store.close();}catch(e){window.__probe='ERROR:'+e.message}})();");
        until("window.__probe!==null");
        String encoded=js("window.__probe");
        String raw=new org.json.JSONArray("["+encoded+"]").getString(0);
        if(raw.startsWith("ERROR:")) throw new Exception(raw);
        return raw;
    }
    private void navigateSurface(String buttonLabel, String expectedHeading) throws Exception {
        step("surface-"+buttonLabel);
        js("(()=>{const r="+ROOT+";const b=[...r.querySelectorAll('button:not(:disabled)')].find(x=>x.textContent.trim()==="+JSONObject.quote(buttonLabel)+");if(!b)throw Error('Missing surface button: "+buttonLabel+"');b.click();return true;})()");
        until(ROOT+"?.querySelector('main h1')?.textContent.trim()==="+JSONObject.quote(expectedHeading));
    }
    private void validateBasicSurfaceMatrix(Bundle report) throws Exception {
        navigateSurface("Carrera","Tu carrera.");
        step("surface-player-actions");
        js("(()=>{const r="+ROOT+";const b=[...r.querySelectorAll('button:not(:disabled)')].find(x=>x.textContent.trim()==='Gestionar mi carrera');if(!b)throw Error('Player Actions entry missing');b.click();return true;})()");
        until(ROOT+"?.querySelector('main h1')?.textContent.trim()==='¿Qué quieres hacer?'");
        navigateSurface("Mundo","El mundo sigue.");
        navigateSurface("Relaciones","Las personas de tu historia.");
        navigateSurface("Perfil","Tu perfil.");
        navigateSurface("Tu partida","Tu partida.");
        navigateSurface("Inicio","Jugador");
        report.putString("surfaceMatrix","PASS Home/Carrera/Player Actions/Mundo/Relaciones/Perfil/Tu partida");
    }
    @Override public void onStart() {
        Bundle report = new Bundle();
        long startedAt = System.nanoTime();
        try {
            Intent intent = new Intent(getTargetContext(), MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            Activity activity = startActivitySync(intent);
            Field field = MainActivity.class.getDeclaredField("game"); field.setAccessible(true); web=(WebView)field.get(activity);
            until(ROOT+"?.querySelector('.save-status')?.textContent.includes('Guardado automático')");
            long startupMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt);
            report.putLong("startupMs", startupMs);
            if(!"true".equals(js("isSecureContext && !!crypto.subtle && !!indexedDB"))) throw new Exception("Missing web APIs");
            if(!"true".equals(js("typeof AndroidBridge==='object' && typeof AndroidBridge.saveTextFile==='function'"))) throw new Exception("Missing Android file bridge");
            step("platform-safe-area");
            int viewportHeight=(int)Math.round(Double.parseDouble(js("innerHeight")));
            int topbarTop=(int)Math.round(Double.parseDouble(js(ROOT+"?.querySelector('.topbar')?.getBoundingClientRect().top")));
            int navBottom=(int)Math.round(Double.parseDouble(js(ROOT+"?.querySelector('.navigation')?.getBoundingClientRect().bottom")));
            report.putInt("viewportHeight",viewportHeight);
            report.putInt("topbarTop",topbarTop);
            report.putInt("navigationBottom",navBottom);
            if(topbarTop<0 || navBottom>viewportHeight+1) throw new Exception("Critical controls escape WebView safe viewport");
            step("platform-save-surface");
            js("[..."+ROOT+".querySelectorAll('button')].find(b=>b.textContent.trim()==='Tu partida')?.click()");
            until(ROOT+"?.querySelector('main h1')?.textContent.trim()==='Tu partida.'");
            if(!"true".equals(js("Boolean("+ROOT+"?.querySelector('input[type=file][accept*=json]'))"))) throw new Exception("Android import JSON control missing");
            if(!"true".equals(js("[..."+ROOT+".querySelectorAll('button')].some(b=>b.textContent.includes('Descargar copia'))"))) throw new Exception("Android export control missing");
            report.putBoolean("importControl",true);
            report.putBoolean("exportControl",true);
            report.putBoolean("androidBridge",true);
            js("[..."+ROOT+".querySelectorAll('button')].find(b=>b.textContent.trim()==='Inicio')?.click()");
            until("Boolean("+ROOT+"?.querySelector('.home-grid'))");
            android.content.SharedPreferences prefs=getTargetContext().getSharedPreferences("offline-probe",0);
            if("create".equals(phase)) validateBasicSurfaceMatrix(report);
            if("p9back".equals(phase)) {
                installDecisionFixture();
                step("decision-snapshot-before"); String decisionBefore=snapshot();
                JSONObject decisionSave=new JSONObject(decisionBefore);
                if(decisionSave.isNull("pendingDecision") || decisionSave.getJSONArray("journal").length()!=0) throw new Exception("Decision baseline invalid");
                step("decision-native-back"); report.putBoolean("decisionCanGoBack", canGoBackOnMain()); report.putInt("decisionHistoryLength", new org.json.JSONArray("["+js("history.length")+"]").getInt(0)); runOnMainSync(activity::onBackPressed);
                step("decision-after-back-wait"); until(ROOT+"?.querySelector('.mh') && !"+ROOT+"?.querySelector('.mh').classList.contains('immersive')");
                step("decision-snapshot-after"); if(!decisionBefore.equals(snapshot())) throw new Exception("Android Back changed pending decision/save");
                if(!"true".equals(js("[..."+ROOT+".querySelectorAll('button')].some(b=>b.textContent.includes('Una decisión te espera'))"))) throw new Exception("Decision safe return missing");

                step("result-reopen-decision"); js("[..."+ROOT+".querySelectorAll('button')].find(b=>b.textContent.includes('Una decisión te espera'))?.click()");
                until(ROOT+"?.querySelector('.choice:not(:disabled)')");
                step("result-choose"); js(ROOT+".querySelector('.choice:not(:disabled)').click()");
                step("result-wait"); until(ROOT+"?.querySelector('[data-result-continue]')");
                step("result-snapshot-before"); String resultBefore=snapshot();
                JSONObject resultSave=new JSONObject(resultBefore);
                if(resultSave.isNull("pendingResult") || resultSave.getJSONArray("journal").length()!=1) throw new Exception("Result baseline invalid");
                step("result-native-back"); report.putBoolean("resultCanGoBack", canGoBackOnMain()); report.putInt("resultHistoryLength", new org.json.JSONArray("["+js("history.length")+"]").getInt(0)); runOnMainSync(activity::onBackPressed);
                step("result-after-back-wait"); until(ROOT+"?.querySelector('.mh') && !"+ROOT+"?.querySelector('.mh').classList.contains('immersive')");
                step("result-snapshot-after"); if(!resultBefore.equals(snapshot())) throw new Exception("Android Back acknowledged or changed pending Result");
                if(!"true".equals(js("[..."+ROOT+".querySelectorAll('button')].some(b=>b.textContent.includes('Volver a tu decisión'))"))) throw new Exception("Result safe return missing");
                report.putString("stream", "PASS p9back: native MainActivity Back preserved pending Decision and Result without dispatch/acknowledge; startupMs=" + startupMs + "\n");
                finish(Activity.RESULT_OK, report);
                return;
            }
            if("lifecycle".equals(phase)) {
                installLifecycleFixture();
                report.putString("visibilityBefore", new org.json.JSONArray("["+js("document.visibilityState")+"]").getString(0));
                step("lifecycle-background");
                runOnMainSync(() -> activity.moveTaskToBack(true));
                untilFast("document.visibilityState==='hidden'", 1500);
                step("lifecycle-hidden-start");
                String hiddenStart=snapshot();
                int hiddenRevision=new JSONObject(hiddenStart).getInt("revision");
                Thread.sleep(1500);
                step("lifecycle-hidden-end");
                String hiddenEnd=snapshot();
                int hiddenEndRevision=new JSONObject(hiddenEnd).getInt("revision");
                report.putString("visibilityHidden", new org.json.JSONArray("["+js("document.visibilityState")+"]").getString(0));
                report.putInt("revisionHiddenStart", hiddenRevision);
                report.putInt("revisionHiddenEnd", hiddenEndRevision);
                if(hiddenEndRevision!=hiddenRevision) throw new Exception("Auto-sim advanced while app was backgrounded: "+hiddenRevision+" -> "+hiddenEndRevision);
                step("lifecycle-foreground");
                runOnMainSync(() -> {
                    Intent bring=new Intent(activity, MainActivity.class)
                        .addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    activity.startActivity(bring);
                });
                untilFast("document.visibilityState==='visible'", 1500);
                Thread.sleep(800);
                step("lifecycle-after-resume");
                String after=snapshot();
                int afterRevision=new JSONObject(after).getInt("revision");
                int resumeDelta=afterRevision-hiddenEndRevision;
                report.putInt("revisionAfterResume", afterRevision);
                report.putInt("resumeRevisionDelta", resumeDelta);
                report.putString("visibilityAfter", new org.json.JSONArray("["+js("document.visibilityState")+"]").getString(0));
                if(resumeDelta<=0) throw new Exception("Auto-sim did not resume after foreground");
                if(resumeDelta>7) throw new Exception("Possible duplicate auto-sim loop after resume; revision burst="+resumeDelta);
                step("lifecycle-pause-if-running");
                js("(()=>{const r="+ROOT+";const b=[...r.querySelectorAll('button:not(:disabled)')].find(x=>x.textContent.trim()==='Pausar simulación');if(b)b.click();return true;})()");
                Thread.sleep(250);
                report.putString("stream", "PASS lifecycle: hidden state froze auto-sim and foreground resumed without duplicate revision burst; startupMs=" + startupMs + "\n");
                finish(Activity.RESULT_OK, report);
                return;
            }

            if("create".equals(phase)) {
                step("create-initial-snapshot");
                String raw=snapshot(); JSONObject save=new JSONObject(raw);
                if(save.getInt("revision")!=0 || !save.isNull("pendingDecision") || !save.isNull("pendingResult") || save.getJSONArray("journal").length()!=0)
                    throw new Exception("Initial persisted session is not clean");
                if(!prefs.edit().putString("expected",raw).commit()) throw new Exception("Probe commit failed");
            } else {
                step("resume-initial-snapshot");
                String expected=prefs.getString("expected",null);
                if(expected==null || !expected.equals(snapshot())) throw new Exception("Save changed after process restart");
                if(!"true".equals(js("Boolean("+ROOT+"?.querySelector('.mh'))"))) throw new Exception("UI not restored after process restart");
            }
            report.putString("stream", "PASS " + phase + ": secure origin, IndexedDB, UI result and exact save verified; startupMs=" + startupMs + "\n");
            finish(Activity.RESULT_OK, report);
        } catch(Exception e) {
            report.putString("stream", "FAIL " + phase + " at " + lastStep + ": " + e.toString()+"\n");
            finish(Activity.RESULT_CANCELED, report);
        }
    }
}

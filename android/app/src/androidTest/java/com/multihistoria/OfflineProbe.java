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
    private String js(String source) throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> value = new AtomicReference<>();
        runOnMainSync(() -> web.evaluateJavascript(source, result -> { value.set(result); done.countDown(); }));
        if (!done.await(10, TimeUnit.SECONDS)) throw new Exception("JavaScript timeout");
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
    private String snapshot() throws Exception {
        js("window.__probe=null; (async()=>{try{const {createIndexedSaveStore}=await import(new URL('web/indexed-save-store.js',location.href).href); const store=createIndexedSaveStore({storage:localStorage,indexedDB,key:'historia-jugador.android.offline.session.v1',validate:()=>{}});window.__probe=await store.read();await store.close();}catch(e){window.__probe='ERROR:'+e.message}})();");
        until("window.__probe!==null");
        String encoded=js("window.__probe");
        String raw=new org.json.JSONArray("["+encoded+"]").getString(0);
        if(raw.startsWith("ERROR:")) throw new Exception(raw);
        return raw;
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
            android.content.SharedPreferences prefs=getTargetContext().getSharedPreferences("offline-probe",0);
            if("create".equals(phase)) {
                js("[..."+ROOT+".querySelectorAll('button')].find(b=>b.textContent.includes('Simular semana')).click()");
                until(ROOT+"?.querySelector('.choice:not(:disabled)')");
                js(ROOT+".querySelector('.choice').click()");
                until(ROOT+"?.querySelector('.chosen') && !"+ROOT+"?.querySelector('.busy-status')");
                String raw=snapshot(); JSONObject save=new JSONObject(raw);
                if(save.isNull("pendingResult") || save.getJSONArray("journal").length()!=1) throw new Exception("Result not committed");
                if(!prefs.edit().putString("expected",raw).commit()) throw new Exception("Probe commit failed");
            } else {
                String expected=prefs.getString("expected",null);
                if(expected==null || !expected.equals(snapshot())) throw new Exception("Save changed after process restart");
                until(ROOT+"?.querySelector('.chosen')");
            }
            report.putString("stream", "PASS " + phase + ": secure origin, IndexedDB, UI result and exact save verified; startupMs=" + startupMs + "\n");
            finish(Activity.RESULT_OK, report);
        } catch(Exception e) {
            report.putString("stream", "FAIL " + phase + ": " + e.toString()+"\n");
            finish(Activity.RESULT_CANCELED, report);
        }
    }
}

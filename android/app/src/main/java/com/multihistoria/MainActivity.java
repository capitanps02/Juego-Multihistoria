package com.multihistoria;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceResponse;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

/** Minimal offline shell: every game byte is packaged under android_asset. */
public final class MainActivity extends Activity {
    private static final String TAG = "Multihistoria";
    private static final String ASSET_ORIGIN = "https://appassets.androidplatform.net/assets/";
    private static final int FILE_REQUEST = 4311;
    private static final int SAVE_REQUEST = 4312;
    private WebView game;
    private ValueCallback<Uri[]> fileCallback;
    private String pendingDownloadName;
    private String pendingDownloadText;

    private PackageInfo appPackageInfo() {
        try { return getPackageManager().getPackageInfo(getPackageName(), 0); }
        catch (PackageManager.NameNotFoundException error) {
            Log.e(TAG, "Could not resolve installed package info", error);
            return null;
        }
    }

    private String appVersionName() {
        PackageInfo info = appPackageInfo();
        return info == null || info.versionName == null ? "unknown" : info.versionName;
    }

    @SuppressWarnings("deprecation")
    private long appVersionCode() {
        PackageInfo info = appPackageInfo();
        if (info == null) return 0;
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.P ? info.getLongVersionCode() : info.versionCode;
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        Log.i(TAG, "Launching offline shell version=" + appVersionName());
        game = new WebView(this);
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setDatabaseEnabled(true);
        game.getSettings().setAllowFileAccess(false);
        game.getSettings().setAllowContentAccess(false);
        game.getSettings().setAllowFileAccessFromFileURLs(false);
        game.getSettings().setAllowUniversalAccessFromFileURLs(false);
        final WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        game.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse response = assets.shouldInterceptRequest(request.getUrl());
                return response != null ? response : new WebResourceResponse("text/plain", "UTF-8",
                    403, "Blocked", java.util.Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !request.getUrl().toString().startsWith(ASSET_ORIGIN);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return !url.startsWith(ASSET_ORIGIN);
            }
        });
        game.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                                        FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent;
                try {
                    intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    String[] types = params.getAcceptTypes();
                    String type = "application/json";
                    if (types != null) {
                        for (String candidate : types) {
                            if (candidate != null && !candidate.trim().isEmpty()) { type = candidate; break; }
                        }
                    }
                    intent.setType(type);
                    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,
                        params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                    Log.i(TAG, "Opening import document selector type=" + type);
                    startActivityForResult(intent, FILE_REQUEST);
                } catch (Exception error) {
                    Log.e(TAG, "Could not open import document selector", error);
                    fileCallback = null;
                    callback.onReceiveValue(null);
                    return false;
                }
                return true;
            }
        });
        game.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");
        setContentView(game);
        game.loadUrl(ASSET_ORIGIN + "index.html");
    }

    private final class AndroidBridge {
        @JavascriptInterface public void saveTextFile(final String filename, final String text) {
            runOnUiThread(() -> {
                pendingDownloadName = (filename == null || filename.trim().isEmpty())
                    ? "multihistoria-partida.json" : filename;
                pendingDownloadText = text == null ? "" : text;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                intent.putExtra(Intent.EXTRA_TITLE, pendingDownloadName);
                try {
                    Log.i(TAG, "Opening export document selector name=" + pendingDownloadName);
                    startActivityForResult(intent, SAVE_REQUEST);
                } catch (Exception error) {
                    Log.e(TAG, "Could not open export document selector", error);
                    pendingDownloadName = null;
                    pendingDownloadText = null;
                    notifyFileResult("export", "error", "No se pudo abrir el selector de archivos.");
                }
            });
        }

        @JavascriptInterface public String getRuntimeInfo() {
            String webViewVersion = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                PackageInfo webViewPackage = WebView.getCurrentWebViewPackage();
                if (webViewPackage != null) webViewVersion = webViewPackage.versionName;
            }
            try {
                JSONObject info = new JSONObject();
                info.put("versionName", appVersionName());
                info.put("versionCode", appVersionCode());
                info.put("androidRelease", Build.VERSION.RELEASE);
                info.put("androidSdk", Build.VERSION.SDK_INT);
                info.put("webViewVersion", webViewVersion == null ? JSONObject.NULL : webViewVersion);
                info.put("offline", true);
                return info.toString();
            } catch (Exception error) {
                Log.e(TAG, "Could not create runtime diagnostics", error);
                return "{}";
            }
        }
    }

    private void notifyFileResult(String operation, String status, String detail) {
        if (game == null) return;
        String script = "window.dispatchEvent(new CustomEvent('mh:android-file-result',{detail:{operation:"
            + JSONObject.quote(operation) + ",status:" + JSONObject.quote(status) + ",message:"
            + JSONObject.quote(detail == null ? "" : detail) + "}}));";
        game.evaluateJavascript(script, null);
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_REQUEST) {
            ValueCallback<Uri[]> callback = fileCallback;
            fileCallback = null;
            if (callback == null) return;
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null) {
                ClipData clips = data.getClipData();
                if (clips != null && clips.getItemCount() > 0) {
                    result = new Uri[clips.getItemCount()];
                    for (int i = 0; i < clips.getItemCount(); i++) result[i] = clips.getItemAt(i).getUri();
                } else if (data.getData() != null) {
                    result = new Uri[] { data.getData() };
                }
            }
            Log.i(TAG, result == null ? "Import selector cancelled" : "Import selector returned " + result.length + " file(s)");
            callback.onReceiveValue(result);
        } else if (requestCode == SAVE_REQUEST) {
            String text = pendingDownloadText;
            pendingDownloadName = null;
            pendingDownloadText = null;
            if (resultCode != RESULT_OK || data == null || data.getData() == null) {
                Log.i(TAG, "Export selector cancelled");
                notifyFileResult("export", "cancelled", "");
                return;
            }
            try (OutputStream output = getContentResolver().openOutputStream(data.getData())) {
                if (output == null) throw new IllegalStateException("No output stream for selected document");
                output.write(text == null ? new byte[0] : text.getBytes(StandardCharsets.UTF_8));
                output.flush();
                Log.i(TAG, "Export completed");
                notifyFileResult("export", "saved", "");
            } catch (Exception error) {
                Log.e(TAG, "Export failed", error);
                notifyFileResult("export", "error", "El sistema no pudo escribir el archivo seleccionado.");
            }
        }
    }

    @Override public void onBackPressed() {
        if (game != null && game.canGoBack()) game.goBack();
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (fileCallback != null) { fileCallback.onReceiveValue(null); fileCallback = null; }
        pendingDownloadName = null;
        pendingDownloadText = null;
        if (game != null) { game.loadUrl("about:blank"); game.destroy(); game = null; }
        super.onDestroy();
    }
}

package com.multihistoria;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.os.Bundle;
import android.net.Uri;
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

/** Minimal offline shell: every game byte is packaged under android_asset. */
public final class MainActivity extends Activity {
    private static final String ASSET_ORIGIN = "https://appassets.androidplatform.net/assets/";
    private static final int FILE_REQUEST = 4311;
    private static final int SAVE_REQUEST = 4312;
    private WebView game;
    private ValueCallback<Uri[]> fileCallback;
    private String pendingDownloadName;
    private String pendingDownloadText;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
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
                    startActivityForResult(intent, FILE_REQUEST);
                } catch (Exception error) {
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
                    startActivityForResult(intent, SAVE_REQUEST);
                } catch (Exception error) {
                    pendingDownloadName = null;
                    pendingDownloadText = null;
                }
            });
        }
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
            callback.onReceiveValue(result);
        } else if (requestCode == SAVE_REQUEST) {
            String text = pendingDownloadText;
            pendingDownloadName = null;
            pendingDownloadText = null;
            if (resultCode != RESULT_OK || data == null || data.getData() == null) return;
            try (OutputStream output = getContentResolver().openOutputStream(data.getData())) {
                if (output != null) output.write(text == null ? new byte[0] : text.getBytes(StandardCharsets.UTF_8));
            } catch (Exception ignored) {
                // The browser fallback still allows a subsequent download attempt.
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

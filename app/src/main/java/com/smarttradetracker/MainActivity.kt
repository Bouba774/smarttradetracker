package com.smarttradetracker

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import android.content.Intent
import android.net.Uri

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        
        // Configure WebView settings
        val webSettings: WebSettings = webView.settings
        webSettings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            userAgentString = "SmartTradeTracker/1.0 (Android)"
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
        }

        // Set WebViewClient to handle navigation
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url != null && url.startsWith("https://smarttradetrackerstt.lovable.app")) {
                    view?.loadUrl(url)
                    return true
                } else if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                    // Open external links in browser
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                    return true
                }
                return false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Inject custom CSS or JavaScript if needed
                injectCustomJavaScript()
            }
        }

        // Load the web application
        webView.loadUrl("https://smarttradetrackerstt.lovable.app")
    }

    private fun injectCustomJavaScript() {
        val javascript = """
            (function() {
                // Remove any external ads or unwanted elements
                var ads = document.querySelectorAll('[class*="ad"]');
                ads.forEach(function(ad) {
                    if (ad.style.display !== 'flex') {
                        ad.remove();
                    }
                });
            })();
        """.trimIndent()
        
        webView.evaluateJavascript(javascript, null)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}

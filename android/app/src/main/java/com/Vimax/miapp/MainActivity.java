package com.Vimax.miapp;

import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // ✅ FORZAR COMPORTAMIENTO DE SYSTEM WINDOWS
    Window window = getWindow();

    // Hacer transparente la status bar
    window.setStatusBarColor(android.graphics.Color.TRANSPARENT);

    // Configurar flags para layout extendido
    window.getDecorView().setSystemUiVisibility(
      View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
    );
  }

  @Override
  public void onBackPressed() {
    try {
      WebView webView = getBridge().getWebView();

      // Verificar si puede retroceder en el historial
      if (webView != null && webView.canGoBack()) {
        webView.goBack();  // Retroceder en la página web
      } else {
        super.onBackPressed();  // Cerrar la app
      }
    } catch (Exception e) {
      // En caso de error, comportamiento por defecto
      super.onBackPressed();
    }
  }
}

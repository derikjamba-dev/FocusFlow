package com.focusflow.focusblock;

import android.content.Context;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class BlockOverlayView extends LinearLayout {

  public interface OverlayListener {
    boolean canUnlock();

    int unlocksRemaining();

    int unlocksLimit();

    long graceSeconds();

    void onUnlock();
  }

  private final OverlayListener listener;
  private final WindowManager.LayoutParams overlayParams;

  public BlockOverlayView(Context context, OverlayListener listener) {
    super(context);
    this.listener = listener;

    overlayParams = new WindowManager.LayoutParams(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
            | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED,
        PixelFormat.TRANSLUCENT);
    overlayParams.gravity = Gravity.TOP;
  }

  public WindowManager.LayoutParams getOverlayParams() {
    return overlayParams;
  }

  public void bind() {
    setOrientation(LinearLayout.VERTICAL);
    setGravity(Gravity.CENTER);
    setPadding(dp(24), dp(24), dp(24), dp(24));
    setBackgroundColor(0xEA0B1220);

    TextView title = new TextView(getContext());
    title.setText("Modo Foco Ativo");
    title.setTextColor(Color.WHITE);
    title.setTextSize(30);
    title.setGravity(Gravity.CENTER);
    addView(title, matchWidthWrapContent());

    TextView message = new TextView(getContext());
    message.setText("Esta aplicação está bloqueada durante a tua sessão de foco.");
    message.setTextColor(Color.WHITE);
    message.setTextSize(17);
    message.setPadding(dp(8), dp(16), dp(8), 0);
    addView(message, matchWidthWrapContent());

    if (listener.canUnlock()) {
      Button unlockBtn = new Button(getContext());
      unlockBtn.setText("Desbloquear temporariamente (" + listener.graceSeconds() + "s)");
      unlockBtn.setTextColor(Color.WHITE);
      unlockBtn.setTextSize(14);
      unlockBtn.setBackgroundColor(0xFF3B82F6);
      unlockBtn.setAllCaps(false);
      unlockBtn.setOnClickListener(new OnClickListener() {
        @Override
        public void onClick(View v) {
          listener.onUnlock();
        }
      });

      LinearLayout.LayoutParams lp = matchWidthWrapContent();
      lp.setMargins(0, dp(40), 0, 0);
      addView(unlockBtn, lp);

      TextView counter = new TextView(getContext());
      counter.setText("Desbloqueios restantes: " + listener.unlocksRemaining() + "/" + listener.unlocksLimit());
      counter.setTextColor(Color.LTGRAY);
      counter.setTextSize(13);
      counter.setPadding(dp(8), dp(16), dp(8), 0);
      addView(counter, matchWidthWrapContent());
    } else {
      TextView exhausted = new TextView(getContext());
      exhausted.setText("Limite de desbloqueios esgotado nesta sessão de foco.");
      exhausted.setTextColor(Color.rgb(252, 211, 77));
      exhausted.setTextSize(14);
      exhausted.setPadding(dp(8), dp(24), dp(8), 0);
      addView(exhausted, matchWidthWrapContent());
    }
  }

  private LinearLayout.LayoutParams matchWidthWrapContent() {
    return new LinearLayout.LayoutParams(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.WRAP_CONTENT);
  }

  private int dp(int value) {
    return Math.round(value * getResources().getDisplayMetrics().density);
  }
}
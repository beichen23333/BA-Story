import React from "react";
import { createPortal } from "react-dom";
import { RotateCw, ArrowUp } from "lucide-react";

export function OrientationOverlay({ t, onEnterLandscape, busy = false }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="orientation-screen" role="dialog" aria-modal="true">
      <div className="orientation-content">
        <div className="orientation-icon">
          <RotateCw size={44} />
        </div>
        <div className="orientation-title">{t.rotateTitle}</div>
        <div className="orientation-description">{t.rotateDesc}</div>
        <button className="landscape-button" type="button" onClick={onEnterLandscape} disabled={busy} style={busy ? { opacity: 0.65, cursor: "wait" } : undefined}>
          <ArrowUp size={20} /> {t.rotateButton}
        </button>
      </div>
    </div>,
    document.body
  );
}

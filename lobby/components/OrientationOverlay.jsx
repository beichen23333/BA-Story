import React from "react";
import { RotateCw, ArrowUp } from "lucide-react";

export function OrientationOverlay({ t, onEnterLandscape, busy = false }) {
  return (
    <div className="orientation-screen">
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
    </div>
  );
}

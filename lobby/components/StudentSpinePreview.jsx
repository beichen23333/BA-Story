import React, { useEffect, useRef, useState } from "react";
import { Application } from "pixi.js";
import { loadCharacterSpineForPreview } from "../../player-lib/index.ts";
import { Character_Initial_Pivot_Proportion, calcCharacterYAndScale } from "../../player-lib/layers/characterLayer/index.ts";
import { hasAnimation } from "../../shared/utils.ts";

/** 个人剧情页面沿用 player 的 Spine 资源加载、Spine 实例与角色缩放算法。 */
export function StudentSpinePreview({ resourceName, label, t }) {
    const containerRef = useRef(null);
    const [loadState, setLoadState] = useState("loading");
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !resourceName) { setLoadState("error"); return undefined; }
        let disposed = false;
        let app = null;
        let spine = null;
        let resizeObserver = null;
        let resizeHandler = null;
        setLoadState("loading");
        const mountPreview = async () => {
            try {
                const preview = await loadCharacterSpineForPreview(resourceName);
                if (disposed) return;
                const width = Math.max(1, container.clientWidth);
                const height = Math.max(1, container.clientHeight);
                app = new Application({ width, height, backgroundAlpha: 0, antialias: true, autoDensity: true, resolution: Math.min(2, window.devicePixelRatio || 1) });
                app.stage.sortableChildren = true;
                app.view.style.width = "100%";
                app.view.style.height = "100%";
                app.view.style.display = "block";
                app.view.style.background = "transparent";
                container.appendChild(app.view);
                spine = preview;
                spine.alpha = 1;
                spine.visible = true;
                if (hasAnimation(spine, "Idle_01")) spine.state.setAnimation(0, "Idle_01", true);
                app.stage.addChild(spine);
                const resize = () => {
                    if (!app || !spine || disposed) return;
                    const nextWidth = Math.max(1, container.clientWidth);
                    const nextHeight = Math.max(1, container.clientHeight);
                    app.renderer.resize(nextWidth, nextHeight);
                    const unscaledWidth = spine.width / (spine.scale.x || 1);
                    const unscaledHeight = spine.height / (spine.scale.y || 1);
                    spine.pivot.set(Character_Initial_Pivot_Proportion.x * unscaledWidth, Character_Initial_Pivot_Proportion.y * unscaledHeight);
                    const transform = calcCharacterYAndScale(spine, nextHeight);
                    spine.scale.set(transform.scale);
                    spine.position.set(nextWidth * 0.5, transform.y);
                };
                resizeHandler = resize;
                resize();
                if (typeof ResizeObserver !== "undefined") {
                    resizeObserver = new ResizeObserver(resize);
                    resizeObserver.observe(container);
                } else {
                    window.addEventListener("resize", resizeHandler, { passive: true });
                }
                if (!disposed) setLoadState("loaded");
            } catch (error) {
                if (!disposed) setLoadState("error");
            }
        };
        void mountPreview();
        return () => {
            disposed = true;
            resizeObserver?.disconnect();
            if (resizeHandler) window.removeEventListener("resize", resizeHandler);
            if (app) app.destroy(true, { children: true, texture: false, baseTexture: false });
            app = null;
            spine = null;
        };
    }, [resourceName]);
    return <div className="affinity-student-spine-wrap" aria-label={label}>
        <div className="affinity-student-spine-canvas" ref={containerRef} />
        {loadState !== "loaded" && <div className="affinity-student-spine-status" role={loadState === "error" ? "alert" : "status"}>{loadState === "error" ? t.affinityLoadFailed : t.affinityLoading}</div>}
    </div>;
}

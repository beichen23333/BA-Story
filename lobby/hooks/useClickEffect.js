import { useEffect, useRef } from "react";
import { BAClickFX } from "ba-click-fx";

/**
 * 蔚蓝档案风格点击粒子与光环特效 Hook
 * @param {boolean} [disabled=false] 是否禁用/隐藏点击特效（竖屏或处于旋转提示页面时不显示）
 * @param {import("ba-click-fx/config").ClickFXConfig} [options]
 */
export function useClickEffect(disabled = false, options) {
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  useEffect(() => {
    // 通过 inputFilter 从事件根源完全拦截输入，防止在禁用状态下生成任何粒子与声音
    const fx = new BAClickFX({
      ...options,
      inputFilter: () => !disabledRef.current,
    });

    return () => {
      fx.destroy();
    };
  }, []);

  // 动态同步 Canvas 显隐与交互
  useEffect(() => {
    // ba-click-fx 生成的 canvas 以及宿主容器
    const canvases = document.querySelectorAll(
      "canvas.ba-click-fx-canvas, canvas[id*='ba-click-fx'], canvas[class*='ba-click-fx'], div[aria-hidden='true'] > canvas"
    );
    canvases.forEach((canvas) => {
      canvas.style.display = disabled ? "none" : "block";
      canvas.style.pointerEvents = "none";
      if (canvas.parentElement && canvas.parentElement.getAttribute("aria-hidden") === "true") {
        canvas.parentElement.style.display = disabled ? "none" : "block";
      }
    });
  }, [disabled]);
}

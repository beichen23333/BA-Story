import { useState, useEffect, useCallback, useRef } from "react";

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: coarse)").matches || /Android|iPhone|iPod|iPad|Mobile/i.test(navigator.userAgent || "");
}
function getToy() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;
  // Toy API 只在 Bilibili 客户端中启用；普通浏览器即使存在同名注入对象，也走 Web 逻辑。
  const ua = navigator.userAgent || "";
  const isBilibili = /BiliApp|哔哩哔哩|bilibili/i.test(ua);
  return isBilibili && window.toy && typeof window.toy.setContainerMode === "function" ? window.toy : null;
}
function getErrorMessage(error) {
  return error?.message || error?.msg || error?.code || String(error || "未知错误");
}

export function useOrientation() {
  const [portrait, setPortrait] = useState(() => typeof window !== "undefined" && window.innerHeight > window.innerWidth);
  const [isMobile, setIsMobile] = useState(false);
  const [showRotatePrompt, setShowRotatePrompt] = useState(() => typeof window !== "undefined" && window.innerHeight > window.innerWidth && !getToy());
  const [orientationError, setOrientationError] = useState("");
  const [orientationBusy, setOrientationBusy] = useState(false);
  const toyListenerRef = useRef(null);
  const busyRef = useRef(false);

  const updateBrowserOrientation = useCallback(() => {
    const mobile = isMobileDevice();
    // 以实际布局视口方向为准，不再用 UA/移动设备识别限制浏览器遮罩。
    // 与用户提供的已验证测试页保持一致：以 window.innerWidth/innerHeight 判断。
    // visualViewport 在移动浏览器地址栏收缩、桌面模式下可能给出不代表设备方向的值。
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;
    setIsMobile(mobile);
    setPortrait(isPortrait);
    // 普通 Web 页面竖屏时始终显示遮罩；仅真正接入 Toy SDK 的客户端走 SDK 状态。
    setShowRotatePrompt(isPortrait && !getToy());
  }, []);

  const applyToyState = useCallback((state) => {
    if (!state?.orientation) return;
    const isPortrait = state.orientation === "portrait";
    setPortrait(isPortrait);
    setIsMobile(state.deviceType === "phone" || state.deviceType === "tablet");
    setShowRotatePrompt(isPortrait && (state.deviceType === "phone" || state.deviceType === "tablet"));
  }, []);

  useEffect(() => {
    updateBrowserOrientation();
    const media = window.matchMedia("(orientation: portrait)");
    media.addEventListener?.("change", updateBrowserOrientation);
    window.addEventListener("resize", updateBrowserOrientation);
    window.addEventListener("orientationchange", updateBrowserOrientation);
    window.visualViewport?.addEventListener("resize", updateBrowserOrientation);
    const toy = getToy();
    if (toy?.onContainerChange) {
      try { toyListenerRef.current = toy.onContainerChange(applyToyState); }
      catch (error) { console.error("[Orientation] 注册 Toy 状态监听失败", error); }
    }
    return () => {
      media.removeEventListener?.("change", updateBrowserOrientation);
      window.removeEventListener("resize", updateBrowserOrientation);
      window.removeEventListener("orientationchange", updateBrowserOrientation);
      window.visualViewport?.removeEventListener("resize", updateBrowserOrientation);
      if (typeof toyListenerRef.current === "function") toyListenerRef.current();
      toyListenerRef.current = null;
    };
  }, [updateBrowserOrientation, applyToyState]);

  const enterLandscape = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setOrientationBusy(true);
    setOrientationError("");
    const toy = getToy();
    if (toy) {
      try {
        if (typeof toy.isSupport !== "function") throw new Error("当前 Toy SDK 不包含 isSupport，无法确认容器横屏能力。");
        const supported = await toy.isSupport("setContainerMode");
        if (!supported) throw new Error("当前 Bilibili 客户端暂不支持 Toy 容器横屏，请更新客户端后重试。");
        if (typeof toy.onContainerChange === "function" && !toyListenerRef.current) {
          toyListenerRef.current = toy.onContainerChange(applyToyState);
        }
        // orientation 与 immersive 一次原子设置；必须在用户点击事件链内调用。
        await toy.setContainerMode({ orientation: "landscape", immersive: true });
        // Promise resolve 仅代表请求返回，状态以 onContainerChange 推送为准。
        if (typeof toy.getContainerState === "function") {
          const state = await toy.getContainerState();
          applyToyState(state);
          if (state?.orientation !== "landscape") {
            setOrientationError("");
          }
        } else {
          setOrientationError("横屏请求已发送，当前 SDK 无法读取容器状态；请观察屏幕是否旋转。");
        }
      } catch (error) {
        console.error("[Orientation] Toy setContainerMode 调用失败", error);
        setOrientationError(`Toy 横屏调用失败：${getErrorMessage(error)}`);
      } finally {
        busyRef.current = false;
        setOrientationBusy(false);
      }
      return;
    }

    // 普通浏览器：API 必须在用户手势触发的调用链内执行。
    let fullscreenError = null;
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    } catch (error) { fullscreenError = error; }
    try {
      if (screen.orientation?.lock) await screen.orientation.lock("landscape");
      else throw new Error("浏览器不支持 Screen Orientation API");
    } catch (error) {
      updateBrowserOrientation();
      if (fullscreenError) setOrientationError(`浏览器未能进入横屏：${getErrorMessage(error)}（全屏请求：${getErrorMessage(fullscreenError)}）`);
    }
    updateBrowserOrientation();
    busyRef.current = false;
    setOrientationBusy(false);
  }, [applyToyState, updateBrowserOrientation]);

  const dismissOrientationError = useCallback(() => setOrientationError(""), []);
  return { portrait, isMobile, showRotatePrompt, enterLandscape, orientationError, orientationBusy, dismissOrientationError };
}

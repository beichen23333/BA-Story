import { useState, useEffect, useCallback, useRef } from "react";

function isMobileDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Windows NT/i.test(ua) || (/Macintosh/i.test(ua) && !("ontouchend" in document))) return false;
  return /Android|iPhone|iPod|iPad|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}
function getToy() {
  return typeof window !== "undefined" && window.toy && typeof window.toy.setContainerMode === "function" ? window.toy : null;
}
function getErrorMessage(error) {
  return error?.message || error?.msg || error?.code || String(error || "未知错误");
}

export function useOrientation() {
  const [portrait, setPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);
  const [orientationError, setOrientationError] = useState("");
  const [orientationBusy, setOrientationBusy] = useState(false);
  const toyListenerRef = useRef(null);
  const busyRef = useRef(false);

  const updateBrowserOrientation = useCallback(() => {
    const mobile = isMobileDevice();
    const isPortrait = window.matchMedia("(orientation: portrait)").matches || window.innerHeight > window.innerWidth;
    setIsMobile(mobile);
    setPortrait(isPortrait);
    setShowRotatePrompt(isPortrait && mobile && !getToy());
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
    const toy = getToy();
    if (toy?.onContainerChange) {
      try { toyListenerRef.current = toy.onContainerChange(applyToyState); }
      catch (error) { console.error("[Orientation] 注册 Toy 状态监听失败", error); }
    }
    return () => {
      media.removeEventListener?.("change", updateBrowserOrientation);
      window.removeEventListener("resize", updateBrowserOrientation);
      window.removeEventListener("orientationchange", updateBrowserOrientation);
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
      else setOrientationError(`已尝试进入全屏，但浏览器拒绝锁定横屏：${getErrorMessage(error)}`);
    }
    updateBrowserOrientation();
    busyRef.current = false;
    setOrientationBusy(false);
  }, [applyToyState, updateBrowserOrientation]);

  const dismissOrientationError = useCallback(() => setOrientationError(""), []);
  return { portrait, isMobile, showRotatePrompt, enterLandscape, orientationError, orientationBusy, dismissOrientationError };
}

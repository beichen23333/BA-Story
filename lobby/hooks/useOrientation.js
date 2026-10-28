import { useState, useEffect } from "react";

// 判断是否为移动设备（Windows、Mac 等非触控移动桌面端无需显示强制横屏提示遮罩）
function isMobileDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent || "";
  // 排除 Windows, Mac(非iPadOS) 等非移动环境
  const isWindows = /Windows NT/i.test(ua);
  const isMac = /Macintosh/i.test(ua) && !("ontouchend" in document);
  if (isWindows || isMac) {
    return false;
  }
  const isMobileUA = /Android|iPhone|iPod|iPad|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  return isMobileUA;
}

export function useOrientation() {
  const [portrait, setPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(orientation: portrait)");
    const update = () => {
      const mobile = isMobileDevice();
      const isPortrait = media.matches || window.innerHeight > window.innerWidth;
      setIsMobile(mobile);
      setPortrait(isPortrait);
      // windows端等桌面浏览器不提示横屏操作，仅移动端在竖屏时提示
      setShowRotatePrompt(isPortrait && mobile);
    };

    update();
    media.addEventListener?.("change", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      media.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  const enterLandscape = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (screen.orientation?.lock) {
        await screen.orientation.lock("landscape");
      }
    } catch {
      setPortrait(window.matchMedia("(orientation: portrait)").matches);
    }
  };

  return { portrait, isMobile, showRotatePrompt, enterLandscape };
}

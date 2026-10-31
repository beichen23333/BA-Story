import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { createApp, h, shallowReactive } from "vue";
import { createPinia } from "pinia";
import BaStoryPlayer from "../../player-lib/BaStoryPlayer.vue";

const StoryPlayer = forwardRef(function StoryPlayer(
  {
    story,
    dataUrl,
    width,
    height,
    language = "Cn",
    voiceLanguage = "jp",
    userName = "sensei",
    storySummary = false,
    startFullScreen = false,
    useMp3 = false,
    usePC = false,
    changeIndex,
    exitFullscreenTimeOut,
    enableClickFx = false,
    onEnd,
    onError,
    onInitiated,
    className = "",
    style = {},
  },
  ref
) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const mountRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const propsRef = useRef(null);
  const callbacksRef = useRef({ onEnd, onError, onInitiated });

  callbacksRef.current = { onEnd, onError, onInitiated };

  if (!propsRef.current) {
    propsRef.current = shallowReactive({
      story,
      dataUrl,
      width,
      height,
      language,
      voiceLanguage,
      userName,
      storySummary,
      startFullScreen,
      useMp3,
      usePC,
      changeIndex,
      exitFullscreenTimeOut,
      enableClickFx,
    });
  }

  useImperativeHandle(ref, () => ({
    getInstance: () => playerInstanceRef.current,
    hotReplaceStoryUnit: (unit) => playerInstanceRef.current?.hotReplaceStoryUnit?.(unit),
    resetLive2d: () => playerInstanceRef.current?.resetLive2d?.(),
    getPixiApp: () => playerInstanceRef.current?.app,
  }));

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const mountEl = document.createElement("div");
    mountEl.style.width = "100%";
    mountEl.style.height = "100%";
    mountEl.style.minWidth = "0";
    mountEl.style.minHeight = "0";
    containerRef.current.appendChild(mountEl);

    const app = createApp({
      render() {
        return h(BaStoryPlayer, {
          ...propsRef.current,
          ref: (instance) => {
            playerInstanceRef.current = instance;
          },
          onEnd: (...args) => callbacksRef.current.onEnd?.(...args),
          onError: (...args) => callbacksRef.current.onError?.(...args),
          onInitiated: (...args) => callbacksRef.current.onInitiated?.(...args),
        });
      },
    });

    app.use(createPinia());
    app.mount(mountEl);
    appRef.current = app;
    mountRef.current = mountEl;

    return () => {
      app.unmount();
      appRef.current = null;
      playerInstanceRef.current = null;
      if (mountEl.parentNode) mountEl.parentNode.removeChild(mountEl);
      mountRef.current = null;
    };
  }, []);

  useEffect(() => {
    Object.assign(propsRef.current, {
      story,
      dataUrl,
      width,
      height,
      language,
      voiceLanguage,
      userName,
      storySummary,
      startFullScreen,
      useMp3,
      usePC,
      changeIndex,
      exitFullscreenTimeOut,
      enableClickFx,
    });
  }, [story, dataUrl, width, height, language, voiceLanguage, userName, storySummary, startFullScreen, useMp3, usePC, changeIndex, exitFullscreenTimeOut, enableClickFx]);

  return (
    <div
      ref={containerRef}
      className={`ba-story-player-wrapper ${className}`}
      style={{ width: "100%", height: "100%", minWidth: 0, minHeight: 0, ...style }}
    />
  );
});

export default StoryPlayer;

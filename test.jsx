import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createApp, h, onBeforeUnmount, onMounted, ref } from "vue";
import { createPinia } from "pinia";
import BaStoryPlayer from "./player-lib/BaStoryPlayer.vue";

const DATA_URL = "https://res.bluearchive.help/image/ba-all-data";
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

function getPlayerSize() {
  const viewportWidth = Math.max(1, window.visualViewport?.width || window.innerWidth);
  const viewportHeight = Math.max(1, window.visualViewport?.height || window.innerHeight);
  const scale = Math.min(viewportWidth / DESIGN_WIDTH, viewportHeight / DESIGN_HEIGHT);
  return {
    width: Math.max(1, Math.round(DESIGN_WIDTH * scale)),
    height: Math.max(1, Math.round(DESIGN_HEIGHT * scale)),
  };
}

function TestPage() {
  const [story, setStory] = useState(null);
  const [error, setError] = useState("");
  const [entered, setEntered] = useState(false);
  const [enterStatus, setEnterStatus] = useState("点击后尝试进入全屏并锁定横屏");

  useEffect(() => {
    fetch("/data/test1.json")
      .then((res) => {
        if (!res.ok) throw new Error(`读取 data/test.json 失败：${res.status}`);
        return res.json();
      })
      .then(setStory)
      .catch((err) => setError(err.message || String(err)));
  }, []);

  useEffect(() => {
    if (!story || !entered) return;
    const mount = document.getElementById("player-mount");
    if (!mount) return;

    const app = createApp({
      setup() {
        const playerSize = ref(getPlayerSize());
        const updatePlayerSize = () => {
          playerSize.value = getPlayerSize();
        };
        onMounted(() => {
          window.addEventListener("resize", updatePlayerSize, { passive: true });
          window.addEventListener("orientationchange", updatePlayerSize, { passive: true });
          window.visualViewport?.addEventListener("resize", updatePlayerSize, { passive: true });
        });
        onBeforeUnmount(() => {
          window.removeEventListener("resize", updatePlayerSize);
          window.removeEventListener("orientationchange", updatePlayerSize);
          window.visualViewport?.removeEventListener("resize", updatePlayerSize);
        });
        return () => h(BaStoryPlayer, {
          story,
          dataUrl: DATA_URL,
          width: playerSize.value.width,
          height: playerSize.value.height,
          language: "Cn",
          voiceLanguage: "cn",
          userName: "sensei",
          storySummary: { chapterName: "文本样式测试", summary: "测试 Ruby 标签与 Ending。" },
          startFullScreen: false,
          useMp3: false,
          usePC: false,
          enableClickFx: true,
        });
      },
    });
    app.use(createPinia());
    app.mount(mount);
    return () => app.unmount();
  }, [story, entered]);

  const enterLandscape = () => {
    const el = document.documentElement;
    if (!el.requestFullscreen) {
      setEnterStatus("当前浏览器不支持全屏 API，无法强制横屏。");
      setEntered(true);
      return;
    }
    el.requestFullscreen()
      .then(() => {
        if (!screen.orientation?.lock) throw new Error("Screen Orientation Lock API 不可用");
        return screen.orientation.lock("landscape");
      })
      .then(() => {
        setEnterStatus("已全屏并锁定横屏。");
        setEntered(true);
      })
      .catch((err) => {
        console.error("全屏或横屏锁定失败:", err);
        setEnterStatus(`无法强制横屏：${err.message || "浏览器不支持"}`);
        setEntered(true);
      });
  };

  return <>
    <style>{`
      *{box-sizing:border-box}
      html,body,#test-root{margin:0;width:100%;height:100%;height:100dvh;overflow:hidden;background:#000}
      #player-shell{position:fixed;inset:0;width:100vw;height:100vh;height:100dvh;overflow:hidden;background:#000}
      #player-mount{position:absolute;inset:0;width:100%;height:100%;overflow:hidden}
      /* BaStoryPlayer 的外层占满视口，内部 16:9 画布只缩放一次并居中。 */
      #player{display:flex!important;align-items:center!important;justify-content:center!important}
      #player__background{flex:0 0 auto!important;max-width:100vw;max-height:100dvh}
      #player__main{flex:0 0 auto!important}
      .enter-screen{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;background:#10131a;color:#fff;font-family:Arial,sans-serif;text-align:center;padding:24px;z-index:10}
      .enter-screen button{border:0;border-radius:8px;background:#3f88f2;color:#fff;padding:14px 28px;font-size:18px;font-weight:600;cursor:pointer}
      .enter-screen p{margin:0;color:#b9c2d0;font-size:14px;max-width:80%}
      .test-error{position:fixed;z-index:99999;left:12px;top:12px;color:#fff;background:#a22;padding:10px;font:14px sans-serif}
    `}</style>
    <div id="player-shell">
      {!entered && <div className="enter-screen">
        <div style={{fontSize:22,fontWeight:700}}>剧情播放器（强制横屏测试）</div>
        <p>Android Chrome 支持；iOS Safari 不支持强制横屏，将保持设备当前方向。</p>
        <button onClick={enterLandscape}>全屏并锁定横屏</button>
        <p>{enterStatus}</p>
      </div>}
      <div id="player-mount" />
    </div>
    {entered && <div style={{position:"fixed",zIndex:99999,left:8,bottom:8,padding:"6px 10px",background:"#222b",color:"#ddd",font:"12px sans-serif",pointerEvents:"none"}}>{enterStatus}</div>}
    {error && <div className="test-error">{error}</div>}
  </>;
}

createRoot(document.getElementById("test-root")).render(<TestPage />);

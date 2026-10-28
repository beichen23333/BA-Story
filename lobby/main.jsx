import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");
async function startApp() {
  // 先加载 Loading 页面使用的 Connect 字体，再首次渲染，避免字体后续跳变。
  try {
    const connectFont = new FontFace("TVPS-Vain-Capital-2", 'url("https://webcnstatic.yostar.net/ba_cn_web/prod/web/assets/TVPS-Vain-Capital-2.cca90a05.ttf")', { display: "block" });
    await connectFont.load();
    document.fonts.add(connectFont);
  } catch (error) {
    console.warn("Connect 字体加载失败，使用系统回退字体", error);
  }
  if (rootElement) createRoot(rootElement).render(<App />);
}
startApp();

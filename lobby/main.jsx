import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { loadCachedFontFace } from "../shared/utils.ts";
import "./styles.css";

const rootElement = document.getElementById("root");
if (rootElement) createRoot(rootElement).render(<App />);
void loadCachedFontFace("TVPS-Vain-Capital-2", "https://webcnstatic.yostar.net/ba_cn_web/prod/web/assets/TVPS-Vain-Capital-2.cca90a05.ttf").catch(() => {});

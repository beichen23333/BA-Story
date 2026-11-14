import type { OtherSoundsUrls, ResourcesTypes } from "../player-lib/types/resources";
import type { BGEffectExcelTableItem } from "../player-lib/types/excels";
import type { Spine } from "@esotericsoftware/spine-pixi-v7";

// ============================================================
// 资源配置与路径
// ============================================================
export let dataUrl = "https://res.bluearchive.help/image/ba-all-data";
let oggAudioType = "ogg";
let pcMode = false;
let otherSoundMap: OtherSoundsUrls = {
  select: `${dataUrl}/Audio/Sound/UI_Button_Touch.wav`,
  bg_underfire: `${dataUrl}/Audio/Sound/UI_FX_BG_UnderFire.wav`,
  back: `${dataUrl}/Audio/Sound/UI_Button_Back.wav`,
};

/** 根据资源类型和参数生成统一资源地址。 */
export function getPublicAssetUrl(filename: string): string {
  return `./assets/${String(filename).replace(/^\/+/, "")}`;
}

export const MAIN_STORY_RESOURCES = {
  sceneBackground: () => getResourcesUrl("lobbyBg", "Scenario_Bg.png"),
  finalSceneBackground: () => getResourcesUrl("lobbyBg", "ScenarioF_Bg.png"),
  chapterBackground: () => getResourcesUrl("scenarioMode", "ChapterBg_1.png"),
  finalChapterBackground: () => getResourcesUrl("scenarioMode", "FChapterBg_1.png"),
  finalVolumeBackground: () => getResourcesUrl("scenarioMode", "Main_VolumeF_Bg.png"),
  finalVolumeImage: () => getResourcesUrl("scenarioMode", "Main_Volume_100.png"),
  volumeDecoration: () => getResourcesUrl("scenarioMode", "Main_Volume_Deco.png"),
  finalChapterButton: () => getPublicAssetUrl("CCG_Img_BtnBlue.png"),
  partSwitchIcon: () => getPublicAssetUrl("main-story-series-switch.svg"),
};

export function getResourcesUrl(type: ResourcesTypes, arg: string): string {
  switch (type) {
    case "eventContent":
      return `${dataUrl}/UIs/01_Common/27_EventContent/${arg}`;
    case "eventScenario":
      return `${dataUrl}/UIs/03_Scenario/06_Event/${arg}`;
    case "emotionImg":
      return `${dataUrl}/UIs/03_Scenario/03_Emoticon/${arg}`;
    case "emotionSound":
      return `${dataUrl}/Audio/Sound/${arg}.wav`;
    case "l2dVoice": {
      const voiceDirectory = arg.replace(/(?:.*\/)?([A-Z0-9]*)_MemorialLobby.*/i, "JP_$1");
      const voiceFilename = arg.split("/").pop();
      return `${dataUrl}/Audio/VoiceJp/Character_voice/${voiceDirectory}/${voiceFilename}.${oggAudioType}`;
    }
    case "l2dSpine":
      return `${dataUrl}/UIs/03_Scenario/03_MemoryLobbies/${arg}/${arg}.skel`;
    case "excel":
      return `${dataUrl}/data/${arg}?t=${Math.floor(Date.now() / 3600000)}`;
    case "bgm": {
      const path = arg.startsWith("Audio/") ? arg : `Audio/BGM/${arg}`;
      return `${dataUrl}/${/\.(ogg|mp3)$/i.test(path) ? path : `${path}.${oggAudioType}`}`;
    }
    case "sound": {
      const path = arg.startsWith("Audio/") ? arg : `Audio/Sound/${arg}`;
      return `${dataUrl}/${/\.(wav|ogg|mp3)$/i.test(path) ? path : `${path}.wav`}`;
    }
    case "voiceJp":
      return `${dataUrl}/Audio/VoiceJp/${arg}.${oggAudioType}`;
    case "voiceCn":
      return `${dataUrl}/Audio/VoiceCn/${arg}.${oggAudioType}`;
    case "voiceKr":
      return `${dataUrl}/Audio/VoiceKr/${arg}.${oggAudioType}`;
    case "characterSpine": {
      const temp = String(arg).split("/");
      let id = temp.pop();
      id = id?.replace("CharacterSpine_", "");
      if (id?.endsWith("ND")) id = id.slice(0, -2);
      const filename = `${id}_spr`;
      const directory = filename.toLowerCase();
      const characterRoot = pcMode ? "02_Character_PC" : "02_Character";
      return `${dataUrl}/UIs/03_Scenario/${characterRoot}/${directory}/${filename}.skel`;
    }
    case "lobbyBg":
      return `${dataUrl}/UIs/00_Images/Bg/${arg}`;
    case "bg":
      return `${dataUrl}/${arg}.jpg`;
    case "otherSound":
      return Reflect.get(otherSoundMap, arg) || "";
    case "bgEffectImgs":
      return `${dataUrl}/UIs/03_Scenario/03_MemoryLobbies/_mxcommon/${arg}`;
    case "ui":
      return `${dataUrl}/UIs/00_Images/Scenario/${arg}`;
    case "scenarioMode":
      return `${dataUrl}/UIs/03_Scenario/05_Mode/${arg}`;
    case "font":
      return `${dataUrl}/font/${arg}`;
    case "scenarioScript":
      return `${dataUrl}/data/ScenarioScript/${arg}`;
    case "loadingImage":
      return `${dataUrl}/UIs/01_Common/12_Loading/${arg}`;
    case "bgEffectSounds":
      return `${dataUrl}/Audio/Sound/UI_FX_${arg}.wav`;
    case "avatar":
      return `${dataUrl}/${arg}.png`;
    case "video":
      return `${dataUrl}/${String(arg).replace(/^\/+/, "")}.mp4`;
    case "videoSound":
      return `${dataUrl}/${String(arg).replace(/^\/+/, "")}.ogg`;
    case "popupImage":
      return `${dataUrl}/UIs/03_Scenario/04_ScenarioImage/${arg}.png`;
    default:
      return "";
  }
}

/** 设置资源服务器地址。 */
export function setDataUrl(url: string): void {
  dataUrl = String(url || "").replace(/\/+$/, "");
  otherSoundMap = {
    select: `${dataUrl}/Audio/Sound/UI_Button_Touch.wav`,
    bg_underfire: `${dataUrl}/Audio/Sound/UI_FX_BG_UnderFire.wav`,
    back: `${dataUrl}/Audio/Sound/UI_Button_Back.wav`,
  };
}

/** 设置 OGG 音频的替代格式。 */
export function setOggAudioType(audioType: "mp3") {
  oggAudioType = audioType;
}

/** 设置 PC 角色 Spine 资源模式。 */
export function setPCMode(enabled: boolean): void {
  pcMode = Boolean(enabled);
}

/** 获取本体资源加载所需的其他特效音地址。 */
export function getOtherSoundUrls(): string[] {
  return Object.entries(otherSoundMap).filter(([key]) => key !== "select").map(([, url]) => url);
}

// ============================================================
// 资源预加载配置
// ============================================================
export const FONT_FILES: Record<string, string> = {
  cn: "U-OTF-ShinMGoUpr-DeBold.otf",
  en: "",
  kr: "",
  jp: "",
  tw: "",
  th: "",
};

export const RESOURCE_FILES: Array<{ name: string; type: ResourcesTypes }> = [];

export const AUDIO_FILES = {
  theme12: { name: "Theme_12.ogg", type: "bgm" },
  buttonTouch: { name: "UI_Button_Touch.wav", type: "sound" },
};

const FONT_CACHE_NAME = "bluearchive-font-cache-v1";

async function getCachedFontSource(url: string): Promise<{ source: string; objectUrl: string | null }> {
  try {
    if (typeof caches === "undefined" || typeof fetch !== "function" || typeof URL.createObjectURL !== "function") {
      return { source: url, objectUrl: null };
    }
    const cache = await caches.open(FONT_CACHE_NAME);
    const request = new Request(url, { method: "GET", mode: "cors", credentials: "omit" });
    let response = await cache.match(request);
    if (!response) {
      response = await fetch(request, { cache: "force-cache" });
      if (!response.ok || response.type === "opaque") throw new Error("FONT_FETCH_FAILED");
      try { await cache.put(request, response.clone()); } catch {}
    }
    const blob = await response.blob();
    if (!blob.size) throw new Error("EMPTY_FONT_FILE");
    const objectUrl = URL.createObjectURL(blob);
    return { source: objectUrl, objectUrl };
  } catch {
    return { source: url, objectUrl: null };
  }
}

export async function loadCachedFontFace(family: string, url: string, descriptors: FontFaceDescriptors = {}): Promise<boolean> {
  const cached = await getCachedFontSource(url);
  const loadFace = async (source: string) => {
    const face = new FontFace(family, `url("${source}")`, { display: "swap", ...descriptors });
    const loaded = await face.load();
    document.fonts.add(loaded);
  };
  try {
    await loadFace(cached.source);
    return true;
  } catch {
    if (cached.source === url) return false;
    try {
      await loadFace(url);
      return true;
    } catch {
      return false;
    }
  } finally {
    if (cached.objectUrl) URL.revokeObjectURL(cached.objectUrl);
  }
}

export async function loadResources(language: string, onProgress?: (progress: number) => void) {
  const fontFile = FONT_FILES[language];
  const total = Object.keys(AUDIO_FILES).length;
  let completed = 0;
  const reportProgress = () => { completed++; onProgress?.(Math.min(99, Math.floor(completed / total * 100))); };
  const audioTasks = Object.entries(AUDIO_FILES).map(([key, config]) => new Promise((resolve) => {
    const audio = new Audio();
    const url = getResourcesUrl(config.type as "bgm" | "sound", config.name);
    const onLoaded = () => { cleanup(); reportProgress(); resolve({ key, url, loaded: true, audio }); };
    const onError = () => { cleanup(); reportProgress(); resolve({ key, url, loaded: false, audio }); };
    const cleanup = () => { audio.removeEventListener("canplaythrough", onLoaded); audio.removeEventListener("error", onError); };
    audio.addEventListener("canplaythrough", onLoaded);
    audio.addEventListener("error", onError);
    audio.preload = "auto";
    audio.src = url;
    audio.load();
  }));
  if (fontFile) {
    void loadCachedFontFace("StoryRemoteFont", getResourcesUrl("font", fontFile)).then((fontLoaded) => {
      document.documentElement.classList.toggle("remote-font-loaded", fontLoaded);
    }).catch(() => {
      document.documentElement.classList.remove("remote-font-loaded");
    });
  } else {
    document.documentElement.classList.remove("remote-font-loaded");
  }
  const audios = await Promise.all(audioTasks);
  onProgress?.(100);
  return { images: [], audios };
}

// ============================================================
// 语言与界面辅助数据
// ============================================================
export const LANGUAGE_HTML_MAP: Record<string, string> = {
  cn: "zh-CN", en: "en", kr: "ko", jp: "ja", tw: "zh-TW", th: "th",
};

export function isNightTime(date = new Date()): boolean {
  const hours = date.getHours();
  return hours >= 18 || hours < 6;
}

export function getBackgroundImage(date = new Date()): string {
  return isNightTime(date) ? "ScenarioF_Bg.png" : "Scenario_Bg.png";
}

// ============================================================
// 纯工具函数
// ============================================================
export function replaceUserNameText(value: unknown, userName: string): string {
  return String(value ?? "").replaceAll("[USERNAME]", String(userName ?? ""));
}

/** 深拷贝 JSON 兼容对象。 */
export function deepCopyObject<T>(object: T): T {
  if (typeof object !== "object") return object;
  return JSON.parse(JSON.stringify(object));
}

/** 等待指定毫秒数。 */
export function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/** 从背景特效 Excel 数据中提取特效资源名。 */
export function getEffectArray(effect: BGEffectExcelTableItem): string[] {
  const effectArray: string[] = [];
  for (const key of Object.keys(effect) as Array<keyof BGEffectExcelTableItem>) {
    const value = effect[key];
    if (key.startsWith("Effect") && typeof value === "string") effectArray.push(effect[key] as string);
  }
  return effectArray;
}

/** 判断 Spine 实例是否包含指定动画。 */
export function hasAnimation(instance: Spine, animationName: string) {
  return instance.skeleton.data.animations.some(animation => animation.name === animationName);
}

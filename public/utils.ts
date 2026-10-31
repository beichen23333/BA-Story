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
export function getResourcesUrl(type: ResourcesTypes, arg: string): string {
  switch (type) {
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
    case "bgEffectSounds":
      return `${dataUrl}/Audio/Sound/UI_FX_${arg}.wav`;
    case "avatar":
      return `${dataUrl}/${arg}.png`;
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

export const RESOURCE_FILES = [
  ...["Scenario_Bg.png", "ScenarioF_Bg.png"].map(name => ({ name, type: "lobbyBg" as const })),
  ...[
    "Scenario_Title_01_1.png", "Scenario_Title_01_2.png", "Scenario_Title_02.png",
    "Scenario_Title_03.png", "Scenario_Title_04.png", "Scenario_Mode_Bg_1.png",
    "Scenario_Mode_Bg_2.png", "Scenario_Mode_Bg_3.png",
  ].map(name => ({ name, type: "ui" as const })),
];

export const AUDIO_FILES = {
  theme12: { name: "Theme_12.ogg", type: "bgm" },
  buttonTouch: { name: "UI_Button_Touch.wav", type: "sound" },
};

/** 预加载大厅图片、字体和音频，并统一回报进度。 */
export async function loadResources(language: string, onProgress?: (progress: number) => void) {
  const imageEntries = [...RESOURCE_FILES.map(({ name, type }) => ({ name, url: getResourcesUrl(type, name) })), { name: "Growth_Bg.png", url: "/assets/Growth_Bg.png" }];
  const fontFile = FONT_FILES[language];
  const total = imageEntries.length + Object.keys(AUDIO_FILES).length + (fontFile ? 1 : 0);
  let completed = 0;
  const reportProgress = () => { completed++; onProgress?.(Math.min(99, Math.floor(completed / total * 100))); };
  const imageTasks = imageEntries.map(({ name, url }) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => { reportProgress(); resolve({ name, loaded: true }); };
    image.onerror = () => { reportProgress(); resolve({ name, loaded: false }); };
    image.src = url;
  }));
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
  let fontTask: Promise<{ fontLoaded: boolean }> = Promise.resolve({ fontLoaded: false });
  if (fontFile) {
    fontTask = (async () => {
      try {
        const font = new FontFace("StoryRemoteFont", `url("${getResourcesUrl("font", fontFile)}")`);
        const loaded = await font.load();
        document.fonts.add(loaded);
        document.documentElement.classList.add("remote-font-loaded");
        return { fontLoaded: true };
      } catch {
        document.documentElement.classList.remove("remote-font-loaded");
        return { fontLoaded: false };
      } finally { reportProgress(); }
    })();
  } else {
    document.documentElement.classList.remove("remote-font-loaded");
  }
  const [images, font, audios] = await Promise.all([Promise.all(imageTasks), fontTask, Promise.all(audioTasks)]);
  onProgress?.(100);
  return { images, ...font, audios };
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

import type { OtherSoundsUrls, ResourcesTypes } from "../player-lib/types/resources";
import type { BGEffectExcelTableItem } from "../player-lib/types/excels";
import type { Spine } from "@esotericsoftware/spine-pixi-v7";

export const RESOURCE_ROOT = "https://res.bluearchive.help/image/ba-all-data";
// import structuredClone from "@ungap/structured-clone";

// if (!("structuredClone" in globalThis)) {
//   /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
//   globalThis.structuredClone = structuredClone as any;
// }

let dataUrl = RESOURCE_ROOT;
let otherSoundMap: OtherSoundsUrls = {
  select: `${RESOURCE_ROOT}/Audio/Sound/UI_Button_Touch.wav`,
  bg_underfire: `${RESOURCE_ROOT}/Audio/Sound/UI_FX_BG_UnderFire.wav`,
  back: `${RESOURCE_ROOT}/Audio/Sound/UI_Button_Back.wav`,
};
/**
 * ogg类型的音频是否用其他音频类型代替
 */
let oggAudioType = "ogg";
let superSampling = "";

/**
 * 字面意思, 深拷贝json
 */
export function deepCopyObject<T>(object: T): T {
  if (typeof object !== "object") {
    return object;
  }
  // DataCloneError: Failed to execute 'structuredClone' on 'Window': [object Array] could not be cloned.
  // return structuredClone(object); 
  return JSON.parse(JSON.stringify(object));
}

/**
 * 获取其他特效音资源, 用于本体资源加载
 * @returns
 */
export function getOtherSoundUrls(): string[] {
  return Object.entries(otherSoundMap).filter(([key]) => key !== "select").map(([, url]) => url);
}

/**
 * 获取 spine v4.2 资源地址
 * @param url
 * @returns
 */
function getSpine42Url(url: string) {
  return rewritePath(url.replaceAll("ba-all-data", "ba-all-data-spine42"));
}

/**
 * 重写路径，把所有大写转小写
 * @param path
 * @returns
 */
function rewritePath(path: string) {
  const rewritten = path.toLocaleLowerCase();
  if (rewritten !== path) {
    console.log("redirected:\n" + path + " -> " + rewritten);
  }
  return rewritten;
}

/**
 * 根据资源类型和参数获取资源地址, 可根据服务器实际情况修改
 * @param type
 * @param arg
 * @returns
 */
export function getResourcesUrl(type: ResourcesTypes, arg: string): string {
  switch (type) {
    case "emotionImg":
      return `${dataUrl}/emotions/${arg}`;
    case "emotionSound":
      return `${dataUrl}/Audio/Sound/${arg}.wav`;
    case "fx":
      return `${dataUrl}/effectTexture/${arg}`;
    case "l2dVoice":
      //arg "sound/CH0184_MemorialLobby_1_1"
       
      const voiceDirectory = arg.replace(
        /(?:.*\/)?([A-Z0-9]*)_MemorialLobby.*/i,
        "JP_$1"
      );
       
      const voiceFilename = arg.split("/").pop();
      return `${dataUrl}/Audio/VoiceJp/Character_voice/${voiceDirectory}/${voiceFilename}.${oggAudioType}`;
    case "l2dSpine":
      return getSpine42Url(`${dataUrl}/spine/${arg}/${arg}.skel`);
    case "otherL2dSpine":
      return getSpine42Url(`${dataUrl}/spine/${arg}.skel`);
    case "excel":
      // return `${dataUrl}/data/${arg}`; // FIXME: 临时禁用缓存
      return `${dataUrl}/data/${arg}?t=${Math.floor(Date.now() / 3600000)}`;
    case "bgm":
      return `${dataUrl}/${arg}.${oggAudioType}`;
    case "sound":
      return `${dataUrl}/Audio/Sound/${arg}.wav`;
    case "voiceJp":
      return `${dataUrl}/Audio/VoiceJp/${arg}.${oggAudioType}`;
    case "voiceCn":
      return `${dataUrl}/Audio/VoiceCn/${arg}.${oggAudioType}`;
    case "voiceKr":
      return `${dataUrl}/Audio/VoiceKr/${arg}.${oggAudioType}`;
    case "characterSpine":
      //arg UIs/03_Scenario/02_Character/CharacterSpine_hasumi
       
      const temp = String(arg).split("/");
       
      let id = temp.pop();
      id = id?.replace("CharacterSpine_", "");
      if (id?.endsWith("ND")) {
        id = id.slice(0, id.length - 2);
      }
       
      const filename = `${id}_spr`; //hasumi_spr
       
      const skelPath = superSampling
        ? `${dataUrl}/spine/${filename}/${filename}${superSampling}/${filename}.skel`
        : `${dataUrl}/spine/${filename}/${filename}.skel`;
      // ch*/np* sprites exist only on ba-all-data-spine42 (Spine 4.2).
      // named sprites — on ba-all-data (Spine 4.2); spine42 has stale 3.8 copies
      // FIXME: CI intervention needed
      if (/^(ch|np)\d+/i.test(id ?? "")) {
        return getSpine42Url(skelPath);
      }
      return rewritePath(skelPath);
    case "bg":
      // UIs/03_Scenario/01_Background/BG_WinterRoad.jpg
      if (superSampling && /01_Background/.test(arg)) {
        const pathArr = arg.split("/");
        const lastFileName = pathArr.pop();
        const dir = pathArr.join("/");
        return `${dataUrl}/${dir}/01_Background${superSampling}/${lastFileName}.png`;
      }
      return `${dataUrl}/${arg}.jpg`;
    case "otherSound":
      return Reflect.get(otherSoundMap, arg) || "";
    case "bgEffectImgs":
      return `${dataUrl}/effectTexture/${arg}`;
    case "bgEffectSounds":
      return `${dataUrl}/Audio/Sound/UI_FX_${arg}.wav`;
    case "avatar":
      //arg: UIs/01_Common/01_Character/Student_Portrait_Hasumi
      return `${dataUrl}/${arg}.png`;
    case "popupImage":
      return `${dataUrl}/UIs/03_Scenario/04_ScenarioImage/${arg}.png`;
    default:
      return "";
  }
}

/**
 * 设置数据站点
 * @param url
 */
export function setDataUrl(url: string): void {
  dataUrl = url;
  otherSoundMap = {
    select: `${dataUrl}/Audio/Sound/UI_Button_Touch.wav`,
    bg_underfire: `${dataUrl}/Audio/Sound/UI_FX_BG_UnderFire.wav`,
    back: `${dataUrl}/Audio/Sound/UI_Button_Back.wav`,
  };
}

/**
 * 设置ogg类型音频的替代音频类型
 */
export function setOggAudioType(audioType: "mp3") {
  oggAudioType = audioType;
}

export function setSuperSampling(type: "2" | "4" | "" | boolean) {
  if (type === true) {
    superSampling = "-2x";
  } else {
    superSampling = `-${type}x`;
  }
}

/*
 * wait in promise
 */
export function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function getEffectArray(effect: BGEffectExcelTableItem): string[] {
  const effectArray: string[] = [];
  for (const key of Object.keys(effect) as Array<
    keyof BGEffectExcelTableItem
  >) {
    const value = effect[key];
    if (key.startsWith("Effect") && typeof value === "string") {
      effectArray.push(effect[key] as string);
    }
  }

  return effectArray;
}

export function hasAnimation(instance: Spine, animationName: string) {
  return instance.skeleton.data.animations.some(
    animation => animation.name === animationName
  );
}


export const RESOURCE_PATHS = {
  ui: "Scenario_UI",
  scenarioMode: "Scenario_UI/mode",
  font: "font",
  bgm: "Audio/BGM",
  sound: "Audio/Sound",
};

export const FONT_FILES: Record<string, string> = {
  cn: "U-OTF-ShinMGoUpr-DeBold.otf",
  en: "",
  kr: "",
  jp: "",
  tw: "",
  th: "",
};

export const RESOURCE_FILES = [
  "Scenario_Bg.png",
  "ScenarioF_Bg.png",
  "Scenario_Title_01_1.png",
  "Scenario_Title_01_2.png",
  "Scenario_Title_02.png",
  "Scenario_Title_03.png",
  "Scenario_Title_04.png",
  "Scenario_Mode_Bg_1.png",
  "Scenario_Mode_Bg_2.png",
  "Scenario_Mode_Bg_3.png",
];

export const AUDIO_FILES = {
  theme12: { name: "Theme_12.ogg", type: "bgm" },
  buttonTouch: { name: "UI_Button_Touch.wav", type: "sound" },
};

export const LANGUAGE_HTML_MAP: Record<string, string> = {
  cn: "zh-CN",
  en: "en",
  kr: "ko",
  jp: "ja",
  tw: "zh-TW",
  th: "th",
};

export const SUB_CHAPTER_FILES = Array.from({ length: 26 }, (_, index) => `mode/Sub_Chapter_${index + 1}_1.png`);

export function getSubChapterResourceName(storyNumber: number | string): string {
  const number = Number(storyNumber);
  return Number.isInteger(number) && number >= 1 && number <= 26 ? SUB_CHAPTER_FILES[number - 1] : "";
}

export function resourceUrl(type: keyof typeof RESOURCE_PATHS, name: string): string {
  const folder = RESOURCE_PATHS[type];
  if (!folder || !name) return "";
  return `${RESOURCE_ROOT}/${folder}/${name}`;
}

export function asset(name: string): string {
  return resourceUrl("ui", name);
}

export function audioAsset(name: string | { name: string }): string {
  return resourceUrl("bgm", typeof name === "object" ? name.name : name);
}

export function soundAsset(name: string | { name: string }): string {
  return resourceUrl("sound", typeof name === "object" ? name.name : name);
}

export function isNightTime(date = new Date()): boolean {
  const hours = date.getHours();
  return hours >= 18 || hours < 6;
}

export function getBackgroundImage(date = new Date()): string {
  return isNightTime(date) ? "ScenarioF_Bg.png" : "Scenario_Bg.png";
}

export async function loadResources(language: string, onProgress?: (progress: number) => void) {
  const imageEntries = [...RESOURCE_FILES.map((name) => ({ name, url: asset(name) })), { name: "Growth_Bg.png", url: "/assets/Growth_Bg.png" }];
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
    const url = resourceUrl(config.type as "bgm" | "sound", config.name);
    const onLoaded = () => { cleanup(); reportProgress(); resolve({ key, url, loaded: true, audio }); };
    const onError = () => { cleanup(); reportProgress(); resolve({ key, url, loaded: false, audio }); };
    const cleanup = () => {
      audio.removeEventListener("canplaythrough", onLoaded);
      audio.removeEventListener("error", onError);
    };
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
        const font = new FontFace("StoryRemoteFont", `url("${resourceUrl("font", fontFile)}")`);
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

export function subChapterAsset(storyNumber: number | string): string {
  const name = getSubChapterResourceName(storyNumber);
  return name ? asset(name) : "";
}

/** Build the server-side scenario script URL for a GroupId. */
export function getScenarioScriptUrl(groupId: number | string): string {
  const id = String(groupId ?? "").trim();
  return /^\d+$/.test(id) ? `${RESOURCE_ROOT}/data/ScenarioScript/${id}.json` : "";
}

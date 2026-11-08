import { dataUrl, getResourcesUrl } from "../../shared/utils.ts";

export type CostumeLanguage = "cn" | "en" | "kr" | "jp" | "tw" | "th";

export interface CostumeExcelItem {
  CostumeGroupId: number;
  DevName: string;
  SpineResourceName: string;
  CampaignCompleteAnimationName: string;
  CampaignFailAnimationName: string;
  CollectionTexturePath: string;
  CollectionBGTexturePath: string;
  School?: string;
  Club?: string;
  NameKr?: string;
  NameJp?: string;
  NameCn?: string;
  NameTw?: string;
  NameEn?: string;
  ScenarioCharacter?: string;
}

/** 好感剧情学生数据直接复用 CostumeExcel 类型。 */
export type StudentStoryData = CostumeExcelItem;

let costumeExcelRequest: Promise<CostumeExcelItem[]> | null = null;

function isOptionalStringField(item: Record<string, unknown>, key: string): boolean {
  return item[key] === undefined || item[key] === null || typeof item[key] === "string";
}

function isCostumeExcelItem(value: unknown): value is CostumeExcelItem {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return typeof item.CostumeGroupId === "number"
    && typeof item.DevName === "string"
    && typeof item.SpineResourceName === "string"
    && typeof item.CampaignCompleteAnimationName === "string"
    && typeof item.CampaignFailAnimationName === "string"
    && typeof item.CollectionTexturePath === "string"
    && typeof item.CollectionBGTexturePath === "string"
    && ["School", "Club", "NameKr", "NameJp", "NameCn", "NameTw", "NameEn", "ScenarioCharacter"].every((key) => isOptionalStringField(item, key));
}

/** 读取并缓存 CostumeExcel；请求失败后清除缓存，允许页面重试。 */
export function loadCostumeExcel(forceRefresh = false): Promise<CostumeExcelItem[]> {
  if (forceRefresh) costumeExcelRequest = null;
  if (!costumeExcelRequest) {
    costumeExcelRequest = fetch(getResourcesUrl("excel", "CostumeExcel.json"))
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<unknown>;
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("INVALID_COSTUME_EXCEL");
        return data.filter(isCostumeExcelItem);
      })
      .catch((error: unknown) => {
        costumeExcelRequest = null;
        throw error;
      });
  }
  return costumeExcelRequest;
}

const NAME_FIELD_BY_LANGUAGE: Record<CostumeLanguage, keyof CostumeExcelItem> = {
  cn: "NameCn",
  en: "NameEn",
  kr: "NameKr",
  jp: "NameJp",
  tw: "NameTw",
  // 当前数据没有 NameTh，泰语界面暂时显示英语名称。
  th: "NameEn",
};

const COLLATOR_BY_LANGUAGE: Record<CostumeLanguage, Intl.Collator> = {
  cn: new Intl.Collator("zh-CN-u-co-pinyin", { usage: "sort", sensitivity: "base", numeric: true }),
  en: new Intl.Collator("en-US", { usage: "sort", sensitivity: "base", numeric: true }),
  kr: new Intl.Collator("ko-KR", { usage: "sort", sensitivity: "base", numeric: true }),
  jp: new Intl.Collator("ja-JP", { usage: "sort", sensitivity: "base", numeric: true }),
  tw: new Intl.Collator("zh-TW-u-co-pinyin", { usage: "sort", sensitivity: "base", numeric: true }),
  // 当前 CostumeExcel 未提供 NameTh，泰语界面使用 NameEn，因此采用英文排序规则。
  th: new Intl.Collator("en-US", { usage: "sort", sensitivity: "base", numeric: true }),
};

/** 根据当前界面语言读取角色名称；缺少对应字段时回退到其他已维护名称。 */
export function getCostumeDisplayName(costume: CostumeExcelItem, language: CostumeLanguage = "cn"): string {
  const preferredField = NAME_FIELD_BY_LANGUAGE[language] || NAME_FIELD_BY_LANGUAGE.cn;
  const localizedName = costume[preferredField];
  if (typeof localizedName === "string" && localizedName.trim()) return localizedName.trim();
  const fallbackName = [costume.NameEn, costume.NameCn, costume.NameJp, costume.NameKr, costume.NameTw, costume.DevName.replace(/_default$/i, "")].find((name) => typeof name === "string" && name.trim());
  return fallbackName?.trim() || "";
}

/** 按当前语言的名称首字母排序；名称相同时以完整名称和角色 ID 保持稳定顺序。 */
export function compareCostumeByInitial(left: CostumeExcelItem, right: CostumeExcelItem, language: CostumeLanguage = "cn"): number {
  const collator = COLLATOR_BY_LANGUAGE[language] || COLLATOR_BY_LANGUAGE.cn;
  const leftName = getCostumeDisplayName(left, language).trim();
  const rightName = getCostumeDisplayName(right, language).trim();
  const leftInitial = Array.from(leftName)[0] || "";
  const rightInitial = Array.from(rightName)[0] || "";
  return collator.compare(leftInitial, rightInitial)
    || collator.compare(leftName, rightName)
    || left.CostumeGroupId - right.CostumeGroupId;
}

/** CostumeExcel 的 CollectionTexturePath 是不带扩展名的图片资源路径。 */
export function getCostumeCollectionTextureUrl(path: string): string {
  const normalizedPath = String(path || "").replace(/^\/+/, "").replace(/\.png$/i, "");
  return normalizedPath ? `${dataUrl}/${normalizedPath}.png` : "";
}

/** CostumeExcel 的 CollectionBGTexturePath 是不带扩展名的学生背景资源路径。 */
export function getCostumeCollectionBackgroundUrl(path: string): string {
  const normalizedPath = String(path || "").replace(/^\/+/, "").replace(/\.png$/i, "");
  return normalizedPath ? `${dataUrl}/${normalizedPath}.png` : "";
}

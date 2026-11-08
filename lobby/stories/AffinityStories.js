import { excelApi } from "../../player-lib/api/index.ts";

/** @typedef {import("../../player-lib/api/index.ts").CharacterExcelItem} CharacterExcelItem */
/** 通过项目现有 Excel API 获取角色数据，API 层负责重试与请求缓存。 */
export function getCharacterExcel() {
    /** @type {Promise<CharacterExcelItem[]>} */
    return excelApi.getCharacterExcel();
}

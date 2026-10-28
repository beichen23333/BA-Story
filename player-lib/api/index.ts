import axios, { AxiosInstance } from "axios";
import { getResourcesUrl } from "../../public/utils.ts";
import { retry } from "radash";

const api: AxiosInstance = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

interface ExcelResponse<T> {
  DataList: T[];
}

// 封装重试请求
async function retryableRequest<T>(fn: () => Promise<T>): Promise<T> {
  return retry(
    {
      times: 3,
      delay: 1000,
    },
    async () => fn()
  );
}

// exceltable API
export const excelApi = {
  async getBGNameExcel() {
    return retryableRequest(async () => {
      const { data } = await api.get<any>(
        getResourcesUrl("excel", "ScenarioBGNameExcel.json")
      );
      return data;
    });
  },

  async getCharacterNameExcel() {
    return retryableRequest(async () => {
      const { data } = await api.get<any>(
        getResourcesUrl("excel", "ScenarioCharacterNameExcel.json")
      );
      return data;
    });
  },

  async getBGMExcel() {
    return retryableRequest(async () => {
      const { data } = await api.get<any>(
        getResourcesUrl("excel", "BGMExcel.json")
      );
      return data;
    });
  },

  async getTransitionExcel() {
    return retryableRequest(async () => {
      const { data } = await api.get<any>(
        getResourcesUrl("excel", "ScenarioTransitionExcel.json")
      );
      return data;
    });
  },

  async getBGEffectExcel() {
    return retryableRequest(async () => {
      const { data } = await api.get<any>(
        getResourcesUrl("excel", "ScenarioBGEffectExcel.json")
      );
      return data;
    });
  },

  async getEmotionExcel() {
    return retryableRequest(async () => {
      const { data } = await api.get<any>(
        getResourcesUrl("excel", "ScenarioCharacterEmotionExcel.json")
      );
      return data;
    });
  },
};

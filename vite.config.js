import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import ElementPlus from "unplugin-element-plus/vite";

export default defineConfig({
  plugins: [
    react(),
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    ElementPlus({
      useSource: true,
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./player-lib"),
      "@assets": resolve(import.meta.dirname, "./lobby/player-scss"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@assets/index.scss" as *;',
        api: "modern-compiler",
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// 빌드 시간 생성
const buildTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

// @ts-expect-error process is a nodejs global
const appVersion = process.env.npm_package_version || '0.1.0';
// @ts-expect-error process is a nodejs global
const isTauriBuild = !!process.env.TAURI_ENV_PLATFORM;
// @ts-expect-error process is a nodejs global
const isGitHubActions = !!process.env.GITHUB_ACTIONS;
// @ts-expect-error process is a nodejs global
const isEmbedBuild = !!process.env.EMBED_BUILD;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // 환경변수로 버전과 빌드 시간 주입
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },

  // base path 설정:
  // - EMBED_BUILD: 상대 경로 (다른 앱에 임베드 시)
  // - GitHub Actions: /storynode/
  // - Tauri/기본: /
  base: isEmbedBuild ? './' : (isGitHubActions && !isTauriBuild ? '/storynode/' : '/'),

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 9420,
    strictPort: true,
    host: host || '0.0.0.0',
    hmr: {
      protocol: "ws",
      ...(host && { host, port: 9421 }),
    },
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));

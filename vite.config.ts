import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { nitro } from "nitro/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
  server: {
    // 개발 서버에서 /graphql을 사내 서버로 프록시 — 브라우저 CORS 없이 실서버 연동
    proxy: {
      "/graphql": {
        target: "http://168.107.16.45",
        changeOrigin: true,
      },
    },
  },
  // 테스트는 항상 목 모드 — 로컬 .env의 VITE_USE_MOCK에 결과가 흔들리면 안 된다
  test: {
    env: { VITE_USE_MOCK: "true" },
  },
  plugins: [
    devtools(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      router: {
        entry: "./app/router.tsx",
        routesDirectory: "./app/routes",
        generatedRouteTree: "./routeTree.gen.ts",
      },
    }),
    // Vercel 배포용 서버 번들 변환 — 없으면 SSR 함수가 생성되지 않아 404 (Vercel 공식 TanStack Start 가이드)
    nitro(),
    viteReact(),
  ],
})

export default config

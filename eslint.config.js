//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"
import boundaries from "eslint-plugin-boundaries"

// FSD 레이어: app > pages > widgets > features > entities > shared
// 규칙 출처: .claude/rules/front.md — 단방향 의존성 + 슬라이스 간 직접 import 금지 + index.ts 공개 API
const fsdBoundaries = {
  files: ["src/**/*.ts", "src/**/*.tsx"],
  plugins: { boundaries },
  settings: {
    "import/resolver": {
      typescript: { project: "./tsconfig.json" },
    },
    "boundaries/elements": [
      { type: "app", pattern: "src/app/**" },
      { type: "pages", pattern: "src/pages/*/**", capture: ["slice"] },
      { type: "widgets", pattern: "src/widgets/*/**", capture: ["slice"] },
      { type: "features", pattern: "src/features/*/**", capture: ["slice"] },
      { type: "entities", pattern: "src/entities/*/**", capture: ["slice"] },
      { type: "shared", pattern: "src/shared/**" },
    ],
  },
  rules: {
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        message:
          "FSD 레이어 위반: ${file.type}에서 ${dependency.type} import 불가 (.claude/rules/front.md 참조)",
        rules: [
          {
            from: "app",
            allow: [
              "app",
              "pages",
              "widgets",
              "features",
              "entities",
              "shared",
            ],
          },
          {
            from: "pages",
            allow: [
              ["pages", { slice: "${from.slice}" }],
              "widgets",
              "features",
              "entities",
              "shared",
            ],
          },
          {
            from: "widgets",
            allow: [
              ["widgets", { slice: "${from.slice}" }],
              "features",
              "entities",
              "shared",
            ],
          },
          {
            from: "features",
            allow: [
              ["features", { slice: "${from.slice}" }],
              "entities",
              "shared",
            ],
          },
          {
            from: "entities",
            allow: [["entities", { slice: "${from.slice}" }], "shared"],
          },
          { from: "shared", allow: ["shared"] },
        ],
      },
    ],
    // entry-point(공개 API index.ts 우회 금지) 룰은 오탐 있어서 보류.
    // 현재 코드베이스는 전부 index.ts 통해서만 import하고 있어(스캔 완료) 급하지 않음.
  },
}

export default [
  {
    ignores: [
      "storybook-static/**",
      ".output/**",
      ".vercel/**",
      "public/sw.js",
    ],
  },
  ...tanstackConfig,
  fsdBoundaries,
]

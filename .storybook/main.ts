import tailwindcss from "@tailwindcss/vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { mergeConfig } from "vite"
import type { StorybookConfig } from "@storybook/react-vite"
import type { PluginOption } from "vite"

const tanstackPluginPattern = /tanstack/i

function isNamedPlugin(plugin: unknown): plugin is { name: string } {
  return typeof plugin === "object" && plugin !== null && "name" in plugin
}

function withoutTanStackPlugins(
  plugins: Array<PluginOption> = []
): Array<PluginOption> {
  return plugins.flatMap((plugin) => {
    if (Array.isArray(plugin)) {
      return withoutTanStackPlugins(plugin)
    }

    if (isNamedPlugin(plugin) && tanstackPluginPattern.test(plugin.name)) {
      return []
    }

    return [plugin]
  })
}

const storybookConfig: StorybookConfig = {
  // 사이드바 그룹 = 코드 위치 (shared/ui → "shared/*", ui 세그먼트 생략).
  // 새 레이어(features 등)에 스토리가 생기면 여기에 specifier를 추가해야 한다.
  stories: [
    { directory: "../src/shared/config/theme" }, // Foundations/* (파일별 명시 title)
    { directory: "../src/shared/ui", titlePrefix: "shared" },
    { directory: "../src/widgets" }, // Widgets/* (파일별 명시 title 필수)
  ],
  addons: ["@storybook/addon-docs"],
  staticDirs: ["../public"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: (viteConfig) =>
    mergeConfig(
      {
        ...viteConfig,
        plugins: withoutTanStackPlugins(viteConfig.plugins),
      },
      {
        plugins: [
          tsconfigPaths({
            projects: ["./tsconfig.json"],
          }),
          tailwindcss(),
        ],
      }
    ),
}

export default storybookConfig

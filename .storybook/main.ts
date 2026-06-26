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
  stories: ["../src/**/*.stories.@(ts|tsx)"],
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

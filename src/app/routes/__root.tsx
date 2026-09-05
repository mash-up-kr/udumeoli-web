import * as React from "react"
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { OverlayProvider } from "overlay-kit"
import appCss from "../styles.css?url"
import { DesktopGuide } from "@/widgets/desktop-guide"

import { QueryProvider } from "@/shared/api/QueryProvider"
import { PwaRuntime } from "@/shared/ui/pwa-runtime"

// Microsoft Clarity 사용자 행동 분석 스니펫
const CLARITY_SNIPPET = `(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "xl5xvglqsb");`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "Pinnned" },
      {
        name: "description",
        content:
          "친구들과 팟을 만들어 여행 기록으로 우리만의 지도를 채워보세요. 함께 만드는 여행 지도, Pinnned.",
      },
      // 카카오톡 등 링크 공유 미리보기용 OG 태그 — og:image는 절대 URL 필수
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Pinnned" },
      { property: "og:description", content: "🩵 👉 Pinnned 사용해보기 👈 🩵" },
      {
        property: "og:image",
        content: "https://www.pinnned.co.kr/og-image.jpg",
      },
      { property: "og:url", content: "https://www.pinnned.co.kr/" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "theme-color",
        content: "#76bdf3",
      },
      {
        name: "apple-mobile-web-app-capable",
        content: "yes",
      },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "default",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
    ],
    scripts: [{ children: CLARITY_SNIPPET }],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        <PwaRuntime />
        <QueryProvider>
          <DesktopGuide>
            <OverlayProvider>{children}</OverlayProvider>
          </DesktopGuide>
        </QueryProvider>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

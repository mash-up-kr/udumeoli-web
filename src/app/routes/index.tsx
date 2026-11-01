import { createFileRoute } from "@tanstack/react-router"
import { LandingPage } from "@/pages/landing/ui/LandingPage"

const SITE_URL = "https://www.pinnned.co.kr/"
const DESCRIPTION =
  "친구들과 팟을 만들어 여행 기록으로 우리만의 지도를 채워보세요. 함께 만드는 여행 지도, Pinnned."

// 검색엔진이 "Pinnned"를 오타(pinned)가 아닌 고유 서비스명으로 인식하도록 엔터티를 선언한다.
// 앱스토어·SNS가 생기면 Organization.sameAs에 URL을 추가한다.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "Pinnned",
      url: SITE_URL,
      logo: `${SITE_URL}icon-512.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      name: "Pinnned",
      url: SITE_URL,
      inLanguage: "ko",
      publisher: { "@id": `${SITE_URL}#organization` },
    },
    {
      "@type": "WebApplication",
      name: "Pinnned",
      url: SITE_URL,
      description: DESCRIPTION,
      applicationCategory: "TravelApplication",
      operatingSystem: "Web",
      inLanguage: "ko",
      image: `${SITE_URL}og-image.jpg`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
      publisher: { "@id": `${SITE_URL}#organization` },
    },
  ],
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      // 탭에서 잘리지 않게 브랜드명만 — 키워드는 h1·description·구조화 데이터가 담당
      { title: "Pinnned" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(STRUCTURED_DATA),
      },
    ],
  }),
  component: LandingPage,
})

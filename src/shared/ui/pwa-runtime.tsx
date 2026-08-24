import * as React from "react"
import activitySticker from "@/shared/assets/map-stickers/activity.png"
import dessertSticker from "@/shared/assets/map-stickers/dessert.png"
import foodSticker from "@/shared/assets/map-stickers/food.png"
import healingSticker from "@/shared/assets/map-stickers/healing.png"
import photoSticker from "@/shared/assets/map-stickers/photo.png"
import logoSrc from "@/shared/assets/logo-pinnned.svg"
import skyBackgroundSrc from "@/shared/assets/sky-background.png"

const SPLASH_DURATION_MS = 3600

const STICKERS = [
  {
    src: photoSticker,
    alt: "",
    className: "left-[11%] top-[32%] h-[21%] w-[21%]",
    delay: "0.7s",
  },
  {
    src: dessertSticker,
    alt: "",
    className: "right-[10%] top-[31%] h-[20%] w-[20%]",
    delay: "0.9s",
  },
  {
    src: foodSticker,
    alt: "",
    className: "left-[10%] top-[49%] h-[20%] w-[20%]",
    delay: "1.1s",
  },
  {
    src: activitySticker,
    alt: "",
    className: "right-[9%] top-[47%] h-[21%] w-[21%]",
    delay: "1.3s",
  },
  {
    src: healingSticker,
    alt: "",
    className: "right-[31%] top-[54%] h-[18%] w-[18%]",
    delay: "1.5s",
  },
]

function isStandaloneApp(): boolean {
  if (typeof window === "undefined") return false
  const standaloneNavigator = navigator as Navigator & {
    standalone?: boolean
  }
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    standaloneNavigator.standalone === true
  )
}

export function PwaRuntime() {
  const [showSplash, setShowSplash] = React.useState(false)

  React.useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js")
    }

    if (!isStandaloneApp()) return

    setShowSplash(true)
    const timer = window.setTimeout(
      () => setShowSplash(false),
      SPLASH_DURATION_MS
    )

    return () => window.clearTimeout(timer)
  }, [])

  if (!showSplash) return null

  return (
    <div
      aria-label="Pinnned 로딩 중"
      className="pwa-splash fixed inset-y-0 left-1/2 z-[100] w-full max-w-md -translate-x-1/2 overflow-hidden bg-[#76bdf3]"
      role="status"
    >
      <div
        className="pwa-splash__clouds absolute -inset-[10%] bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${skyBackgroundSrc})` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {STICKERS.map((sticker) => (
          <img
            key={sticker.src}
            alt={sticker.alt}
            className={`pwa-splash__sticker absolute object-contain ${sticker.className}`}
            src={sticker.src}
            style={{ animationDelay: sticker.delay }}
          />
        ))}
        <div className="absolute top-[50%] left-1/2 z-10 w-[62%] -translate-x-1/2 -translate-y-1/2">
          <img
            alt="Pinnned"
            className="pwa-splash__logo block w-full"
            src={logoSrc}
          />
        </div>
      </div>
      <style>{`
        .pwa-splash__clouds {
          background-position: center bottom;
          transform-origin: center bottom;
          animation: pwa-splash-clouds 1000ms linear both;
          will-change: transform;
        }

        .pwa-splash__logo {
          filter: drop-shadow(0 5px 0 rgba(255, 255, 255, .85));
          animation: pwa-splash-logo 1000ms cubic-bezier(.2, 1.4, .45, 1) both;
        }

        .pwa-splash__sticker {
          opacity: 0;
          will-change: transform, opacity;
          animation: pwa-splash-stamp 700ms cubic-bezier(.2, 1.5, .45, 1) both;
        }

        .pwa-splash {
          animation: pwa-splash-exit 3600ms ease both;
        }

        @keyframes pwa-splash-clouds {
          from { transform: scale(1.04) translate3d(-8%, 0, 0); }
          to { transform: scale(1.08) translate3d(8%, 0, 0); }
        }

        @keyframes pwa-splash-logo {
          0% { opacity: 0; transform: scale(.72) rotate(-3deg); }
          68% { opacity: 1; transform: scale(1.06) rotate(1deg); }
          84% { transform: scale(.97) rotate(-.5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }

        @keyframes pwa-splash-stamp {
          0% { opacity: 0; transform: translateY(-10px) scale(1.4) rotate(-8deg); }
          58% { opacity: 1; transform: translateY(2px) scale(.9) rotate(2deg); }
          78% { transform: translateY(0) scale(1.04) rotate(-1deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
        }

        @keyframes pwa-splash-exit {
          0%, 87% { opacity: 1; }
          100% { opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pwa-splash__clouds,
          .pwa-splash,
          .pwa-splash__logo,
          .pwa-splash__sticker {
            animation: none;
          }

          .pwa-splash__logo,
          .pwa-splash__sticker {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}

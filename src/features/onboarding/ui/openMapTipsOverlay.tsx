import { useEffect, useState } from "react"
import { overlay } from "overlay-kit"

import photoGyeongjuSrc from "../assets/map-tip-gyeongju.jpg"
import photoBeachSrc from "../assets/map-tip-beach.jpg"
import photoAlleySrc from "../assets/map-tip-alley.jpg"
import { cn } from "@/shared/lib/utils"
import iconAddSrc from "@/shared/assets/icon-add.svg"
import iconCameraAddSrc from "@/shared/assets/icon-camera-add.svg"
import skyBackgroundSrc from "@/shared/assets/sky-background.png"

// 팟별 노출 이력 — "팟과 함께 지도에 처음 진입할 때 1회"를 팟 단위로 저장해
// 새 팟에 참여했을 때도 안내가 다시 뜬다. 구 계정 단위 키(photato-map-tips-seen)는
// 화면이 전면 개편(2632-37760)되어 의도적으로 무시한다 — 기존 유저도 새 안내를 1회 본다.
const SEEN_KEY = "photato-map-tips-seen-pots"
const LEGACY_SEEN_KEY = "photato-map-tips-seen"

function readSeenPotIds(): Array<string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]")
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : []
  } catch {
    return []
  }
}

// 56px 표시용 축소본(3x) — 원본(Figma export, 2~3MB)은 프레임보다 사진이 한참 늦게 떠서 분리
const TIP_PHOTOS = [photoGyeongjuSrc, photoBeachSrc, photoAlleySrc]

function preloadImage(src: string): Promise<void> {
  const img = new Image()
  img.src = src
  // 실패해도 오버레이는 띄운다 — 사진 없이 프레임만 보이는 기존 동작으로 폴백
  return img.decode().catch(() => {})
}

// 디코드가 이 시간 안에 안 끝나면(네트워크 정체 등) 사진 없이라도 본문을 띄운다 —
// 배경만 덮인 채 닫을 수단이 없는 상태로 사용자를 막아두지 않기 위한 상한
const PHOTOS_READY_TIMEOUT_MS = 1500

// STEP 1 → STEP 2 → 시작하기가 시간차를 두고 내려오는 공통 등장 모션 —
// transform·opacity만 움직이고(GPU 합성) fill-mode-backwards로 delay 동안 숨긴다
const ENTER_BLOCK =
  "animate-in duration-500 ease-out will-change-[transform,opacity] fade-in-0 slide-in-from-top-3 fill-mode-backwards"

// 예시 사진 카드 — 56×65 · radius 16 · 3px 흰 테두리 (Figma 2632-37831 image Frame)
function PhotoFrame({
  src,
  cropPosition,
  className,
}: {
  src: string
  /** 피사체가 크롭 안에 들어오도록 object-position 지정 */
  cropPosition: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "absolute block h-[65px] w-14 overflow-hidden rounded-[16px] border-3 border-stroke-neutral-inverse shadow-[0px_0px_12px_0px_rgba(79,85,102,0.2)]",
        className
      )}
    >
      <img
        src={src}
        alt=""
        className="size-full object-cover"
        style={{ objectPosition: cropPosition }}
      />
    </span>
  )
}

function MapTipsOverlay({
  onStart,
  unmount,
}: {
  onStart?: () => void
  unmount: () => void
}) {
  // 배경(블러)은 지도와 같은 프레임에 바로 덮고, 본문은 사진 3장 디코드가 끝난 뒤에
  // 마운트해 순차 등장을 시작한다 — 프레임(테두리)만 먼저 뜨는 것도, 지도가 잠깐
  // 맨살로 보였다가 블러가 덮이는 깜빡임도 없앤다
  const [photosReady, setPhotosReady] = useState(false)
  useEffect(() => {
    let cancelled = false
    const timeout = new Promise<void>((resolve) =>
      setTimeout(resolve, PHOTOS_READY_TIMEOUT_MS)
    )
    void Promise.race([
      Promise.all(TIP_PHOTOS.map(preloadImage)),
      timeout,
    ]).then(() => {
      if (!cancelled) setPhotosReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      {/* 배경 — 온보딩과 같은 하늘 사진으로 불투명하게 덮는다. 시안은 지도 위 블러(Dim_white)지만
          실제로는 지도 타일이 로드되며 블러 뒤 배경이 계속 변해 산만하고, 온보딩(하늘)→안내로
          넘어올 때 배경이 끊긴다 — 하늘로 통일해 전 구간 한 배경으로 잇는다 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 overflow-hidden bg-bg-neutral-subtle"
      >
        <img
          src={skyBackgroundSrc}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        {/* 온보딩 오버레이와 동일한 블러 그라디언트 (끝색 #66BDFF는 팔레트 밖 → blue-500) */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-blue-500/20 backdrop-blur-[30px]" />
        <div className="absolute inset-x-0 top-0 h-[163px] bg-gradient-to-b from-white/80 to-transparent" />
      </div>

      {/* 화면이 낮아도 겹치지 않도록 flex 중앙 정렬 + 넘치면 스크롤 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="지도 사용 안내"
        className="fixed inset-y-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col overflow-y-auto"
      >
        {/* STEP 1 → STEP 2(사진 포함) → 시작하기 순으로 300ms 간격 순차 등장 */}
        {photosReady && (
          <div className="m-auto flex w-[210px] flex-col items-center gap-8 py-10">
            {/* STEP 1 — 여행지 선택 (Figma 2632-37820) */}
            <div
              className={cn("flex flex-col items-center gap-3", ENTER_BLOCK)}
            >
              <span className="flex size-8 items-center justify-center rounded-full border-[2.86px] border-stroke-neutral-bold">
                <img src={iconAddSrc} alt="" className="size-[23px]" />
              </span>
              <div className="flex flex-col gap-1 text-center">
                <p className="text-h9 text-fg-neutral-subtle">STEP 1</p>
                <p className="text-h6 text-fg-neutral-bold">
                  여행지를 선택하고
                </p>
              </div>
            </div>

            {/* STEP 2 — 여행 기록 + 예시 사진 (Figma 2632-37825) */}
            <div
              className={cn(
                "flex w-full flex-col items-center gap-3",
                ENTER_BLOCK,
                "delay-[800ms]"
              )}
            >
              <img
                src={iconCameraAddSrc}
                alt=""
                className="size-8 brightness-0"
              />
              <div className="flex flex-col gap-1 text-center">
                <p className="text-h9 text-fg-neutral-subtle">STEP 2</p>
                <p className="text-h6 whitespace-nowrap text-fg-neutral-bold">
                  함께 여행을 기록해 보세요
                </p>
              </div>
              {/* 예시 사진 3장 부채꼴 배치 (Figma 2632-37831, 컨테이너 210×70) */}
              <span className="relative block h-[70px] w-full">
                <PhotoFrame
                  src={photoBeachSrc}
                  cropPosition="50% 55%"
                  className="top-px left-[119px] rotate-4"
                />
                <PhotoFrame
                  src={photoGyeongjuSrc}
                  cropPosition="45% 50%"
                  className="top-[3px] left-[30px]"
                />
                <PhotoFrame
                  src={photoAlleySrc}
                  cropPosition="50% 45%"
                  className="top-px left-1/2 -translate-x-1/2 -rotate-4"
                />
              </span>
            </div>

            {/* 시작하기 (Figma 2632-37835) */}
            <button
              type="button"
              onClick={() => {
                unmount()
                onStart?.()
              }}
              className={cn(
                "flex h-[42px] items-center justify-center rounded-full bg-bg-neutral-inverse px-3 text-h8 whitespace-nowrap text-fg-neutral-inverse shadow-[0px_0px_10px_0px_rgba(142,150,169,0.12)]",
                ENTER_BLOCK,
                "delay-[1600ms]"
              )}
            >
              시작하기
            </button>
          </div>
        )}
      </div>
    </>
  )
}

/**
 * 지도 사용 안내 (Figma 2632-37760) — 해당 팟과 함께 지도에 처음 진입할 때 1회만 노출.
 * 팟 단위로 이력을 저장해 온보딩 직후는 물론, 새 팟에 참여해 지도로 돌아왔을 때도 뜬다.
 * 지도가 로딩 중이어도 그 위에 블러 배경으로 얹혀 상관없이 보인다. "시작하기" 클릭 시 닫힘.
 */
export function openMapTipsOverlay(options: {
  potId: string
  onStart?: () => void
}): boolean {
  const { potId, onStart } = options
  if (!potId) return false
  // 한 번이라도 노출되면 확인한 것으로 처리 — 재접속 시 다시 노출되지 않음
  const seen = readSeenPotIds()
  if (seen.includes(potId)) return false
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, potId]))

  overlay.open(({ unmount }) => (
    <MapTipsOverlay onStart={onStart} unmount={unmount} />
  ))
  return true
}

/**
 * 해당 팟에서 지도 사용 안내를 이미 본 적 있는지 — 안내를 본 뒤 아무것도 기록하지 않고
 * 이탈했다가 재진입한 유저에게 '기록하기' 툴팁을 띄우는 조건 (Figma 1836-15911 #1-1).
 */
export function hasSeenMapTips(potId: string): boolean {
  return readSeenPotIds().includes(potId)
}

/** 계정 삭제 시 노출 이력 초기화 — 재가입 유저에게 지도 안내를 다시 노출 */
export function resetMapTipsSeen() {
  localStorage.removeItem(SEEN_KEY)
  localStorage.removeItem(LEGACY_SEEN_KEY)
}

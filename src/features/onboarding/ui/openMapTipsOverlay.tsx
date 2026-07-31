import { overlay } from "overlay-kit"

import { cn } from "@/shared/lib/utils"
import iconCameraAddSrc from "@/shared/assets/icon-camera-add.svg"
import photoSeoulSrc from "@/shared/assets/ut-서울.jpg"
import photoYangyangSrc from "@/shared/assets/ut-양양.jpg"
import photoPohangSrc from "@/shared/assets/ut-포항.jpg"

const SEEN_KEY = "photato-map-tips-seen"

// 예시 사진 카드 — 56px · radius 16 · 3px 다크 테두리 (Figma 1893-13526 image Frame)
function PhotoFrame({
  src,
  cropPosition,
  className,
}: {
  src: string
  /** 피사체가 정사각 크롭 안에 들어오도록 object-position 지정 */
  cropPosition: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "absolute block size-14 overflow-hidden rounded-2xl border-3 border-stroke-neutral-bold shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)]",
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

function MapTipsOverlay({ unmount }: { unmount: () => void }) {
  return (
    <>
      {/* 배경 — 지도가 로딩 중이어도 상관없이 그 위에 얹히는 프로스티드 글라스 (Figma Dim_white) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px]" />
        <div className="absolute inset-x-0 top-0 h-[163px] bg-gradient-to-b from-white/80 to-transparent" />
      </div>

      {/* 화면이 낮아도 겹치지 않도록 flex 중앙 정렬 + 넘치면 스크롤 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="지도 사용 안내"
        className="fixed inset-y-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col overflow-y-auto"
      >
        <div className="m-auto flex w-[204px] flex-col items-center gap-5 py-10">
          <div className="flex w-full flex-col items-center gap-4">
            <div className="flex w-full items-center gap-4">
              <img
                src={iconCameraAddSrc}
                alt=""
                className="size-8 shrink-0 brightness-0"
              />
              <div className="flex flex-col gap-1 whitespace-nowrap">
                <p className="text-h8-1 text-neutral-500">여행지를 선택하고</p>
                <p className="text-h5 text-fg-neutral-bold">
                  여행을 기록해주세요!
                </p>
              </div>
            </div>
            {/* 예시 사진 3장 부채꼴 배치 (Figma 1893-13526, 컨테이너 204×60) */}
            <span className="relative block h-[60px] w-[204px]">
              <PhotoFrame
                src={photoPohangSrc}
                cropPosition="50% 60%"
                className="top-[2px] left-[122px] rotate-4"
              />
              <PhotoFrame
                src={photoSeoulSrc}
                cropPosition="50% 58%"
                className="top-[2px] left-[30px]"
              />
              <PhotoFrame
                src={photoYangyangSrc}
                cropPosition="48% 70%"
                className="top-[2px] left-1/2 -translate-x-1/2 -rotate-4"
              />
            </span>
          </div>
          <button
            type="button"
            onClick={unmount}
            className="rounded-full bg-bg-neutral-inverse px-3 py-1 text-h8 whitespace-nowrap text-fg-neutral-inverse shadow-[0px_0px_10px_0px_rgba(142,150,169,0.12)]"
          >
            시작하기
          </button>
        </div>
      </div>
    </>
  )
}

/**
 * 지도 사용 안내 (Figma 1893-13526) — 팟과 함께 지도에 처음 진입할 때 1회만 노출.
 * 지도가 로딩 중이어도 그 위에 블러 배경으로 얹혀 상관없이 보인다.
 * "시작하기" 클릭 시 닫힘.
 */
export function openMapTipsOverlay(): void {
  // 한 번이라도 노출되면 확인한 것으로 처리 — 재접속 시 다시 노출되지 않음
  if (localStorage.getItem(SEEN_KEY) !== null) return
  localStorage.setItem(SEEN_KEY, "true")

  overlay.open(({ unmount }) => <MapTipsOverlay unmount={unmount} />)
}

/**
 * 지도 사용 안내를 이미 본 적 있는지 — 안내를 본 뒤 아무것도 기록하지 않고
 * 이탈했다가 재진입한 유저에게 '기록하기' 툴팁을 띄우는 조건 (Figma 1836-15911 #1-1).
 */
export function hasSeenMapTips(): boolean {
  return localStorage.getItem(SEEN_KEY) !== null
}

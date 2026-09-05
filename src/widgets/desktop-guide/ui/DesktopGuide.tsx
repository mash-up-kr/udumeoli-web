import * as React from "react"
import type { ReactNode } from "react"

import { TicketCard } from "@/entities/travel-pot"
import { PortalContainerProvider } from "@/shared/ui/portal-container"
import appIconSrc from "@/shared/assets/logo-app-icon.svg"
import logoSrc from "@/shared/assets/logo-pinnned.svg"

/** ponytail: QR은 티켓 공용 에셋 그대로 — 실제 접속 URL 확정되면 교체 */
const CODE_CELLS = ["P", "i", "n", "n", "n", "e", "d"]

function DesktopAside() {
  return (
    <aside
      aria-label="Pinnned 안내"
      className="hidden h-[min(936px,calc(100dvh-32px))] min-h-[874px] w-[500px] shrink-0 flex-col justify-between desktop:flex"
    >
      <div className="flex flex-col gap-[54px]">
        <img src={appIconSrc} alt="" className="size-[84px] rounded-[14px]" />
        <div className="flex flex-col gap-10">
          {/* logo-pinnned.svg 원본은 120×28 — 시안 슬롯 360×84로 확대 */}
          <img src={logoSrc} alt="Pinnned" className="h-[84px] w-[360px]" />
          <p className="text-[28px] leading-[1.5] font-semibold tracking-[-0.56px] text-fg-neutral-solid">
            가족, 연인, 친구들과 함께
            <br />
            전국 각지 여행을 Pinnned!
          </p>
        </div>
      </div>

      {/* 앱 공용 티켓 카드(335×311)를 시안 크기(472×438)로 확대 —
          scale은 레이아웃 박스를 바꾸지 않아 확대 후 크기만큼 자리를 잡아준다 */}
      <div className="h-[438px] w-[472px]">
        <TicketCard
          name="Pinnned.co.kr"
          fields={[
            ["SEAT", "지금은"],
            ["NUMBER", "모바일"],
            ["BOARDING", "웹만"],
            ["DATE", "제공하고 있어요"],
          ]}
          fieldsFit="content"
          className="origin-top-left scale-[1.41]"
        >
          <div className="flex gap-1">
            {CODE_CELLS.map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className="flex h-[34px] w-[26px] items-center justify-center rounded-[6px] bg-bg-neutral-weak-disabled text-h9 font-bold text-neutral-900"
              >
                {letter}
              </span>
            ))}
          </div>
          <p className="text-b6 break-keep text-fg-neutral-solid">
            모바일로 QR코드 스캔하고 바로 이용하기
          </p>
        </TicketCard>
      </div>
    </aside>
  )
}

/**
 * 데스크탑 안내형 UI (시안 3099-62530).
 *
 * 480px 미만(실제 휴대폰)에서는 `display: contents`라 레이아웃에 전혀 관여하지 않는다.
 *
 * 프레임 높이는 시안(956px)이 아니라 `100dvh`다 — 앱이 `h-dvh`·`calc(100dvh-…)`를
 * 31군데에서 쓰는데 프레임이 뷰포트보다 낮으면 하단 내비 같은 게 프레임 밖으로 밀린다.
 * 1440px 이상에서만 좌측 브랜딩·티켓과 우측 아이폰 프레임을 만들고, 프레임에
 * transform을 걸어 앱의 `position: fixed` 오버레이가 프레임 밖으로 새지 않게 한다.
 */
export function DesktopGuide({ children }: { children: ReactNode }) {
  // 바텀시트·모달(Radix Portal)이 프레임 밖으로 새지 않도록 컨테이너로 넘긴다.
  // 480 미만에서는 프레임이 display:contents라 body에 붙는 것과 동작이 같다.
  const [frame, setFrame] = React.useState<HTMLDivElement | null>(null)

  return (
    <div className="contents frame:flex frame:h-dvh frame:items-center frame:justify-center frame:overflow-hidden frame:bg-[radial-gradient(120%_120%_at_85%_90%,var(--color-blue-100)_0%,var(--color-blue-50)_35%,var(--color-neutral-0)_75%)] frame:px-4 frame:py-4 desktop:gap-[300px] desktop:px-[100px]">
      <DesktopAside />
      <div
        ref={setFrame}
        data-app-frame
        className="contents frame:relative frame:block frame:h-[var(--app-vh)] frame:w-[var(--app-vw)] frame:shrink-0 frame:[transform:translate(0)] frame:overflow-hidden frame:rounded-[56px] frame:border-[6px] frame:border-neutral-300 frame:bg-bg-neutral-weak"
      >
        <PortalContainerProvider container={frame}>
          {children}
        </PortalContainerProvider>
      </div>
    </div>
  )
}

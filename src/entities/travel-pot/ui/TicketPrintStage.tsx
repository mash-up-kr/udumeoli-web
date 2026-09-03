import type { ReactNode } from "react"

/**
 * TicketPrintStage — 티켓 등장 인터랙션 공통 래퍼 (graphic_interaction GIF).
 *
 * 슬롯 바에서 티켓이 아래로 인쇄되듯 등장하고, 출력이 끝나면 슬롯이 사라지며
 * -3.71°로 살짝 기울어 안착한다. 위치는 px 고정 대신 화면 높이 비율
 * (시안 3065-13366, 812 기준 카드 상단 y≈231 → 28.5%)로 잡아 기종 무관 동일 지점에 뜬다.
 * 부모는 position 컨텍스트(relative)여야 한다.
 *
 * children에는 TicketCard를 `rotate-none`으로 넣는다 — 기울임은 안착 애니메이션
 * 래퍼가 담당하고, 카드 자체는 정방향으로 인쇄돼야 한다.
 */
export function TicketPrintStage({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[28.5%] flex justify-center">
      <div className="relative">
        {/* 출력창 — 슬롯 라인(상단 edge) 위를 잘라 티켓이 프린터에서 인쇄되듯 내려온다.
            좌우/하단 패딩은 카드 그림자·기울기 몫 */}
        <div className="overflow-hidden px-10 pb-14">
          <div className="animate-ticket-print motion-reduce:animate-none">
            {/* 기본 클래스가 최종 안착 상태(-3.71° + 14px) — 애니메이션이 실행 중에만 덮어쓴다 */}
            <div className="translate-y-3.5 rotate-[-3.71deg] animate-ticket-settle motion-reduce:animate-none">
              {children}
            </div>
          </div>
        </div>
        {/* 프린터 슬롯 바 — 출력창 상단(잘리는 라인)에 걸쳐 있다가 인쇄가 끝나면 사라진다 */}
        <div
          aria-hidden
          className="absolute top-0 left-1/2 h-3.5 w-[351px] -translate-x-1/2 -translate-y-1/2 animate-ticket-slot rounded-full bg-neutral-800 opacity-0 motion-reduce:animate-none"
        />
      </div>
    </div>
  )
}

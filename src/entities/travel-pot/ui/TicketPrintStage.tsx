import type { ReactNode } from "react"

/**
 * TicketPrintStage — 티켓 등장 인터랙션 공통 래퍼 (graphic_interaction GIF).
 *
 * 슬롯 바에서 티켓이 아래로 인쇄되듯 등장하고, 출력이 끝나면 슬롯이 사라지며
 * -3.71°로 살짝 기울어 안착한다. 위치는 px 고정 대신 화면 높이 비율로 잡아
 * 기종 무관 동일 지점에 뜬다 — 시안(3065-13366) 기준 28.5%였으나 안착 후
 * 상단이 비어 보인다는 피드백으로 25%로 소폭 올림.
 * 노치 기종은 상태줄(safe-area-inset-top)만큼 사용 영역이 줄어드므로,
 * inset + (100% - inset)×25% = inset×0.75 + 25%로 상태줄 아래 영역 기준 비율을 유지한다.
 * 부모는 position 컨텍스트(relative)여야 한다.
 *
 * children에는 TicketCard를 `rotate-none`으로 넣는다 — 기울임은 안착 애니메이션
 * 래퍼가 담당하고, 카드 자체는 정방향으로 인쇄돼야 한다.
 */
export function TicketPrintStage({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)*0.75+25%)] flex justify-center">
      <style>{`
        @keyframes ticket-card-print-v2 {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(167px) rotate(-2.303deg); }
          100% { transform: translateY(334px) rotate(-4deg); }
        }
        @keyframes ticket-slot-v2 {
          0%, 81% { opacity: 1; }
          86%, 100% { opacity: 0; }
        }
        .ticket-card-print-v2 {
          animation: ticket-card-print-v2 2s cubic-bezier(0.37, 0, 0.24, 1) infinite;
        }
        .ticket-slot-v2 { animation: ticket-slot-v2 2s linear infinite; }
        .ticket-print-stage [data-ticket-card] { rotate: 0deg; }
        @media (prefers-reduced-motion: reduce) {
          .ticket-card-print-v2 { animation: none; transform: translateY(334px) rotate(-4deg); }
          .ticket-slot-v2 { animation: none; opacity: 1; }
        }
      `}</style>
      <div className="ticket-print-stage relative h-[375px] w-full max-w-[375px] overflow-hidden">
        {/* 출력창 — 슬롯 라인(상단 edge) 위를 잘라 티켓이 프린터에서 인쇄되듯 내려온다.
            좌우/하단 패딩은 카드 그림자·기울기 몫 */}
        <div className="flex h-full justify-center overflow-hidden px-5">
          <div className="shrink-0">
            <div className="ticket-card-print-v2 relative top-[-302px] z-0">
              {children}
            </div>
          </div>
        </div>
        {/* 프린터 슬롯 — Figma 3065:38129의 상단 캡과 하단 라인 */}
        <div
          aria-hidden
          className="ticket-slot-v2 absolute top-0 left-1/2 z-10 h-2 w-[350px] -translate-x-1/2 bg-[#eff1f5]"
        />
        <div
          aria-hidden
          className="ticket-slot-v2 absolute top-2 left-1/2 z-10 h-2 w-[350px] -translate-x-1/2 rounded-t-[3px] border-x-[3px] border-t-[3px] border-solid border-[rgba(183,183,183,0.5)]"
        />
        <div
          aria-hidden
          className="ticket-slot-v2 absolute top-4 left-1/2 z-10 h-[3px] w-[350px] -translate-x-1/2 rounded-b-[3px] border-b-[3px] border-solid border-[rgba(183,183,183,0.5)]"
        />
      </div>
    </div>
  )
}

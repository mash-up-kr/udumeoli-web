import type { ReactNode } from "react"

import ticketPinSrc from "@/shared/assets/ticket-pin.svg"
import ticketRouteArrowSrc from "@/shared/assets/ticket-route-arrow.svg"
import ticketRouteDashSrc from "@/shared/assets/ticket-route-dash.svg"
import ticketPerforationSrc from "@/shared/assets/ticket-perforation.svg"
import ticketQrSrc from "@/shared/assets/ticket-qr.svg"
import { cn } from "@/shared/lib/utils"

/**
 * TicketCard — 여행팟 티켓 카드.
 * (Figma 팟 생성 완료 2588-38543 · 참여 확인 2588-37965, 골격 동일)
 *
 * 고정 335×311, -3.71° 기울임, 절취선으로 상/하 스텁 분리.
 * 하단 스텁 좌측 내용만 화면별로 다르다 — children으로 주입 (QR은 공통).
 */
export function TicketCard({
  name,
  leaderName,
  seatLabel,
  fields,
  fieldsFit = "equal",
  className,
  children,
}: {
  name: string
  leaderName?: string
  /** SEAT 칸 값 — 생성 완료는 "01", 참여 확인은 내가 앉을 자리 번호. */
  seatLabel?: string
  /**
   * 항공권 필드 4칸 [라벨, 값]. 기본값은 팟 티켓(SEAT·LEADER·BOARDING·DATE)이라
   * 팟 화면은 name·leaderName·seatLabel만 넘기면 된다.
   */
  fields?: Array<[string, string]>
  /**
   * 항공권 필드 칸 폭. "equal"(기본)은 4등분 + 말줄임, "content"는 내용 길이대로 —
   * 값 길이가 제각각인 안내 문구용 (시안 3099-62530).
   */
  fieldsFit?: "equal" | "content"
  /** 페이지별 상단 여백 등 외곽 배치 조정. */
  className?: string
  /** 하단 스텁 좌측(210px 폭) 내용 — 코드/안내문 또는 코드/멤버 목록. */
  children: ReactNode
}) {
  // DATE 칸 — 두 화면 모두 노출 시점 날짜 = 탑승일 (YY/MM/DD). 서버 preview 응답엔 생성일 필드가 없다
  const now = new Date()
  const dateLabel = [
    String(now.getFullYear() % 100).padStart(2, "0"),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("/")

  return (
    <div
      className={cn(
        "relative h-[311px] w-[335px] shrink-0 rotate-[-3.71deg] overflow-hidden rounded-[28px] border border-stroke-neutral-weak bg-bg-neutral-weak shadow-[0px_14px_32px_-6px_rgba(26,31,41,0.12)]",
        className
      )}
    >
      <div className="flex flex-col px-6 pt-[22px]">
        <div className="flex items-center gap-2">
          <span className="font-eng text-e4 tracking-[0.25px] text-neutral-900">
            PINNNED
          </span>
          <span
            aria-hidden="true"
            className="size-[6px] shrink-0 rounded-full border-[1.2px] border-neutral-900"
          />
          <img
            src={ticketRouteDashSrc}
            alt=""
            className="h-[1.2px] min-w-0 flex-1"
          />
          <img
            src={ticketRouteArrowSrc}
            alt=""
            className="size-[14px] shrink-0 rotate-180"
          />
          <img
            src={ticketRouteDashSrc}
            alt=""
            className="h-[1.2px] min-w-0 flex-1"
          />
          <span
            aria-hidden="true"
            className="size-[6px] shrink-0 rounded-full bg-neutral-900"
          />
          <span className="font-eng text-e4 tracking-[0.25px] text-neutral-900">
            TICKET
          </span>
        </div>
        <div className="mt-[14px] flex items-center gap-2">
          {/* 심볼 — 브랜드 푸시핀 (Figma 2466-8693 원본 벡터), 시안 슬롯 24×28 유지 */}
          <img
            src={ticketPinSrc}
            alt=""
            className="h-[28px] w-[24px] shrink-0"
          />
          <p className="min-w-0 truncate text-[28px] leading-[44px] font-extrabold tracking-[-0.2px] text-neutral-900">
            {name}
          </p>
        </div>
        <div
          className={cn(
            "mt-4 flex rounded-[12px] bg-blue-100 px-4 py-3",
            fieldsFit === "content" && "justify-between gap-4"
          )}
        >
          {(
            fields ?? [
              ["SEAT", seatLabel ?? ""],
              ["LEADER", leaderName ?? ""],
              ["BOARDING", "NOW!"],
              ["DATE", dateLabel],
            ]
          ).map(([label, value]) => (
            <div
              key={label}
              className={cn(
                "flex flex-col gap-[2px]",
                fieldsFit === "content" ? "shrink-0" : "min-w-0 flex-1"
              )}
            >
              {/* #4d708f — 팔레트에 없는 시안 고정 라벨색 (Figma 2588-38577) */}
              <span className="font-eng text-[10px] leading-normal text-[#4d708f]">
                {label}
              </span>
              <span
                className={cn(
                  "text-h9 font-bold text-blue-900",
                  fieldsFit === "content" ? "whitespace-nowrap" : "truncate"
                )}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* 절취선 — 카드보다 넓은 원본 에셋을 overflow-hidden으로 잘라 양끝 노치를 만든다 */}
      <img
        src={ticketPerforationSrc}
        alt=""
        className="absolute top-[182px] left-1/2 h-[24px] w-[359px] max-w-none -translate-x-1/2"
      />
      <div className="absolute top-[206px] left-0 flex w-full items-center gap-[10px] px-6 pt-4 pb-6">
        <div className="flex w-[211px] flex-col gap-2">{children}</div>
        <div className="relative size-[64px] shrink-0 overflow-hidden rounded-[12px] border-[1.5px] border-neutral-200 bg-bg-neutral-weak">
          <img
            src={ticketQrSrc}
            alt=""
            className="absolute inset-0 size-full"
          />
        </div>
      </div>
    </div>
  )
}

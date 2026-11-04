import * as React from "react"

import batterySrc from "../assets/status-battery.svg"
import cellularSrc from "../assets/status-cellular.svg"
import wifiSrc from "../assets/status-wifi.svg"

// 시안 표기(9:41)와 같은 H:MM — 24시간, 앞자리 0 없음
function formatClock(date: Date) {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`
}

function useClock() {
  // 서버·첫 렌더는 빈 문자열 — 하이드레이션 불일치를 피하고 마운트 후 분 단위로 갱신
  const [time, setTime] = React.useState("")
  React.useEffect(() => {
    const tick = () => setTime(formatClock(new Date()))
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

/**
 * 데스크톱 폰 프레임 전용 가상 상태바(Figma 3065-13737)·홈 인디케이터(3065-14164).
 *
 * 실제 폰·PWA·웹뷰는 OS가 그리므로 `frame` 변형 밖에선 렌더하지 않는다(hidden).
 * 시안(3065-19280)에서 둘 다 Dim 레이어 위에 놓이므로 앱의 fixed 오버레이(최대 z-[60])보다
 * 높은 z-[100]에 두고, 실제 폰처럼 콘텐츠가 아래로 깔리도록 배경은 투명·터치는 통과시킨다.
 * 상태바 글꼴 17/22는 iOS 시스템 타이포(SF Pro Semibold)라 DS 토큰에 없다.
 */
export function PhoneChrome() {
  const time = useClock()

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[100] hidden h-[54px] items-center gap-[6px] px-4 frame:flex"
      >
        <span className="flex flex-1 justify-center pt-[2px] text-[17px] leading-[22px] font-semibold text-fg-neutral-bold">
          {time}
        </span>
        {/* Dynamic Island 자리 */}
        <span className="h-[37px] w-[125px] shrink-0" />
        <span className="flex flex-1 items-center justify-center gap-[7px] pt-px">
          <img src={cellularSrc} alt="" />
          <img src={wifiSrc} alt="" />
          <img src={batterySrc} alt="" />
        </span>
      </div>
      {/* 시안 Labels/Primary(#000)는 DS에 없어 가장 짙은 neutral-900을 쓴다 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[100] hidden h-[34px] items-end justify-center pb-2 frame:flex"
      >
        <span className="h-[5px] w-[144px] rounded-full bg-neutral-900" />
      </div>
    </>
  )
}

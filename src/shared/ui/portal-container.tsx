import * as React from "react"

/**
 * Radix Portal이 붙을 컨테이너.
 *
 * 기본값 null이면 Radix가 `document.body`에 붙인다 — 모바일에서는 그게 맞다.
 * 데스크탑 안내 UI처럼 앱이 특정 박스 안에서만 돌아야 할 때, 그 박스를 넣어주면
 * 바텀시트·모달이 박스 밖으로 새지 않는다.
 */
const PortalContainerContext = React.createContext<HTMLElement | null>(null)

export function PortalContainerProvider({
  container,
  children,
}: {
  container: HTMLElement | null
  children: React.ReactNode
}) {
  return (
    <PortalContainerContext value={container}>
      {children}
    </PortalContainerContext>
  )
}

export function usePortalContainer(): HTMLElement | null {
  return React.useContext(PortalContainerContext)
}

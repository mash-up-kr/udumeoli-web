import type { MouseEvent } from "react"

export type PhotoTileProps = {
  label: string
  imageUrl: string
  size: number
  onClick: (e: MouseEvent) => void
}

/** 지도 사진 핀 / 파티 슬롯 공용 타일 — 닉네임/지역명 칩 + 정사각 이미지. */
export function PhotoTile({ label, imageUrl, size, onClick }: PhotoTileProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group flex flex-col items-center gap-1"
    >
      <span className="rounded-full bg-bg-neutral-weak px-3 py-1 text-h9 text-fg-neutral-bold shadow-[0px_0px_10px_rgba(142,150,169,0.12)]">
        {label}
      </span>
      <span
        className="block overflow-hidden rounded-2xl border-2 border-stroke-neutral-inverse shadow-[0px_0px_20px_0px_rgba(142,150,169,0.12)] transition-all group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <img src={imageUrl} alt="" className="size-full object-cover" />
      </span>
    </button>
  )
}

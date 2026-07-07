import { clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"
import type { ClassValue } from "clsx"

// 커스텀 타이포 유틸(text-h0~h9·h5-1, text-b0~b8, text-e0~e4)을 font-size 그룹으로 등록.
// 기본 설정에선 색상 클래스(text-fg-* 등)와 같은 그룹으로 오인돼 병합 시 드롭됨.
const isCustomTextStyle = (value: string) => /^[hbe]\d+(-\d+)?$/.test(value)

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [isCustomTextStyle] }],
    },
  },
})

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

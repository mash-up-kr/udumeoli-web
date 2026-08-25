export const RECAP_CARD_SIZE = {
  width: 270,
  height: 480,
} as const

export const RECAP_CARD_LAYOUT = {
  heading: {
    left: 20,
    top: 24,
    firstBaseline: 48,
    secondBaseline: 84,
    fontSize: 28,
  },
  locationIcon: {
    top: 24,
    right: 16,
    width: 20,
    height: 24,
  },
  members: {
    left: 20,
    top: 108,
    width: 104,
    rowHeight: 13,
    rowGap: 1,
  },
} as const

export function cardPercent(value: number, size: number): string {
  return `${(value / size) * 100}%`
}

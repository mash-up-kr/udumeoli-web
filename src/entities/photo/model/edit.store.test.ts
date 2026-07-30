import { describe, expect, it } from "vitest"

import { applyPhotoEdits } from "./edit.store"
import type { Photo } from "./types"

const base = (id: string, comment?: string): Photo => ({
  id,
  lat: 0,
  lng: 0,
  thumbnailUrl: `${id}.jpg`,
  date: "2026-07-01",
  uploaderId: "user-1",
  region: "창원시",
  potId: "pot-1",
  ...(comment != null ? { comment } : {}),
})

describe("applyPhotoEdits", () => {
  it("삭제된 id는 제외하고 수정된 코멘트는 덮어쓴다", () => {
    const photos = [base("a", "원본"), base("b"), base("c", "그대로")]
    const result = applyPhotoEdits(photos, {
      deletedIds: ["b"],
      comments: { a: "수정됨" },
    })
    expect(result.map((p) => p.id)).toEqual(["a", "c"])
    expect(result[0].comment).toBe("수정됨")
    expect(result[1].comment).toBe("그대로")
  })

  it("수정/삭제가 없으면 원본 항목을 그대로 반환한다", () => {
    const photos = [base("a")]
    const result = applyPhotoEdits(photos, { deletedIds: [], comments: {} })
    expect(result).toEqual(photos)
  })
})

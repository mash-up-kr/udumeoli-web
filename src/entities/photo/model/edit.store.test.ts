import { afterEach, describe, expect, it } from "vitest"

import { applyPhotoEdits, usePhotoEditStore } from "./edit.store"
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
  it("삭제된 id만 제외하고 나머지는 그대로 둔다", () => {
    const photos = [base("a", "원본"), base("b"), base("c", "그대로")]
    const result = applyPhotoEdits(photos, { deletedIds: ["b"] })
    expect(result.map((p) => p.id)).toEqual(["a", "c"])
    expect(result[0].comment).toBe("원본")
    expect(result[1].comment).toBe("그대로")
  })

  it("삭제가 없으면 원본 항목을 그대로 반환한다", () => {
    const photos = [base("a")]
    const result = applyPhotoEdits(photos, { deletedIds: [] })
    expect(result).toEqual(photos)
  })
})

describe("photo deletion state", () => {
  afterEach(() => {
    for (const id of usePhotoEditStore.getState().deletedIds) {
      usePhotoEditStore.getState().restoreDeleted(id)
    }
  })

  it("삭제를 중복 표시하지 않고 실패 시 복구할 수 있다", () => {
    usePhotoEditStore.getState().markDeleted("a")
    usePhotoEditStore.getState().markDeleted("a")
    usePhotoEditStore.getState().markDeleted("b")
    expect(usePhotoEditStore.getState().deletedIds).toEqual(["a", "b"])
    expect(
      applyPhotoEdits([base("a"), base("b")], usePhotoEditStore.getState())
    ).toEqual([])

    usePhotoEditStore.getState().restoreDeleted("a")
    expect(usePhotoEditStore.getState().deletedIds).toEqual(["b"])
    expect(
      applyPhotoEdits([base("a"), base("b")], usePhotoEditStore.getState())
    ).toEqual([base("a")])
  })
})

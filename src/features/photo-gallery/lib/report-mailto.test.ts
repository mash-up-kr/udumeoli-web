import { describe, expect, it } from "vitest"
import { reportMailto } from "./report-mailto"

describe("reportMailto", () => {
  it("운영 메일과 신고 대상·작성 양식만 채우고 사용자 정보는 포함하지 않는다", () => {
    const target = {
      tripId: "123",
      imageId: "456",
      authorId: "private-author",
      nickname: "private-name",
      comment: "private-comment",
      token: "private-token",
    }
    const url = new URL(reportMailto(target))
    expect(url.protocol).toBe("mailto:")
    expect(url.pathname).toBe("pinnned.dev@gmail.com")
    expect(url.searchParams.get("subject")).toBe("여행 기록 신고")
    const body = url.searchParams.get("body")!
    expect(body).toContain("여행 ID: 123")
    expect(body).toContain("사진 ID: 456")
    expect(body).toContain("신고 사유:")
    expect(body).toContain("직접 전송")
    expect(reportMailto(target)).not.toMatch(/private-/)
  })
  it("특수 문자를 URL 파라미터로 해석하지 않고 사진 ID 부재를 안내한다", () => {
    const url = new URL(
      reportMailto({ tripId: "123&bcc=bad@example.com#한글" })
    )
    expect(url.searchParams.has("bcc")).toBe(false)
    expect(url.hash).toBe("")
    expect(url.searchParams.get("body")).toContain(
      "123&bcc=bad@example.com#한글"
    )
    expect(url.searchParams.get("body")).toContain("미확인")
  })
})

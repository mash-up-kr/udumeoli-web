// 스마트폰 세로 사진은 픽셀을 눕혀 저장하고 EXIF Orientation 태그로만 회전을
// 표시한다. 브라우저 <img>는 태그를 적용해 바로 보이지만, 태그를 무시하는
// 소비처(서버 썸네일 생성 등)에선 90도 돌아간다 — 업로드 전에 회전을 픽셀에
// 구워 넣고 태그 없는 JPEG로 정방향화한다.

/** JPEG 앞부분 바이트에서 EXIF Orientation(1~8)을 읽는다. 없거나 JPEG가 아니면 null. */
export function readJpegOrientation(buffer: ArrayBuffer): number | null {
  const view = new DataView(buffer)
  // SOI(0xFFD8)로 시작해야 JPEG
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null

  let offset = 2
  // 세그먼트(마커 2B + 길이 2B)를 차례로 훑어 APP1(EXIF)을 찾는다
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset)
    if ((marker & 0xff00) !== 0xff00) return null
    const size = view.getUint16(offset + 2)
    if (marker === 0xffe1) {
      const exifStart = offset + 4
      // "Exif\0\0" 헤더 + TIFF 본문 시작을 담을 최소 길이 확인
      if (
        exifStart + 14 > view.byteLength ||
        view.getUint32(exifStart) !== 0x45786966 || // "Exif"
        view.getUint16(exifStart + 4) !== 0
      ) {
        return null
      }
      const tiff = exifStart + 6
      const little = view.getUint16(tiff) === 0x4949 // "II" 리틀엔디언
      const dir = tiff + view.getUint32(tiff + 4, little)
      if (dir + 2 > view.byteLength) return null
      const entries = view.getUint16(dir, little)
      // IFD0 엔트리(12B씩)에서 Orientation(0x0112) 태그를 찾는다
      for (let i = 0; i < entries; i++) {
        const entry = dir + 2 + i * 12
        if (entry + 12 > view.byteLength) return null
        if (view.getUint16(entry, little) === 0x0112) {
          return view.getUint16(entry + 8, little)
        }
      }
      return null
    }
    if (marker === 0xffda) return null // 이미지 데이터 시작 — EXIF 없음
    offset += 2 + size
  }
  return null
}

/**
 * EXIF 회전이 있는 JPEG를 정방향 픽셀로 재인코딩한 File을 돌려준다.
 * 회전이 없거나 JPEG가 아니거나 처리에 실패하면 원본을 그대로 돌려준다.
 */
export async function normalizeImageOrientation(file: File): Promise<File> {
  if (file.type !== "image/jpeg") return file
  try {
    // EXIF(APP1)는 파일 머리에 있다(세그먼트 최대 64KB) — 앞부분만 읽는다
    const head = await file.slice(0, 128 * 1024).arrayBuffer()
    const orientation = readJpegOrientation(head)
    if (orientation === null || orientation === 1) return file

    // createImageBitmap이 EXIF 방향을 픽셀에 적용해 디코드한다
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    })
    const canvas = document.createElement("canvas")
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext("2d")
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92)
    )
    // ponytail: 캔버스 픽셀 한도 초과(초대형 사진) 등 재인코딩 실패 시 원본 그대로 업로드
    if (!blob) return file
    return new File([blob], file.name, { type: "image/jpeg" })
  } catch {
    return file
  }
}

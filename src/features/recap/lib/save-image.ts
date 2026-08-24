/** 리캡 카드의 지도 SVG를 PNG로 변환해 공유하거나 다운로드한다. */

import type { RecapCardModel } from "./recap-model"

const EXPORT_SCALE = 4

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    }
    return entities[character]
  })
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("이미지 리소스를 읽을 수 없어요"))
    reader.readAsDataURL(blob)
  })
}

async function inlineSvgImages(svgMarkup: string): Promise<string> {
  const xmlDocument = new DOMParser().parseFromString(
    svgMarkup,
    "image/svg+xml"
  )
  const images = Array.from(xmlDocument.querySelectorAll("image"))

  await Promise.all(
    images.map(async (image) => {
      const source =
        image.getAttribute("href") ??
        image.getAttributeNS("http://www.w3.org/1999/xlink", "href")
      if (!source || source.startsWith("data:")) return

      let absoluteSource: string
      try {
        absoluteSource = new URL(source, window.location.href).href
      } catch (error) {
        console.warn("리캡 이미지 URL을 해석하지 못했어요", source, error)
        return
      }

      try {
        const response = await fetch(absoluteSource)
        if (!response.ok) {
          image.setAttribute("href", absoluteSource)
          return
        }
        image.setAttribute("href", await blobToDataUrl(await response.blob()))
        image.removeAttributeNS("http://www.w3.org/1999/xlink", "href")
      } catch (error) {
        console.warn("리캡 이미지 리소스를 인라인하지 못했어요", source, error)
        image.setAttribute("href", absoluteSource)
      }
    })
  )

  return new XMLSerializer().serializeToString(xmlDocument.documentElement)
}

function buildRecapTextMarkup(model: RecapCardModel): string {
  const days = escapeXml(String(model.totalDays))
  const pins = escapeXml(String(model.pinCount))
  const potName = escapeXml(model.potName)
  const labels = model.members
    .map((member, index) => {
      const column = index % 3
      const row = Math.floor(index / 3)
      const x = 16 + column * 48
      const y = 420 + row * 14
      return `<rect x="${x}" y="${y}" width="42" height="13" rx="6.5" fill="#232936" fill-opacity=".4"/><text x="${x + 21}" y="${y + 9}" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="7" font-weight="500">@${escapeXml(member)}</text>`
    })
    .join("")
  const potWidth = Math.min(Math.max(potName.length * 7 + 16, 42), 238)
  const potMarkup = `<rect x="16" y="394" width="${potWidth}" height="18" rx="9" fill="#232936"/><text x="${16 + potWidth / 2}" y="406" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="9" font-weight="600">${potName}</text>`

  return `${potMarkup}<text x="16" y="48" font-family="Special Gothic Condensed One, Anton, sans-serif" font-size="28" font-weight="400"><tspan fill="#6cbcf9" stroke="#232936" stroke-width="0.5" paint-order="stroke">${days}</tspan><tspan dx="4" fill="#232936">DAYS</tspan></text><text x="16" y="84" font-family="Special Gothic Condensed One, Anton, sans-serif" font-size="28" font-weight="400"><tspan fill="#6cbcf9" stroke="#232936" stroke-width="0.5" paint-order="stroke">${pins}</tspan><tspan dx="4" fill="#232936">PINNNED</tspan></text>${labels}`
}

async function buildExportSvg(
  element: HTMLElement,
  model: RecapCardModel
): Promise<string> {
  const map = element.querySelector<SVGSVGElement>("[data-recap-map] svg")
  if (!map) throw new Error("리캡 지도를 찾을 수 없어요")

  const locationIcon = element.querySelector<HTMLImageElement>(
    "[data-recap-location-icon]"
  )
  const locationIconSource = locationIcon?.currentSrc || locationIcon?.src

  const mapMarkup = (
    await inlineSvgImages(new XMLSerializer().serializeToString(map))
  )
    .replaceAll('width="100%"', 'width="270"')
    .replaceAll('height="100%"', 'height="480"')
    .replaceAll('href="/', `href="${window.location.origin}/`)
    .replaceAll('xlink:href="/', `xlink:href="${window.location.origin}/`)

  const locationIconMarkup = locationIconSource
    ? `<image href="${escapeXml(locationIconSource)}" x="230" y="15" width="18" height="21" preserveAspectRatio="xMidYMid meet"/>`
    : ""
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="270" height="480" viewBox="0 0 270 480"><rect width="270" height="480" rx="32" fill="#79d5e6"/><g>${mapMarkup.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>${locationIconMarkup}${buildRecapTextMarkup(model)}</svg>`
  return inlineSvgImages(svg)
}

function buildFallbackExportSvg(
  element: HTMLElement,
  model: RecapCardModel
): string {
  const map = element.querySelector<SVGSVGElement>("[data-recap-map] svg")
  if (!map) throw new Error("리캡 지도를 찾을 수 없어요")

  const mapMarkup = new XMLSerializer()
    .serializeToString(map)
    .replaceAll('width="100%"', 'width="270"')
    .replaceAll('height="100%"', 'height="480"')
    .replaceAll('href="/', `href="${window.location.origin}/`)
    .replaceAll('xlink:href="/', `xlink:href="${window.location.origin}/`)
    .replace(/^<svg[^>]*>|<\/svg>$/g, "")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="270" height="480" viewBox="0 0 270 480"><rect width="270" height="480" rx="32" fill="#79d5e6"/>${mapMarkup}${buildRecapTextMarkup(model)}</svg>`
}

async function svgToBlob(svgMarkup: string): Promise<Blob> {
  const image = new Image()
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error("이미지 생성에 실패했어요"))
  })

  const canvas = document.createElement("canvas")
  canvas.width = 270 * EXPORT_SCALE
  canvas.height = 480 * EXPORT_SCALE
  const context = canvas.getContext("2d")
  if (!context) throw new Error("이미지 캔버스를 만들 수 없어요")
  context.scale(EXPORT_SCALE, EXPORT_SCALE)
  context.drawImage(image, 0, 0, 270, 480)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  )
  if (!blob) throw new Error("이미지 생성에 실패했어요")
  return blob
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.style.display = "none"
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function createRecapImageBlob(
  element: HTMLElement,
  model: RecapCardModel
): Promise<Blob> {
  return svgToBlob(await buildExportSvg(element, model))
}

export async function saveRecapImage(
  element: HTMLElement,
  model: RecapCardModel,
  preparedBlob?: Blob | null
): Promise<"shared" | "downloaded"> {
  let svg: string
  try {
    svg = await buildExportSvg(element, model)
  } catch (error) {
    console.error("리캡 SVG 구성 실패, 지도 원본으로 저장을 시도합니다", error)
    svg = buildFallbackExportSvg(element, model)
  }
  let blob: Blob
  try {
    blob = preparedBlob ?? (await svgToBlob(svg))
  } catch {
    const svgBlob = new Blob([svg], { type: "image/svg+xml" })
    const svgFile = new File([svgBlob], "photato-recap.svg", {
      type: "image/svg+xml",
    })
    const share = Reflect.get(navigator, "share") as
      | ((data: ShareData) => Promise<void>)
      | undefined
    const canShare = Reflect.get(navigator, "canShare") as
      | ((data: ShareData) => boolean)
      | undefined

    if (share && canShare?.call(navigator, { files: [svgFile] })) {
      try {
        await share.call(navigator, { files: [svgFile], title: "여행 리캡" })
        return "shared"
      } catch {
        // Fall through to a regular file download.
      }
    }

    downloadBlob(svgBlob, "photato-recap.svg")
    return "downloaded"
  }
  const file = new File([blob], "photato-recap.png", { type: "image/png" })
  const share = Reflect.get(navigator, "share") as
    | ((data: ShareData) => Promise<void>)
    | undefined
  const canShare = Reflect.get(navigator, "canShare") as
    | ((data: ShareData) => boolean)
    | undefined

  if (share && canShare?.call(navigator, { files: [file] })) {
    try {
      await share.call(navigator, { files: [file], title: "여행 리캡" })
      return "shared"
    } catch {
      // 모바일 브라우저가 비동기 이미지 생성 뒤의 공유 호출을 거부하면 파일 저장으로 보완한다.
    }
  }

  downloadBlob(blob, "photato-recap.png")
  return "downloaded"
}

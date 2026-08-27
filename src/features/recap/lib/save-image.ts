/** 리캡 카드의 지도 SVG를 PNG로 변환해 공유하거나 다운로드한다. */

import specialGothicFontUrl from "@fontsource/special-gothic-condensed-one/files/special-gothic-condensed-one-latin-400-normal.woff2"

import { RECAP_CARD_LAYOUT, RECAP_CARD_SIZE } from "./recap-layout"
import { RECAP_MAP_VIEW } from "./recap-map-config"
import type { RecapCardModel } from "./recap-model"

const EXPORT_SCALE = 4
const GOOGLE_STATIC_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
  | string
  | undefined
let exportFontStylePromise: Promise<string> | null = null

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

async function exportFontStyle(): Promise<string> {
  exportFontStylePromise ??= fetch(specialGothicFontUrl)
    .then((response) => {
      if (!response.ok) throw new Error("리캡 폰트를 읽을 수 없어요")
      return response.blob()
    })
    .then(blobToDataUrl)
    .then(
      (fontDataUrl) =>
        `<style>@font-face{font-family:'Special Gothic Condensed One';src:url(${fontDataUrl}) format('woff2');font-weight:400;font-style:normal;font-display:block}</style>`
    )
    .catch((error) => {
      console.warn("리캡 폰트를 인라인하지 못했어요", error)
      return ""
    })
  return exportFontStylePromise
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

function buildLocationIconMarkup(element: HTMLElement): string {
  const locationIcon = element.querySelector<HTMLImageElement>(
    "[data-recap-location-icon]"
  )
  const source = locationIcon?.currentSrc || locationIcon?.src
  if (!source) return ""

  return `<image href="${escapeXml(source)}" x="${RECAP_CARD_SIZE.width - RECAP_CARD_LAYOUT.locationIcon.right - RECAP_CARD_LAYOUT.locationIcon.width}" y="${RECAP_CARD_LAYOUT.locationIcon.top}" width="${RECAP_CARD_LAYOUT.locationIcon.width}" height="${RECAP_CARD_LAYOUT.locationIcon.height}" preserveAspectRatio="xMidYMid meet"/>`
}

async function buildStaticMapMarkup(): Promise<string> {
  if (!GOOGLE_STATIC_MAPS_KEY) return ""

  const fetchMap = async (view: typeof RECAP_MAP_VIEW) => {
    const params = new URLSearchParams({
      center: `${view.center.lat},${view.center.lng}`,
      zoom: String(view.zoom),
      size: `${view.width}x${view.height}`,
      scale: "2",
      maptype: "roadmap",
      key: GOOGLE_STATIC_MAPS_KEY,
    })
    params.append("style", "feature:all|element:labels|visibility:off")
    params.append("style", "feature:road|element:geometry|visibility:off")
    params.append("style", "feature:transit|element:geometry|visibility:off")
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`
    )
    if (!response.ok) throw new Error("Static Maps 요청 실패")
    return blobToDataUrl(await response.blob())
  }

  try {
    const mainMap = await fetchMap(RECAP_MAP_VIEW)
    return `<image href="${mainMap}" x="0" y="0" width="270" height="480" preserveAspectRatio="xMidYMid slice"/>`
  } catch {
    return ""
  }
}

function removeMapBackground(svgMarkup: string): string {
  const document = new DOMParser().parseFromString(svgMarkup, "image/svg+xml")
  document.querySelector("[data-recap-ocean]")?.remove()
  return new XMLSerializer().serializeToString(document.documentElement)
}

export function buildRecapTextMarkup(model: RecapCardModel): string {
  const days = escapeXml(String(model.totalDays))
  const pins = escapeXml(String(model.pinCount))
  const labels = model.members
    .map((member, index) => {
      const x = RECAP_CARD_LAYOUT.members.left
      const y =
        RECAP_CARD_LAYOUT.members.top +
        index *
          (RECAP_CARD_LAYOUT.members.rowHeight +
            RECAP_CARD_LAYOUT.members.rowGap)
      const width = Math.min(Math.max(member.length * 6 + 16, 28), 104)
      return `<rect x="${x}" y="${y}" width="${width}" height="${RECAP_CARD_LAYOUT.members.rowHeight}" rx="6.5" fill="#232936" fill-opacity=".4"/><text x="${x + width / 2}" y="${y + 9}" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="7" font-weight="500">@${escapeXml(member)}</text>`
    })
    .join("")

  return `<text x="${RECAP_CARD_LAYOUT.heading.left}" y="${RECAP_CARD_LAYOUT.heading.firstBaseline}" font-family="Special Gothic Condensed One, Anton, sans-serif" font-size="${RECAP_CARD_LAYOUT.heading.fontSize}" font-weight="400"><tspan fill="#6cbcf9" stroke="#232936" stroke-width="0.5" paint-order="stroke">${days}</tspan><tspan dx="4" fill="#232936"> DAYS</tspan></text><text x="${RECAP_CARD_LAYOUT.heading.left}" y="${RECAP_CARD_LAYOUT.heading.secondBaseline}" font-family="Special Gothic Condensed One, Anton, sans-serif" font-size="${RECAP_CARD_LAYOUT.heading.fontSize}" font-weight="400"><tspan fill="#6cbcf9" stroke="#232936" stroke-width="0.5" paint-order="stroke">${pins}</tspan><tspan dx="4" fill="#232936"> PINNNED</tspan></text>${labels}`
}

async function buildExportSvg(
  element: HTMLElement,
  model: RecapCardModel
): Promise<string> {
  const map = element.querySelector<SVGSVGElement>("[data-recap-map] svg")
  if (!map) throw new Error("리캡 지도를 찾을 수 없어요")

  const mapMarkup = (
    await inlineSvgImages(new XMLSerializer().serializeToString(map))
  )
    .replaceAll('width="100%"', 'width="270"')
    .replaceAll('height="100%"', 'height="480"')
    .replaceAll('href="/', `href="${window.location.origin}/`)
    .replaceAll('xlink:href="/', `xlink:href="${window.location.origin}/`)

  const locationIconMarkup = buildLocationIconMarkup(element)
  const staticMapMarkup = await buildStaticMapMarkup()
  const mapWithBackground = staticMapMarkup
    ? removeMapBackground(mapMarkup)
    : mapMarkup
  const fontStyle = await exportFontStyle()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="270" height="480" viewBox="0 0 270 480">${fontStyle}<defs><linearGradient id="recap-top-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="white" stop-opacity="0.1"/><stop offset="45%" stop-color="white" stop-opacity="0"/></linearGradient></defs><rect width="270" height="480" rx="32" fill="#79d5e6" stroke="#232936" stroke-width="2"/>${staticMapMarkup}<g>${mapWithBackground.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g><rect width="270" height="480" rx="32" fill="url(#recap-top-glow)" pointer-events="none"/>${locationIconMarkup}${buildRecapTextMarkup(model)}</svg>`
  return inlineSvgImages(svg)
}

async function buildFallbackExportSvg(
  element: HTMLElement,
  model: RecapCardModel
): Promise<string> {
  const map = element.querySelector<SVGSVGElement>("[data-recap-map] svg")
  if (!map) throw new Error("리캡 지도를 찾을 수 없어요")

  const mapMarkup = new XMLSerializer()
    .serializeToString(map)
    .replaceAll('width="100%"', 'width="270"')
    .replaceAll('height="100%"', 'height="480"')
    .replaceAll('href="/', `href="${window.location.origin}/`)
    .replaceAll('xlink:href="/', `xlink:href="${window.location.origin}/`)
    .replace(/^<svg[^>]*>|<\/svg>$/g, "")

  const staticMapMarkup = await buildStaticMapMarkup()
  const mapWithBackground = staticMapMarkup
    ? removeMapBackground(mapMarkup)
    : mapMarkup
  const fontStyle = await exportFontStyle()
  return `<svg xmlns="http://www.w3.org/2000/svg" width="270" height="480" viewBox="0 0 270 480">${fontStyle}<defs><linearGradient id="recap-top-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="white" stop-opacity="0.1"/><stop offset="45%" stop-color="white" stop-opacity="0"/></linearGradient></defs><rect width="270" height="480" rx="32" fill="#79d5e6" stroke="#232936" stroke-width="2"/>${staticMapMarkup}${mapWithBackground}<rect width="270" height="480" rx="32" fill="url(#recap-top-glow)" pointer-events="none"/>${buildLocationIconMarkup(element)}${buildRecapTextMarkup(model)}</svg>`
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
    svg = await buildFallbackExportSvg(element, model)
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

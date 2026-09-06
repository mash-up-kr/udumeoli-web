/** 리캡 카드의 지도 SVG를 PNG로 변환해 공유하거나 다운로드한다. */

import specialGothicFontUrl from "@fontsource/special-gothic-condensed-one/files/special-gothic-condensed-one-latin-400-normal.woff2"

import {
  RECAP_CARD_LAYOUT,
  RECAP_CARD_SIZE,
  estimateTextWidth,
} from "./recap-layout"
import { getRecapMapView } from "./recap-map-config"
import { RECAP_COUNTRY_LABEL } from "./recap-model"
import type { RECAP_MAP_VIEW } from "./recap-map-config"
import type { RecapCardModel } from "./recap-model"

const EXPORT_SCALE = 4
const LABEL_FONT =
  "'Pretendard Variable', Pretendard, 'Apple SD Gothic Neo', sans-serif"
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

/** 캔버스 fillText 전에 웹폰트 로드를 보장한다 (dynamic subset은 지연 로드된다) */
async function ensureLabelFont(): Promise<void> {
  const fonts = document.fonts as FontFaceSet | undefined
  if (!fonts) return
  try {
    await Promise.all([
      fonts.load(`500 10px ${LABEL_FONT}`, "가나다"),
      fonts.ready,
    ])
  } catch (error) {
    console.warn("리캡 한글 폰트를 준비하지 못했어요", error)
  }
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
    // 국경·시도·시군구 경계선 모두 제거 — 지역 구분은 우리 색칠이 한다.
    // 전국 뷰라 북한·일본까지 프레임에 들어오는데, 경계선까지 그리면 주제가 흐려진다.
    params.append(
      "style",
      "feature:administrative|element:geometry|visibility:off"
    )
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`
    )
    if (!response.ok) throw new Error("Static Maps 요청 실패")
    return blobToDataUrl(await response.blob())
  }

  try {
    const mapView = getRecapMapView()
    const mainMap = await fetchMap(mapView)
    return `<image href="${mainMap}" x="0" y="0" width="270" height="480" preserveAspectRatio="xMidYMid slice"/>`
  } catch (error) {
    console.warn(
      "리캡 Static Maps를 불러오지 못해 SVG 지도로 저장합니다",
      error
    )
    return ""
  }
}

function removeMapBackground(svgMarkup: string): string {
  const document = new DOMParser().parseFromString(svgMarkup, "image/svg+xml")
  document.querySelector("[data-recap-ocean]")?.remove()
  // 해안선은 정적 지도에 이미 있다 — 우리 흰 외곽선까지 얹으면 이중으로 두꺼워진다.
  // 정적 지도를 못 불러온 폴백(softenFallbackMap)에서는 육지 구분용으로 남긴다.
  document.querySelector("[data-recap-nation]")?.remove()
  document.querySelectorAll("[data-recap-unvisited]").forEach((path) => {
    path.setAttribute("fill-opacity", "0.28")
  })
  return new XMLSerializer().serializeToString(document.documentElement)
}

function softenFallbackMap(svgMarkup: string): string {
  const document = new DOMParser().parseFromString(svgMarkup, "image/svg+xml")
  document.querySelectorAll("[data-recap-unvisited]").forEach((path) => {
    path.setAttribute("fill-opacity", "0.28")
  })
  return new XMLSerializer().serializeToString(document.documentElement)
}

const HEADING_FONT = "Special Gothic Condensed One, Anton, sans-serif"
function estimateLabelWidth(text: string, fontSize: number): number {
  return (
    estimateTextWidth(text, fontSize) + RECAP_CARD_LAYOUT.labels.paddingX * 2
  )
}

type LabelRow = Array<{ text: string; width: number }>

/** Figma의 flex-wrap 재현 — maxWidth를 넘으면 다음 줄로 넘긴다 */
function wrapLabels(texts: Array<string>, fontSize: number): Array<LabelRow> {
  const { gap, maxWidth } = RECAP_CARD_LAYOUT.labels
  const rows: Array<LabelRow> = []
  let row: LabelRow = []
  let rowWidth = 0

  for (const text of texts) {
    const width = Math.min(estimateLabelWidth(text, fontSize), maxWidth)
    const nextWidth = row.length === 0 ? width : rowWidth + gap + width
    if (row.length > 0 && nextWidth > maxWidth) {
      rows.push(row)
      row = [{ text, width }]
      rowWidth = width
      continue
    }
    row.push({ text, width })
    rowWidth = nextWidth
  }
  if (row.length > 0) rows.push(row)
  return rows
}

function labelPillMarkup(
  text: string,
  x: number,
  y: number,
  width: number,
  fillOpacity: string
): string {
  const { height, fontSize, paddingX } = RECAP_CARD_LAYOUT.labels
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="#232936" fill-opacity="${fillOpacity}"/><text x="${x + paddingX}" y="${y + height / 2 + fontSize * 0.36}" fill="white" font-family="${LABEL_FONT}" font-size="${fontSize}" font-weight="500" data-recap-text="1">${escapeXml(text)}</text>`
}

export function buildRecapTextMarkup(model: RecapCardModel): string {
  const { padding, heading, labels } = RECAP_CARD_LAYOUT
  const pins = escapeXml(String(model.pinCount))

  const headingMarkup =
    `<text x="${padding}" y="${heading.pinBaseline}" font-family="${HEADING_FONT}" font-size="${heading.pinFontSize}" font-weight="400"><tspan fill="#6cbcf9">${pins}</tspan><tspan dx="2.5" fill="#141820">PINNNED</tspan></text>` +
    `<text x="${padding}" y="${heading.countryBaseline}" font-family="${HEADING_FONT}" font-size="${heading.countryFontSize}" font-weight="400" fill="#141820">${escapeXml(RECAP_COUNTRY_LABEL)}</text>`

  // 팟 이름 라벨 위에 닉네임 줄들이 쌓인다 — 아래에서 위로 쌓아 하단 여백을 고정한다
  const rows = wrapLabels(
    model.members.map((member) => `@${member}`),
    labels.fontSize
  )
  const blockHeight =
    (rows.length + 1) * labels.height + rows.length * labels.gap
  const top = RECAP_CARD_SIZE.height - labels.bottom - blockHeight

  const potMarkup = labelPillMarkup(
    model.potName,
    labels.left,
    top,
    estimateLabelWidth(model.potName, labels.fontSize),
    "1"
  )

  const memberMarkup = rows
    .map((row, rowIndex) => {
      const y = top + (rowIndex + 1) * (labels.height + labels.gap)
      let x = labels.left
      return row
        .map(({ text, width }) => {
          const markup = labelPillMarkup(text, x, y, width, "0.4")
          x += width + labels.gap
          return markup
        })
        .join("")
    })
    .join("")

  return `${headingMarkup}${potMarkup}${memberMarkup}`
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
    : softenFallbackMap(mapMarkup)
  const fontStyle = await exportFontStyle()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="270" height="480" viewBox="0 0 270 480">${fontStyle}<defs><linearGradient id="recap-top-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="white" stop-opacity="0.1"/><stop offset="45%" stop-color="white" stop-opacity="0"/></linearGradient></defs><rect width="270" height="480" fill="#79d5e6"/><g>${staticMapMarkup}${mapWithBackground.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g><rect width="270" height="480" fill="url(#recap-top-glow)" pointer-events="none"/>${locationIconMarkup}${buildRecapTextMarkup(model)}</svg>`
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
    : softenFallbackMap(mapMarkup)
  const fontStyle = await exportFontStyle()
  return `<svg xmlns="http://www.w3.org/2000/svg" width="270" height="480" viewBox="0 0 270 480">${fontStyle}<defs><linearGradient id="recap-top-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="white" stop-opacity="0.1"/><stop offset="45%" stop-color="white" stop-opacity="0"/></linearGradient></defs><rect width="270" height="480" fill="#79d5e6"/><g>${staticMapMarkup}${mapWithBackground}</g><rect width="270" height="480" fill="url(#recap-top-glow)" pointer-events="none"/>${buildLocationIconMarkup(element)}${buildRecapTextMarkup(model)}</svg>`
}

interface CanvasText {
  x: number
  y: number
  fontSize: number
  fontWeight: string
  fill: string
  anchor: string
  text: string
}

/** 조상 <g>의 translate를 누적한다 — 마커 라벨은 두 겹으로 감싸여 있다 */
function accumulatedTranslate(node: Element): [number, number] {
  let x = 0
  let y = 0
  for (let n: Element | null = node; n; n = n.parentElement) {
    const transform = n.getAttribute("transform")
    const match = transform?.match(
      /translate\(\s*([-\d.]+)[\s,]+([-\d.]+)\s*\)/
    )
    if (match) {
      x += Number(match[1])
      y += Number(match[2])
    }
  }
  return [x, y]
}

/**
 * SVG를 <img>로 래스터화하면 문서 폰트(Pretendard)가 넘어가지 않아 한글이
 * 시스템 기본 글꼴로 떨어진다. 한글 text는 SVG에서 빼고 캔버스에 직접 그린다 —
 * 캔버스 fillText는 문서 폰트를 그대로 쓴다.
 * SVG 그대로 공유하는 폴백 경로를 위해 원본 markup에는 text를 남겨둔다.
 */
function extractCanvasTexts(svgMarkup: string): {
  svg: string
  texts: Array<CanvasText>
} {
  const document_ = new DOMParser().parseFromString(svgMarkup, "image/svg+xml")
  const nodes = [...document_.querySelectorAll("[data-recap-text]")]
  const texts = nodes.map((node) => {
    const [dx, dy] = accumulatedTranslate(node)
    return {
      x: Number(node.getAttribute("x") ?? 0) + dx,
      y: Number(node.getAttribute("y") ?? 0) + dy,
      fontSize: Number(node.getAttribute("font-size") ?? 10),
      fontWeight: node.getAttribute("font-weight") ?? "400",
      fill: node.getAttribute("fill") ?? "#000",
      anchor: node.getAttribute("text-anchor") ?? "start",
      text: node.textContent,
    }
  })
  nodes.forEach((node) => node.remove())
  return {
    svg: new XMLSerializer().serializeToString(document_.documentElement),
    texts,
  }
}

async function svgToBlob(svgMarkup: string): Promise<Blob> {
  const { svg: svgWithoutText, texts } = extractCanvasTexts(svgMarkup)
  svgMarkup = svgWithoutText
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

  await ensureLabelFont()
  context.textBaseline = "alphabetic"
  for (const item of texts) {
    context.font = `${item.fontWeight} ${item.fontSize}px ${LABEL_FONT}`
    context.fillStyle = item.fill
    context.textAlign =
      item.anchor === "middle"
        ? "center"
        : item.anchor === "end"
          ? "right"
          : "left"
    context.fillText(item.text, item.x, item.y)
  }

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

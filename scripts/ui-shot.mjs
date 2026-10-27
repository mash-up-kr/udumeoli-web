#!/usr/bin/env node
// UI 스크린샷·측정 도구 (Windows/macOS 공용, 셸 미사용).
//   pnpm ui:shot <route...> [--viewports base,narrow,tall,frame,desktop] [--wait <selector>] [--measure <sel,sel>]
//                           [--before] [--publish <slug>] [--full] [--guest] [--no-mock] [--out .ui-shots] [--port 3799]
//   pnpm ui:shot --stop            띄워 둔 dev 서버 종료
// 서버: 포트가 열려 있으면 재사용, 없으면 VITE_USE_MOCK=true로 띄우고 끝나도 유지한다 (콜드 부팅 20~30초, 재사용 0초).
// 목 모드: 로그인 세션을 localStorage에 심어 인증 페이지도 바로 렌더한다 (/, /signup은 --guest 자동).
// --before: origin/main worktree를 임시 폴더에 띄워 같은 라우트를 before.*.png로 찍는다.
// --publish <slug>: PNG를 pr-assets 브랜치의 <slug>/ 아래에 올리고 PR 본문용 마크다운을 출력한다.
import { spawn, spawnSync } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { chromium } from "playwright"

const VIEWPORTS = {
  base: { width: 375, height: 812, mobile: true }, // Figma 기준 프레임. 시안과 px 단위 비교는 여기서만
  narrow: { width: 360, height: 740, mobile: true }, // Galaxy 계열
  tall: { width: 430, height: 932, mobile: true }, // iPhone Pro Max
  frame: { width: 1280, height: 720, mobile: false }, // 노트북: 폰 프레임이 956px보다 낮게 축소되는 구간
  desktop: { width: 1440, height: 900, mobile: false }, // 좌측 브랜딩 + 폰 프레임
}
const GUEST_ROUTES = new Set(["/", "/signup", "/login/callback"])
const MOCK_SESSION = JSON.stringify({
  state: {
    currentUser: { id: "user-1", nickname: "UZ", profileImageUrl: null },
    isAuthenticated: true,
  },
  version: 0,
})

// ---------- args ----------
const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? def : args[i + 1]
}
const flag = (name) => args.includes(`--${name}`)
const VALUE_OPTS = new Set([
  "--viewports",
  "--wait",
  "--measure",
  "--publish",
  "--out",
  "--port",
  "--delay",
])
// 라우트는 앞 슬래시 없이도 받는다 (`my-page`, `home`). Git Bash는 `/my-page`를 `C:/Program Files/Git/my-page`로 바꾸므로 그 접두어도 벗긴다.
const routes = args
  .filter((a, i) => !a.startsWith("--") && !VALUE_OPTS.has(args[i - 1]))
  .map((a) => a.replace(/^[A-Za-z]:\/.*?\/Git\//, "").replace(/^\/+/, ""))
  .map((a) => (a === "" || a === "home" ? "/" : `/${a}`))
const viewports = opt("viewports", "base,narrow,tall,frame").split(",")
const out = resolve(opt("out", ".ui-shots"))
const port = Number(opt("port", 3799))
const mock = !flag("no-mock")
mkdirSync(out, { recursive: true })

// ---------- dev server ----------
const pidFile = (p) => join(out, `server-${p}.pid`)
const isUp = async (p) => {
  try {
    const res = await fetch(`http://localhost:${p}/`, {
      signal: AbortSignal.timeout(2000),
    })
    return res.ok
  } catch {
    return false
  }
}
const killPid = (pid) => {
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
    })
    return
  }
  try {
    process.kill(-pid, "SIGTERM")
  } catch {
    /* 이미 종료됨 */
  }
}
async function ensureServer(cwd, p) {
  if (await isUp(p)) return
  const child = spawn(
    process.execPath,
    [
      join(cwd, "node_modules/vite/bin/vite.js"),
      "dev",
      "--port",
      String(p),
      "--strictPort",
    ],
    {
      cwd,
      env: { ...process.env, ...(mock ? { VITE_USE_MOCK: "true" } : {}) },
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    }
  )
  child.unref()
  writeFileSync(pidFile(p), String(child.pid))
  process.stdout.write(`[ui-shot] dev server 부팅 중 (port ${p})`)
  for (let i = 0; i < 90; i++) {
    if (await isUp(p)) {
      process.stdout.write(` ${i}s\n`)
      return
    }
    await new Promise((r) => setTimeout(r, 1000))
    process.stdout.write(".")
  }
  throw new Error(`dev server가 90초 안에 뜨지 않음 (port ${p})`)
}
if (flag("stop")) {
  for (const f of readdirSync(out).filter((n) => /^server-\d+\.pid$/.test(n))) {
    killPid(Number(readFileSync(join(out, f), "utf8")))
    rmSync(join(out, f))
    console.log(`[ui-shot] ${f} 종료`)
  }
  process.exit(0)
}
if (routes.length === 0) {
  console.error(
    "사용법: pnpm ui:shot <route...> [--viewports ...] [--wait <sel>] [--measure <sel,sel>] [--before] [--publish <slug>]"
  )
  process.exit(1)
}

// ---------- shots ----------
const slugOf = (route) =>
  route === "/" ? "home" : route.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-")
async function shoot(baseUrl, prefix) {
  const browser = await chromium.launch().catch((e) => {
    throw new Error(
      `Chromium 실행 실패. 최초 1회 \`pnpm exec playwright install chromium\` 실행 필요.\n${e.message}`
    )
  })
  const files = []
  const boxes = {}
  for (const route of routes) {
    for (const name of viewports) {
      const vp = VIEWPORTS[name]
      if (!vp) throw new Error(`알 수 없는 viewport: ${name}`)
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.mobile ? 2 : 1,
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
        reducedMotion: "reduce",
      })
      if (mock && !flag("guest") && !GUEST_ROUTES.has(route)) {
        await ctx.addInitScript(
          (s) => localStorage.setItem("photato-session-mock", s),
          MOCK_SESSION
        )
      }
      const page = await ctx.newPage()
      await page.goto(baseUrl + route, { waitUntil: "networkidle" })
      await page.evaluate(() => document.fonts.ready)
      await page.addStyleTag({
        content:
          "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important}",
      })
      const wait = opt("wait")
      if (wait) await page.locator(wait).first().waitFor({ timeout: 15000 })
      // dev 전용 TanStack devtools 플로팅 버튼 제거 (body 직속, class 없는 div)
      await page.evaluate(() => {
        for (const d of document.querySelectorAll("body > div"))
          if (!d.className && /TANSTACK/i.test(d.textContent ?? "")) d.remove()
      })
      await page.waitForTimeout(Number(opt("delay", 300)))
      const file = `${prefix}${slugOf(route)}.${name}.png`
      await page.screenshot({ path: join(out, file), fullPage: flag("full") })
      files.push(file)
      const measure = opt("measure")
      if (measure && name === "base") {
        boxes[route] = {}
        for (const raw of measure.split(",")) {
          const sel = raw.trim()
          const b = await page
            .locator(sel)
            .first()
            .boundingBox({ timeout: 1500 })
            .catch(() => null)
          boxes[route][sel] = b
            ? {
                x: Math.round(b.x),
                y: Math.round(b.y),
                w: Math.round(b.width),
                h: Math.round(b.height),
              }
            : null
        }
      }
      await ctx.close()
    }
  }
  await browser.close()
  return { files, boxes }
}

const root = process.cwd()
await ensureServer(root, port)
const after = await shoot(`http://localhost:${port}`, "")

let before = { files: [] }
if (flag("before")) {
  const dir = join(tmpdir(), "udumeoli-ui-before")
  const git = (...a) => spawnSync("git", a, { stdio: "inherit" })
  git("fetch", "origin", "main")
  if (existsSync(dir)) git("-C", dir, "checkout", "--detach", "origin/main")
  else git("worktree", "add", "--detach", dir, "origin/main")
  const pnpm = process.env.npm_execpath
  const installArgs = ["install", "--prefer-offline", "--frozen-lockfile"]
  const r = pnpm
    ? spawnSync(process.execPath, [pnpm, ...installArgs], {
        cwd: dir,
        stdio: "inherit",
      })
    : spawnSync("pnpm", installArgs, {
        cwd: dir,
        stdio: "inherit",
        shell: true,
      })
  if (r.status !== 0) throw new Error("before worktree pnpm install 실패")
  await ensureServer(dir, port + 1)
  before = await shoot(`http://localhost:${port + 1}`, "before.")
  killPid(Number(readFileSync(pidFile(port + 1), "utf8")))
  rmSync(pidFile(port + 1))
}

// ---------- report ----------
console.log(`\n[ui-shot] 저장: ${out}`)
for (const f of [...before.files, ...after.files]) console.log(`  ${f}`)
if (Object.keys(after.boxes).length) {
  console.log(`\n[ui-shot] base(375x812) bounding boxes (px):`)
  for (const [route, sels] of Object.entries(after.boxes)) {
    console.log(`  ${route}`)
    for (const [sel, b] of Object.entries(sels)) {
      console.log(
        `    ${sel}: ${b ? `x=${b.x} y=${b.y} w=${b.w} h=${b.h}` : "(not found)"}`
      )
    }
  }
}

const slug = opt("publish")
if (slug) {
  const gh = (...a) => {
    const r = spawnSync("gh", a, {
      encoding: "utf8",
      shell: process.platform === "win32",
    })
    return {
      ok: r.status === 0,
      out: (r.stdout ?? "").trim(),
      err: (r.stderr ?? "").trim(),
    }
  }
  const repo = gh(
    "repo",
    "view",
    "--json",
    "nameWithOwner",
    "--jq",
    ".nameWithOwner"
  ).out
  if (!gh("api", `repos/${repo}/git/ref/heads/pr-assets`).ok) {
    const rootSha = spawnSync("git", ["rev-list", "--max-parents=0", "HEAD"], {
      encoding: "utf8",
    })
      .stdout.trim()
      .split("\n")[0]
    const c = gh(
      "api",
      "-X",
      "POST",
      `repos/${repo}/git/refs`,
      "-f",
      "ref=refs/heads/pr-assets",
      "-f",
      `sha=${rootSha}`
    )
    if (!c.ok) throw new Error(`pr-assets 브랜치 생성 실패: ${c.err}`)
  }
  const urls = {}
  for (const f of [...before.files, ...after.files]) {
    const path = `${slug}/${f}`
    const existing = gh(
      "api",
      `repos/${repo}/contents/${path}?ref=pr-assets`,
      "--jq",
      ".sha"
    )
    const tmp = join(out, "upload.json")
    writeFileSync(
      tmp,
      JSON.stringify({
        message: `shot: ${path}`,
        branch: "pr-assets",
        content: readFileSync(join(out, f)).toString("base64"),
        ...(existing.ok ? { sha: existing.out } : {}),
      })
    )
    const u = gh(
      "api",
      "-X",
      "PUT",
      `repos/${repo}/contents/${path}`,
      "--input",
      tmp
    )
    rmSync(tmp)
    if (!u.ok) throw new Error(`업로드 실패 ${path}: ${u.err}`)
    urls[f] = `https://raw.githubusercontent.com/${repo}/pr-assets/${path}`
  }
  console.log(`\n[ui-shot] PR 본문용 마크다운:\n`)
  const vp = viewports.includes("base") ? "base" : viewports[0]
  for (const route of routes) {
    const s = slugOf(route)
    const a = urls[`${s}.${vp}.png`]
    const b = urls[`before.${s}.${vp}.png`]
    console.log(
      `**${route}** (${vp} ${VIEWPORTS[vp].width}×${VIEWPORTS[vp].height})\n`
    )
    if (b) {
      console.log(
        `| Before | After |\n| --- | --- |\n| <img src="${b}" width="300"> | <img src="${a}" width="300"> |\n`
      )
    } else {
      console.log(`<img src="${a}" width="300">\n`)
    }
  }
}

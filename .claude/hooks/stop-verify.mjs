#!/usr/bin/env node
// Stop 훅 (Claude·Codex 공용) — HEAD 대비 바뀐 .ts/.tsx가 있으면 typecheck + eslint.
// 실패: exit 2 + stderr로 에러를 모델에 돌려준다. 같은 에러로는 한 번만 막는다.
// 변경 없음: 즉시 exit 0 (git 조회만, ~50ms).
import { execFileSync, spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

let raw = ""
process.stdin.setEncoding("utf8")
for await (const chunk of process.stdin) raw += chunk
let input = {}
try {
  input = JSON.parse(raw)
} catch {
  /* stdin 없이 실행돼도 동작 */
}
const root = [process.env.CLAUDE_PROJECT_DIR, input.cwd].find(
  (p) => p && existsSync(p)
)
if (root) process.chdir(root)

const git = (args) =>
  execFileSync("git", args, { encoding: "utf8" }).split(/\r?\n/).filter(Boolean)
const changed = [
  ...new Set([
    ...git(["diff", "--name-only", "HEAD", "--", "*.ts", "*.tsx"]),
    ...git([
      "ls-files",
      "--others",
      "--exclude-standard",
      "--",
      "*.ts",
      "*.tsx",
    ]),
  ]),
].filter((f) => existsSync(f))
if (changed.length === 0) process.exit(0)

const run = (args) => {
  const r = spawnSync(process.execPath, args, { encoding: "utf8" })
  return {
    ok: r.status === 0,
    out: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim(),
  }
}
const tsc = run([
  "node_modules/typescript/bin/tsc",
  "--noEmit",
  "--pretty",
  "false",
])
const eslint = run([
  "node_modules/eslint/bin/eslint.js",
  "--max-warnings=0",
  ...changed,
])
if (tsc.ok && eslint.ok) process.exit(0)

const MAX = 6000
const clip = (s) => (s.length > MAX ? `${s.slice(0, MAX)}\n…(truncated)` : s)
const report = [
  tsc.ok ? null : `## typecheck (tsc --noEmit)\n${clip(tsc.out)}`,
  eslint.ok
    ? null
    : `## eslint --max-warnings=0 ${changed.join(" ")}\n${clip(eslint.out)}`,
]
  .filter(Boolean)
  .join("\n\n")

// 같은 에러 묶음으로 이미 한 번 막았으면 통과 — 모델이 보고 "내 변경과 무관"으로 판단해 끝내는 경우.
const marker = join(
  tmpdir(),
  `udumeoli-stop-verify-${input.session_id ?? "nosession"}`
)
const hash = createHash("sha1").update(report).digest("hex")
if (existsSync(marker) && readFileSync(marker, "utf8") === hash) process.exit(0)
writeFileSync(marker, hash)

process.stderr.write(
  `[stop-verify] 변경된 ts/tsx 검증 실패. 아래 에러를 고친 뒤 턴을 끝내라. 네 변경과 무관한 기존 에러면 사용자에게 그 사실을 보고하고 끝내라 (같은 에러로는 다시 막지 않는다).\n\n${report}\n`
)
process.exit(2)

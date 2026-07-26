#!/usr/bin/env node
// PostToolUse(Edit|Write) 훅 — 맥/윈도우 둘 다 동작해야 해서 셸 스크립트 대신 Node로 작성.
import { execFileSync } from "node:child_process"

let raw = ""
process.stdin.setEncoding("utf8")
for await (const chunk of process.stdin) raw += chunk

let filePath
try {
  filePath = JSON.parse(raw).tool_input?.file_path
} catch {
  process.exit(0)
}
if (!filePath) process.exit(0)

if (filePath.endsWith(".tsx")) {
  console.log("[Quality Gate] good-code + good-a11y 체크리스트 확인 필요")
} else if (filePath.endsWith(".ts")) {
  console.log("[Quality Gate] good-code 체크리스트 확인 필요")
} else if (/vite\.config|tsconfig/.test(filePath)) {
  console.log("[Quality Gate] good-bundling 체크리스트 확인 필요")
}

if (/\.tsx?$/.test(filePath)) {
  try {
    execFileSync("pnpm", ["exec", "eslint", filePath], { stdio: "inherit" })
  } catch {
    // non-zero exit = 위반 있음. stdio inherit이라 이미 출력됐으니 그냥 통과.
  }
  try {
    execFileSync("pnpm", ["typecheck"], { stdio: "inherit" })
  } catch {
    // 마찬가지로 출력은 이미 보여줬음.
  }
}

#!/usr/bin/env node
// PostToolUse(Edit|Write) 훅 — Claude/Codex 둘 다 쓰도록 Node로 작성.
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"

let raw = ""
process.stdin.setEncoding("utf8")
for await (const chunk of process.stdin) raw += chunk

let input
try {
  input = JSON.parse(raw)
} catch {
  process.exit(0)
}

function changedFilesFromPatch(command = "") {
  const files = new Set()
  for (const line of command.split("\n")) {
    const match = line.match(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/)
    const moved = line.match(/^\*\*\* Move to: (.+)$/)
    if (match?.[1]) files.add(match[1].trim())
    if (moved?.[1]) files.add(moved[1].trim())
  }
  return [...files]
}

const toolInput = input.tool_input ?? {}
const filePaths = [
  ...(toolInput.file_path ? [toolInput.file_path] : []),
  ...changedFilesFromPatch(toolInput.command),
]
const uniqueFilePaths = [...new Set(filePaths)].filter(Boolean)

if (uniqueFilePaths.length === 0) process.exit(0)

let shouldTypecheck = false

for (const filePath of uniqueFilePaths) {
  if (filePath.endsWith(".tsx")) {
    console.log("[Quality Gate] good-code + good-a11y 체크리스트 확인 필요")
  } else if (filePath.endsWith(".ts")) {
    console.log("[Quality Gate] good-code 체크리스트 확인 필요")
  } else if (/vite\.config|tsconfig/.test(filePath)) {
    console.log("[Quality Gate] good-bundling 체크리스트 확인 필요")
  }

  if (!/\.tsx?$/.test(filePath)) continue
  shouldTypecheck = true
  if (!existsSync(filePath)) continue

  try {
    execFileSync("pnpm", ["exec", "eslint", filePath], { stdio: "inherit" })
  } catch {
    // non-zero exit = 위반 있음. stdio inherit이라 이미 출력됐으니 그냥 통과.
  }
}

if (shouldTypecheck) {
  try {
    execFileSync("pnpm", ["typecheck"], { stdio: "inherit" })
  } catch {
    // 마찬가지로 출력은 이미 보여줬음.
  }
}

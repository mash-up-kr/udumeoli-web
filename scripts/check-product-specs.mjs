import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs"
import { dirname, resolve, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const product = resolve(root, "docs/product")
const screens = resolve(product, "screens")
const read = (path) => readFileSync(path, "utf8")
const walk = (path) =>
  readdirSync(path).flatMap((name) => {
    const entry = resolve(path, name)
    return statSync(entry).isDirectory() ? walk(entry) : [entry]
  })
const documents = walk(product).filter((path) => path.endsWith(".md"))
const index = read(resolve(product, "README.md"))
const questions = read(resolve(product, "OPEN_QUESTIONS.md"))
const questionIds = [...questions.matchAll(/<a id="(q\d+)"><\/a>/g)].map(
  (m) => m[1]
)
assert.equal(new Set(questionIds).size, questionIds.length, "Duplicate Q IDs")
const specIds = new Set()
const nodeIds = new Set()

for (const path of documents) {
  const body = read(path)
  const label = relative(root, path)
  for (const match of body.matchAll(/(?<!\\)\[[^\]]*\]\(([^)]+)\)/g)) {
    const href = match[1]
    if (/^https?:\/\//.test(href)) continue
    const [file, anchor] = href.split("#")
    const target = file ? resolve(dirname(path), file) : path
    assert.ok(existsSync(target), `${label}: missing link ${href}`)
    if (anchor) {
      assert.ok(
        read(target).includes(`<a id="${anchor}"></a>`),
        `${label}: missing anchor ${href}`
      )
    }
  }
  for (const match of body.matchAll(/\[Q(\d+)\]/g)) {
    assert.ok(
      questionIds.includes(`q${match[1]}`),
      `${label}: unknown Q${match[1]}`
    )
  }
  if (dirname(path) !== screens) continue
  const spec = body.match(/문서 ID: (SPEC-\d+)/)?.[1]
  const node = body.match(/Figma 노드: `(\d+:\d+)`/)?.[1]
  assert.ok(spec && node, `${label}: missing spec or source node`)
  assert.ok(
    !specIds.has(spec) && !nodeIds.has(node),
    `${label}: duplicate spec or node`
  )
  specIds.add(spec)
  nodeIds.add(node)
  assert.ok(
    index.includes(spec) &&
      index.includes(
        `screens/${relative(screens, path).replaceAll("\\", "/")}`
      ),
    `${label}: missing index entry`
  )
  assert.ok(
    body.includes(`node-id=${node.replace(":", "-")}`),
    `${label}: source URL mismatch`
  )
  for (const field of ["원문 표기일:", "확인일:", "상태:"]) {
    assert.ok(body.includes(field), `${label}: missing ${field}`)
  }
}

for (const entry of ["AGENTS.md", "CLAUDE.md"]) {
  const body = read(resolve(root, entry))
  assert.ok(
    body.includes(".claude/rules/product-spec.md"),
    `${entry}: missing shared rule`
  )
  assert.ok(
    body.includes(".claude/skills/product-spec/SKILL.md"),
    `${entry}: missing shared skill`
  )
}
const skill = read(resolve(root, ".claude/skills/product-spec/SKILL.md"))
assert.match(skill, /^---\r?\nname: product-spec\r?\ndescription: .+\r?\n---/)
assert.ok(!/TODO|\[INSERT|\[TEMPLATE/.test(skill), "Unfinished skill scaffold")
console.log(
  `Product specs OK: ${specIds.size} screens, ${questionIds.length} questions; links, source IDs, and shared entrypoints checked.`
)

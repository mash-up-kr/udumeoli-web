import { useEffect } from "react"
import { create } from "zustand"

export interface BlockedAuthor {
  id: string
  nickname: string
}
const EMPTY: Array<BlockedAuthor> = []
const storageKey = (accountId: string) => `pinnned-blocked-authors:${accountId}`

export function readBlockedAuthors(accountId: string): Array<BlockedAuthor> {
  const value: unknown = JSON.parse(
    localStorage.getItem(storageKey(accountId)) ?? "[]"
  )
  if (
    !Array.isArray(value) ||
    !value.every(
      (item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "string" &&
        "nickname" in item &&
        typeof item.nickname === "string"
    )
  )
    throw new Error("Invalid blocked authors")
  return value.filter((item: BlockedAuthor) => item.id !== accountId)
}

export const useBlockedAuthorStore = create<{
  accounts: Record<string, Array<BlockedAuthor>>
  errors: Record<string, boolean>
  load: (accountId: string) => void
  block: (accountId: string, author: BlockedAuthor) => void
  unblock: (accountId: string, authorId: string) => void
}>((set) => {
  const save = (accountId: string, authors: Array<BlockedAuthor>) => {
    // 저장 성공 전에는 화면 상태를 바꾸지 않는다 (권한 거부·저장 공간 부족).
    localStorage.setItem(storageKey(accountId), JSON.stringify(authors))
    set((state) => ({
      accounts: { ...state.accounts, [accountId]: authors },
      errors: { ...state.errors, [accountId]: false },
    }))
  }
  return {
    accounts: {},
    errors: {},
    load: (accountId) => {
      try {
        const authors = readBlockedAuthors(accountId)
        set((state) => ({
          accounts: { ...state.accounts, [accountId]: authors },
          errors: { ...state.errors, [accountId]: false },
        }))
      } catch {
        set((state) => ({ errors: { ...state.errors, [accountId]: true } }))
      }
    },
    block: (accountId, author) => {
      if (!accountId || accountId === author.id)
        throw new Error("Invalid block target")
      save(accountId, [
        ...readBlockedAuthors(accountId).filter(
          (item) => item.id !== author.id
        ),
        author,
      ])
    },
    unblock: (accountId, authorId) =>
      save(
        accountId,
        readBlockedAuthors(accountId).filter((item) => item.id !== authorId)
      ),
  }
})

export function useBlockedAuthors(accountId: string | null | undefined) {
  const authors = useBlockedAuthorStore((state) =>
    accountId ? (state.accounts[accountId] ?? EMPTY) : EMPTY
  )
  useEffect(() => {
    if (!accountId) return
    const load = () => useBlockedAuthorStore.getState().load(accountId)
    load()
    window.addEventListener("storage", load)
    return () => window.removeEventListener("storage", load)
  }, [accountId])
  return authors
}

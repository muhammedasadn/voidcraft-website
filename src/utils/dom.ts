// ─── DOM Utilities ───────────────────────────────────────────────────────────

export const qs = <T extends Element>(
  selector: string,
  root: ParentNode = document,
): T => {
  const el = root.querySelector<T>(selector)
  if (!el) throw new Error(`Element not found: "${selector}"`)
  return el
}

export const qsAll = <T extends Element>(
  selector: string,
  root: ParentNode = document,
): T[] => Array.from(root.querySelectorAll<T>(selector))

// ─── Typed Event Bus ─────────────────────────────────────────────────────────

type Handler<T = unknown> = (data: T) => void

class EventEmitter {
  private readonly _map = new Map<string, Set<Handler>>()

  on<T = unknown>(event: string, handler: Handler<T>): () => void {
    if (!this._map.has(event)) this._map.set(event, new Set())
    const set = this._map.get(event)!
    set.add(handler as Handler)
    return () => set.delete(handler as Handler)
  }

  emit<T = unknown>(event: string, data?: T): void {
    this._map.get(event)?.forEach(h => h(data))
  }
}

export const bus = new EventEmitter()

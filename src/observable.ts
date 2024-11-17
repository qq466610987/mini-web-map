class Observable {
  public _events: Record<string, Function | null> = {}

  on(event: string, callback: Function) {
    this._events[event] = callback
  }

  un(event: string) {
    this._events[event] = null
  }

  emit(event: string, ...args: any[]) {
    if (this._events[event]) {
      this._events[event](...args)
    }
  }
}

export default Observable

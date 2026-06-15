// Simple pub/sub event bus

class EventBus {
  constructor() {
    this._listeners = {};
  }

  on(event, fn) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(fn);
    return this;
  }

  off(event, fn) {
    if (!this._listeners[event]) return this;
    this._listeners[event] = this._listeners[event].filter(f => f !== fn);
    return this;
  }

  emit(event, data) {
    if (!this._listeners[event]) return this;
    for (const fn of this._listeners[event]) {
      fn(data);
    }
    return this;
  }
}

export const events = new EventBus();

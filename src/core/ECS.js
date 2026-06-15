// Entity Component System

export class Entity {
  constructor(id) {
    this.id = id;
    this.components = new Map();
    this.active = true;
  }

  add(component) {
    const type = component.constructor.type;
    this.components.set(type, component);
    return this;
  }

  get(Type) {
    return this.components.get(Type.type) || null;
  }

  has(...Types) {
    return Types.every(Type => this.components.has(Type.type));
  }

  remove(Type) {
    this.components.delete(Type.type);
    return this;
  }
}

export class World {
  constructor() {
    this.entities = [];
    this.systems = [];
    this._nextId = 1;
    this._toDestroy = [];
  }

  createEntity(...components) {
    const entity = new Entity(this._nextId++);
    for (const comp of components) {
      entity.add(comp);
    }
    this.entities.push(entity);
    return entity;
  }

  destroyEntity(entity) {
    this._toDestroy.push(entity);
  }

  addSystem(system) {
    this.systems.push(system);
    return this;
  }

  query(...Types) {
    return this.entities.filter(e => e.active && Types.every(T => e.components.has(T.type)));
  }

  queryFirst(...Types) {
    return this.entities.find(e => e.active && Types.every(T => e.components.has(T.type))) || null;
  }

  update(delta) {
    for (const system of this.systems) {
      system.update(delta, this);
    }
    // Clean up destroyed entities
    for (const entity of this._toDestroy) {
      const idx = this.entities.indexOf(entity);
      if (idx !== -1) {
        entity.active = false;
        this.entities.splice(idx, 1);
      }
    }
    this._toDestroy = [];
  }
}

export class System {
  update(delta, world) {
    // Override in subclass
  }
}

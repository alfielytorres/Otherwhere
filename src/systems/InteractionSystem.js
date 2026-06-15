import { System } from '../core/ECS.js';
import { TransformComp, PlayerComp, BuildingComp } from '../components/Components.js';
import { events } from '../core/EventBus.js';

export class InteractionSystem extends System {
  constructor() {
    super();
    this.nearbyBuilding = null;
    this._ePressed = false;
    this._eDown = false;

    this._onKeyDown = (e) => {
      if (e.code === 'KeyE' && !this._eDown) {
        this._eDown = true;
        this._ePressed = true;
      }
    };
    this._onKeyUp = (e) => {
      if (e.code === 'KeyE') {
        this._eDown = false;
      }
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  update(delta, world) {
    const playerEntity = world.queryFirst(TransformComp, PlayerComp);
    if (!playerEntity) return;

    const transform = playerEntity.get(TransformComp);
    const player = playerEntity.get(PlayerComp);

    // Don't interact while doing activity
    if (player.activityTimer > 0) {
      this._ePressed = false;
      return;
    }

    const buildings = world.query(BuildingComp);
    let closestBuilding = null;
    let closestDist = Infinity;

    for (const bEntity of buildings) {
      const b = bEntity.get(BuildingComp);
      const dx = transform.x - b.x;
      const dz = transform.z - b.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < b.interactionRadius && dist < closestDist) {
        closestDist = dist;
        closestBuilding = b;
      }
    }

    if (closestBuilding !== this.nearbyBuilding) {
      this.nearbyBuilding = closestBuilding;
      if (closestBuilding) {
        events.emit('interaction_prompt', {
          show: true,
          building: closestBuilding
        });
      } else {
        events.emit('interaction_prompt', { show: false });
      }
    }

    // Handle E key press
    if (this._ePressed) {
      this._ePressed = false;
      if (this.nearbyBuilding && !player.isInsideBuilding) {
        events.emit('enter_building', { building: this.nearbyBuilding });
      }
    }
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}

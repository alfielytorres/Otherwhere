import { System } from '../core/ECS.js';
import { TransformComp, PlayerComp, BuildingComp } from '../components/Components.js';
import { events } from '../core/EventBus.js';

export class InteractionSystem extends System {
  constructor(interiors = new Map()) {
    super();
    this.interiors = interiors;
    this.nearbyBuilding = null;
    this.nearbyZone = null;
    this._ePressed = false;
    this._eDown = false;
    this._escPressed = false;

    this._onKeyDown = (e) => {
      if (e.code === 'KeyE' && !this._eDown) { this._eDown = true; this._ePressed = true; }
      if (e.code === 'Escape') this._escPressed = true;
    };
    this._onKeyUp = (e) => { if (e.code === 'KeyE') this._eDown = false; };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  update(delta, world) {
    const playerEntity = world.queryFirst(TransformComp, PlayerComp);
    if (!playerEntity) return;
    const transform = playerEntity.get(TransformComp);
    const player = playerEntity.get(PlayerComp);

    if (this._escPressed) {
      this._escPressed = false;
      if (player.isInsideBuilding) {
        events.emit('exit_building', { building: player.currentBuilding });
        this.nearbyZone = null;
        this._ePressed = false;
        return;
      }
    }

    if (player.activityTimer > 0) { this._ePressed = false; return; }

    if (player.isInsideBuilding) {
      const interior = this.interiors.get(player.currentBuilding && player.currentBuilding.id);
      if (interior) {
        let closest = null;
        let closestDist = Infinity;
        for (const zone of interior.interactionZones) {
          const dx = transform.x - zone.x;
          const dz = transform.z - zone.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < zone.radius && dist < closestDist) {
            closestDist = dist;
            closest = zone;
          }
        }
        if (closest !== this.nearbyZone) {
          this.nearbyZone = closest;
          if (closest) {
            events.emit('interaction_prompt', { show: true, label: `[E] ${closest.label}` });
          } else {
            events.emit('interaction_prompt', { show: false });
          }
        }
        if (this._ePressed && closest) {
          this._ePressed = false;
          events.emit('show_zone_activities', { activityKeys: closest.activityKeys, building: player.currentBuilding });
        } else {
          this._ePressed = false;
        }
      } else {
        // No interior data (outdoor building) - clear nearby zone
        this.nearbyZone = null;
        this._ePressed = false;
      }
    } else {
      // Outdoor: check building proximity
      this.nearbyZone = null;
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
        events.emit('interaction_prompt', {
          show: !!closestBuilding,
          building: closestBuilding,
          label: closestBuilding ? `[E] Pumasok sa ${closestBuilding.name}` : ''
        });
      }
      if (this._ePressed) {
        this._ePressed = false;
        if (this.nearbyBuilding) {
          events.emit('enter_building', { building: this.nearbyBuilding });
        }
      }
    }
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}

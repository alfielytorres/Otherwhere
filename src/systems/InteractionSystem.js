import { System } from '../core/ECS.js';
import { TransformComp, PlayerComp, BuildingComp, NPCComp } from '../components/Components.js';
import { events } from '../core/EventBus.js';

function heartsStr(rel) {
  const n = Math.min(5, Math.floor((rel || 0) / 20));
  return '❤'.repeat(n) + '♡'.repeat(5 - n);
}

export class InteractionSystem extends System {
  constructor(interiors = new Map()) {
    super();
    this.interiors = interiors;
    this.nearbyBuilding = null;
    this.nearbyZone = null;
    this.nearbyNPC = null;
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
          if (closest.isExitZone) {
            events.emit('exit_building', { building: player.currentBuilding });
            this.nearbyZone = null;
          } else {
            events.emit('show_zone_activities', { activityKeys: closest.activityKeys, building: player.currentBuilding });
          }
        } else {
          this._ePressed = false;
        }
      } else {
        this.nearbyZone = null;
        this._ePressed = false;
      }
    } else {
      this.nearbyZone = null;

      // Check NPC proximity first (3.5 unit radius)
      const npcEntities = world.query(NPCComp, TransformComp);
      let nearNPC = null, nearNPCTransform = null, nearNPCDist = Infinity;
      for (const ne of npcEntities) {
        const npc = ne.get(NPCComp);
        if (npc.npcType === 'dog') continue;
        const nt = ne.get(TransformComp);
        const dx = transform.x - nt.x, dz = transform.z - nt.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        if (d < 3.5 && d < nearNPCDist) {
          nearNPCDist = d;
          nearNPC = npc;
          nearNPCTransform = nt;
        }
      }

      if (nearNPC !== this.nearbyNPC) {
        this.nearbyNPC = nearNPC;
        if (nearNPC) {
          const rel = (player.relationships && player.relationships[nearNPC.name]) || 0;
          events.emit('interaction_prompt', { show: true, label: `[E] Kausapin si ${nearNPC.name} ${heartsStr(rel)}` });
          this.nearbyBuilding = null;
        } else {
          events.emit('interaction_prompt', { show: false });
        }
      }

      if (nearNPC) {
        if (this._ePressed) {
          this._ePressed = false;
          events.emit('talk_to_npc', { npc: nearNPC, npcTransform: nearNPCTransform });
        }
        return;
      }

      // Building proximity
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

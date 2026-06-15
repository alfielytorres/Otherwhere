import { System } from '../core/ECS.js';
import { NeedsComp, PlayerComp, TransformComp } from '../components/Components.js';
import { events } from '../core/EventBus.js';
import { NEEDS_CONFIG, ACTIVITIES } from '../data/GameData.js';

export class NeedsSystem extends System {
  constructor() {
    super();
    this._criticalEmitted = {};
  }

  update(delta, world) {
    const playerEntity = world.queryFirst(NeedsComp, PlayerComp);
    if (!playerEntity) return;

    const needs = playerEntity.get(NeedsComp);
    const player = playerEntity.get(PlayerComp);

    // Handle activity timer
    if (player.activityTimer > 0) {
      player.activityTimer -= delta;

      if (player.activityTimer <= 0) {
        player.activityTimer = 0;
        // Apply effects
        if (player.currentActivity) {
          const actData = ACTIVITIES[player.currentActivity];
          if (actData) {
            if (actData.needsEffect) {
              for (const [need, val] of Object.entries(actData.needsEffect)) {
                if (needs[need] !== undefined) {
                  needs[need] = Math.max(0, Math.min(100, needs[need] + val));
                }
              }
            }
            if (actData.earnings && actData.earnings > 0) {
              player.money += actData.earnings;
            }
            // Cost was already deducted at start
          }
          events.emit('activity_complete', {
            activity: player.currentActivity,
            actData
          });
          player.currentActivity = null;
          player.activityDuration = 0;
        }
      }
    } else {
      // Decay needs over time (only when not doing an activity)
      for (const [needKey, rate] of Object.entries(NEEDS_CONFIG)) {
        if (rate !== 0 && needs[needKey] !== undefined) {
          needs[needKey] = Math.max(0, Math.min(100, needs[needKey] + rate * delta));
        }
      }
    }

    // Check for critical needs
    const needKeys = ['gutom', 'lakas', 'lipunan', 'kasiyahan', 'kalinisan'];
    for (const key of needKeys) {
      if (needs[key] <= 0) {
        if (!this._criticalEmitted[key]) {
          this._criticalEmitted[key] = true;
          events.emit('need_critical', { need: key, playerName: player.name });
        }
      } else if (needs[key] > 10) {
        this._criticalEmitted[key] = false;
      }
    }
  }
}

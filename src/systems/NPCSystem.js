import { System } from '../core/ECS.js';
import { NPCComp, TransformComp, MeshComp } from '../components/Components.js';

const WORLD_BOUND = 140;

export class NPCSystem extends System {
  constructor() {
    super();
  }

  update(delta, world) {
    const npcEntities = world.query(NPCComp, TransformComp, MeshComp);

    for (const entity of npcEntities) {
      const npc = entity.get(NPCComp);
      const transform = entity.get(TransformComp);
      const meshComp = entity.get(MeshComp);

      if (npc.waitTime > 0) {
        npc.waitTime -= delta;
        continue;
      }

      // Move toward target
      const dx = npc.targetX - transform.x;
      const dz = npc.targetZ - transform.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 1.0) {
        // Reached target, wait then pick new target
        npc.waitTime = 2 + Math.random() * 3;
        npc.targetX = (Math.random() - 0.5) * WORLD_BOUND * 2;
        npc.targetZ = (Math.random() - 0.5) * WORLD_BOUND * 2;
      } else {
        // Move toward target
        const nx = dx / dist;
        const nz = dz / dist;
        transform.x += nx * npc.speed * delta;
        transform.z += nz * npc.speed * delta;

        // Clamp to world
        transform.x = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, transform.x));
        transform.z = Math.max(-WORLD_BOUND, Math.min(WORLD_BOUND, transform.z));

        // Face direction of movement
        transform.rotY = Math.atan2(nx, nz);
      }

      // Update mesh
      if (meshComp.mesh) {
        meshComp.mesh.position.set(transform.x, transform.y, transform.z);
        meshComp.mesh.rotation.y = transform.rotY;

        // Simple walking bob
        if (dist >= 1.0) {
          const t = Date.now() * 0.005 + entity.id;
          meshComp.mesh.position.y = Math.abs(Math.sin(t * 3)) * 0.06;
        }
      }
    }
  }
}

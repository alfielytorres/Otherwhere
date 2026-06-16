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

        if (dist >= 1.0) {
          const t = Date.now() * 0.005 + entity.id * 137.5;
          const swing = Math.sin(t * 2.8) * 0.42;

          // Bob
          meshComp.mesh.position.y = Math.abs(Math.sin(t * 2.8)) * 0.055;

          // Arm swing
          const lArm = meshComp.mesh.getObjectByName('lArm');
          const rArm = meshComp.mesh.getObjectByName('rArm');
          if (lArm) lArm.rotation.x = -swing;
          if (rArm) rArm.rotation.x =  swing;

          // Leg swing
          const lLeg = meshComp.mesh.getObjectByName('lLeg');
          const rLeg = meshComp.mesh.getObjectByName('rLeg');
          if (lLeg) lLeg.rotation.x =  swing * 0.55;
          if (rLeg) rLeg.rotation.x = -swing * 0.55;
        } else {
          // Idle — reset limbs
          const lArm = meshComp.mesh.getObjectByName('lArm');
          const rArm = meshComp.mesh.getObjectByName('rArm');
          const lLeg = meshComp.mesh.getObjectByName('lLeg');
          const rLeg = meshComp.mesh.getObjectByName('rLeg');
          if (lArm) lArm.rotation.x = 0;
          if (rArm) rArm.rotation.x = 0;
          if (lLeg) lLeg.rotation.x = 0;
          if (rLeg) rLeg.rotation.x = 0;
        }
      }
    }
  }
}

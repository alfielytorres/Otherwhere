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

          if (npc.npcType === 'dog') {
            // Dog trot animation
            meshComp.mesh.position.y = Math.abs(Math.sin(t * 5.6)) * 0.03;
            const legSwing = Math.sin(t * 5.6) * 0.5;
            const fl = meshComp.mesh.getObjectByName('legFL');
            const fr = meshComp.mesh.getObjectByName('legFR');
            const rl = meshComp.mesh.getObjectByName('legRL');
            const rr = meshComp.mesh.getObjectByName('legRR');
            const tail = meshComp.mesh.getObjectByName('tail');
            if (fl) fl.rotation.x =  legSwing;
            if (fr) fr.rotation.x = -legSwing;
            if (rl) rl.rotation.x = -legSwing;
            if (rr) rr.rotation.x =  legSwing;
            if (tail) tail.rotation.x = Math.sin(t * 8) * 0.3 - 0.4;
          } else {
            // Human walk animation
            meshComp.mesh.position.y = Math.abs(Math.sin(t * 2.8)) * 0.055;

            const lArm = meshComp.mesh.getObjectByName('lArm');
            const rArm = meshComp.mesh.getObjectByName('rArm');
            if (lArm) lArm.rotation.x = -swing;
            if (rArm) rArm.rotation.x =  swing;

            const lLeg = meshComp.mesh.getObjectByName('lLeg');
            const rLeg = meshComp.mesh.getObjectByName('rLeg');
            if (lLeg) lLeg.rotation.x =  swing * 0.55;
            if (rLeg) rLeg.rotation.x = -swing * 0.55;
          }
        } else {
          // Idle — reset limbs
          meshComp.mesh.position.y = 0;
          if (npc.npcType === 'dog') {
            ['legFL', 'legFR', 'legRL', 'legRR'].forEach(n => {
              const m = meshComp.mesh.getObjectByName(n);
              if (m) m.rotation.x = 0;
            });
          } else {
            ['lArm', 'rArm', 'lLeg', 'rLeg'].forEach(n => {
              const m = meshComp.mesh.getObjectByName(n);
              if (m) m.rotation.x = 0;
            });
          }
        }
      }
    }
  }
}

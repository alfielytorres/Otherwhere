import { System } from '../core/ECS.js';
import { TransformComp, VelocityComp, MeshComp, PlayerComp, BuildingComp } from '../components/Components.js';

export class MovementSystem extends System {
  constructor() {
    super();
    this.keys = {};
    this._onKeyDown = (e) => { this.keys[e.code] = true; };
    this._onKeyUp = (e) => { this.keys[e.code] = false; };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.targetRotY = 0;
  }

  update(delta, world) {
    const playerEntity = world.queryFirst(TransformComp, VelocityComp, PlayerComp, MeshComp);
    if (!playerEntity) return;

    const transform = playerEntity.get(TransformComp);
    const velocity = playerEntity.get(VelocityComp);
    const player = playerEntity.get(PlayerComp);
    const meshComp = playerEntity.get(MeshComp);

    // If player is doing an activity, don't allow movement
    if (player.activityTimer > 0) {
      velocity.vx = 0;
      velocity.vz = 0;
      return;
    }

    const spd = player.speed;
    let dx = 0;
    let dz = 0;

    const left = this.keys['KeyA'] || this.keys['ArrowLeft'];
    const right = this.keys['KeyD'] || this.keys['ArrowRight'];
    const up = this.keys['KeyW'] || this.keys['ArrowUp'];
    const down = this.keys['KeyS'] || this.keys['ArrowDown'];

    if (left) dx -= 1;
    if (right) dx += 1;
    if (up) dz -= 1;
    if (down) dz += 1;

    // Normalize diagonal
    if (dx !== 0 && dz !== 0) {
      const len = Math.sqrt(dx * dx + dz * dz);
      dx /= len;
      dz /= len;
    }

    velocity.vx = dx * spd;
    velocity.vz = dz * spd;

    // Apply velocity
    const newX = transform.x + velocity.vx * delta;
    const newZ = transform.z + velocity.vz * delta;

    // World boundary
    const BOUND = 145;
    const clampedX = Math.max(-BOUND, Math.min(BOUND, newX));
    const clampedZ = Math.max(-BOUND, Math.min(BOUND, newZ));

    // Building collision (AABB)
    const playerHalfW = 0.4;
    const playerHalfD = 0.4;

    let finalX = clampedX;
    let finalZ = clampedZ;

    const buildings = world.query(BuildingComp);
    for (const bEntity of buildings) {
      const b = bEntity.get(BuildingComp);
      const bHalfW = b.width / 2 + playerHalfW;
      const bHalfD = b.depth / 2 + playerHalfD;

      const dx2 = finalX - b.x;
      const dz2 = finalZ - b.z;

      if (Math.abs(dx2) < bHalfW && Math.abs(dz2) < bHalfD) {
        // Push out on shortest axis
        const overlapX = bHalfW - Math.abs(dx2);
        const overlapZ = bHalfD - Math.abs(dz2);

        if (overlapX < overlapZ) {
          finalX = b.x + (dx2 > 0 ? bHalfW : -bHalfW);
        } else {
          finalZ = b.z + (dz2 > 0 ? bHalfD : -bHalfD);
        }
      }
    }

    transform.x = finalX;
    transform.z = finalZ;

    // Update mesh
    if (meshComp.mesh) {
      meshComp.mesh.position.set(transform.x, transform.y, transform.z);

      // Rotation
      if (dx !== 0 || dz !== 0) {
        this.targetRotY = Math.atan2(dx, dz);
      }

      // Lerp rotation
      const currentRotY = meshComp.mesh.rotation.y;
      let diff = this.targetRotY - currentRotY;
      // Wrap diff to [-PI, PI]
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      meshComp.mesh.rotation.y = currentRotY + diff * Math.min(1, delta * 12);

      // Simple walking animation
      if (dx !== 0 || dz !== 0) {
        const t = Date.now() * 0.005;
        meshComp.mesh.position.y = transform.y + Math.abs(Math.sin(t * 3)) * 0.08;
      } else {
        meshComp.mesh.position.y = transform.y;
      }
    }
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}

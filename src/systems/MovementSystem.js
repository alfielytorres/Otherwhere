import { System } from '../core/ECS.js';
import { TransformComp, VelocityComp, MeshComp, PlayerComp, BuildingComp } from '../components/Components.js';
import { touchJoystick } from '../ui/TouchControls.js';

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

    // Slower, more careful movement while inside a building
    const spd = player.isInsideBuilding ? player.speed * 0.6 : player.speed;
    let dx = 0;
    let dz = 0;

    const left = this.keys['KeyA'] || this.keys['ArrowLeft'];
    const right = this.keys['KeyD'] || this.keys['ArrowRight'];
    const up = this.keys['KeyW'] || this.keys['ArrowUp'];
    const down = this.keys['KeyS'] || this.keys['ArrowDown'];

    // Keyboard: binary, normalize diagonal to magnitude 1
    if (left) dx -= 1;
    if (right) dx += 1;
    if (up) dz -= 1;
    if (down) dz += 1;
    if (dx !== 0 && dz !== 0) {
      const kbLen = Math.sqrt(dx * dx + dz * dz);
      dx /= kbLen;
      dz /= kbLen;
    }

    // Joystick: analog [-1,1] per axis — merge then clamp total magnitude to 1
    dx += touchJoystick.dx;
    dz += touchJoystick.dz;
    const mag = Math.sqrt(dx * dx + dz * dz);
    if (mag > 1) { dx /= mag; dz /= mag; }

    // Rotate movement to be relative to the camera (first-person yaw or orbit yaw)
    let moveX = dx;
    let moveZ = dz;

    if (dx !== 0 || dz !== 0) {
      const yaw = world.fpMode ? (world.fpYaw || 0) : (world.cameraYaw || 0);
      moveX = dx * Math.cos(yaw) + dz * Math.sin(yaw);
      moveZ = dz * Math.cos(yaw) - dx * Math.sin(yaw);
    }

    velocity.vx = moveX * spd;
    velocity.vz = moveZ * spd;

    // Apply velocity
    const newX = transform.x + velocity.vx * delta;
    const newZ = transform.z + velocity.vz * delta;

    // Inside a building: clamp to interior room bounds, no building collision
    if (player.isInsideBuilding && player.interiorBounds) {
      const b = player.interiorBounds;
      transform.x = Math.max(b.minX, Math.min(b.maxX, newX));
      transform.z = Math.max(b.minZ, Math.min(b.maxZ, newZ));
      this._updateMesh(meshComp, transform, moveX, moveZ, dx, dz, delta, world);
      return;
    }

    // World boundary
    const BOUND = 145;
    const clampedX = Math.max(-BOUND, Math.min(BOUND, newX));
    const clampedZ = Math.max(-BOUND, Math.min(BOUND, newZ));

    // Building collision - skip when inside a building
    const playerHalfW = 0.4;
    const playerHalfD = 0.4;

    let finalX = clampedX;
    let finalZ = clampedZ;

    if (!player.isInsideBuilding) {
      const buildings = world.query(BuildingComp);
      for (const bEntity of buildings) {
        const b = bEntity.get(BuildingComp);
        const bHalfW = b.width / 2 + playerHalfW;
        const bHalfD = b.depth / 2 + playerHalfD;

        const dx2 = finalX - b.x;
        const dz2 = finalZ - b.z;

        if (Math.abs(dx2) < bHalfW && Math.abs(dz2) < bHalfD) {
          const overlapX = bHalfW - Math.abs(dx2);
          const overlapZ = bHalfD - Math.abs(dz2);

          if (overlapX < overlapZ) {
            finalX = b.x + (dx2 > 0 ? bHalfW : -bHalfW);
          } else {
            finalZ = b.z + (dz2 > 0 ? bHalfD : -bHalfD);
          }
        }
      }
    }

    transform.x = finalX;
    transform.z = finalZ;

    this._updateMesh(meshComp, transform, moveX, moveZ, dx, dz, delta, world);
  }

  _updateMesh(meshComp, transform, moveX, moveZ, dx, dz, delta, world) {
    if (!meshComp.mesh) return;

    // Always sync position
    meshComp.mesh.position.set(transform.x, transform.y, transform.z);

    // Always lerp rotation (Mixamo reads this even when procedural mesh is hidden)
    if (moveX !== 0 || moveZ !== 0) {
      this.targetRotY = Math.atan2(moveX, moveZ);
    }
    const currentRotY = meshComp.mesh.rotation.y;
    let diff = this.targetRotY - currentRotY;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    meshComp.mesh.rotation.y = currentRotY + diff * Math.min(1, delta * 12);

    // Procedural walk bob — skip when Mixamo handles animation
    if (!world.mixamoLoaded) {
      if (dx !== 0 || dz !== 0) {
        const t = Date.now() * 0.005;
        meshComp.mesh.position.y = transform.y + Math.abs(Math.sin(t * 3)) * 0.08;
      }
    }
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}

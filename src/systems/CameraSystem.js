import { System } from '../core/ECS.js';
import { TransformComp, PlayerComp } from '../components/Components.js';
import * as THREE from 'three';

export class CameraSystem extends System {
  constructor(camera) {
    super();
    this.camera = camera;
    this.targetPosition = new THREE.Vector3();
    this.currentPosition = new THREE.Vector3(0, 15, 20);
    this.lookAtTarget = new THREE.Vector3();
    this.LERP = 0.05;
    this.HEIGHT = 16;
    this.DISTANCE = 22;
  }

  update(delta, world) {
    const playerEntity = world.queryFirst(TransformComp, PlayerComp);
    if (!playerEntity) return;

    const transform = playerEntity.get(TransformComp);

    // Desired camera position: behind and above player
    this.targetPosition.set(
      transform.x,
      transform.y + this.HEIGHT,
      transform.z + this.DISTANCE
    );

    // Smooth lerp
    this.currentPosition.lerp(this.targetPosition, this.LERP);
    this.camera.position.copy(this.currentPosition);

    // Look at player position with slight upward offset
    this.lookAtTarget.set(transform.x, transform.y + 1.5, transform.z);
    this.camera.lookAt(this.lookAtTarget);
  }
}

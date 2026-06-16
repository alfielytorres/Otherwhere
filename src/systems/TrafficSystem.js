import { System } from '../core/ECS.js';
import * as THREE from 'three';

// Road lane definitions: { x1,z1 → x2,z2, rotY }
const LANES = [
  { x1: -185, z1:  3.5, x2: 185, z2:  3.5, rotY: Math.PI / 2 },  // east
  { x1:  185, z1: -3.5, x2:-185, z2: -3.5, rotY: -Math.PI / 2 }, // west
  { x1:  3.5, z1: -185, x2:  3.5, z2: 185, rotY: Math.PI },       // south
  { x1: -3.5, z1:  185, x2: -3.5, z2:-185, rotY: 0 },             // north
];

export class TrafficSystem extends System {
  constructor(scene) {
    super();
    this.scene = scene;
    this.vehicles = [];
    this._wheelAngle = 0;
  }

  addVehicle(mesh, laneIndex, startT, speed, headlightColor = 0xfff8e0) {
    const lane = LANES[laneIndex % LANES.length];

    // Headlight point light
    const light = new THREE.PointLight(headlightColor, 2.8, 28);
    this.scene.add(light);

    this.vehicles.push({ mesh, light, lane, t: startT, speed });
  }

  update(delta, world) {
    this._wheelAngle += delta * 4;

    for (const v of this.vehicles) {
      v.t += v.speed * delta;
      if (v.t > 1) v.t -= 1;

      const x = v.lane.x1 + (v.lane.x2 - v.lane.x1) * v.t;
      const z = v.lane.z1 + (v.lane.z2 - v.lane.z1) * v.t;

      v.mesh.position.set(x, 0, z);
      v.mesh.rotation.y = v.lane.rotY;

      // Headlight hovers in front of the vehicle
      const fw = new THREE.Vector3(Math.sin(v.lane.rotY), 0, Math.cos(v.lane.rotY));
      v.light.position.set(x + fw.x * 3, 1.4, z + fw.z * 3);
    }
  }

  dispose() {
    for (const v of this.vehicles) {
      this.scene.remove(v.light);
    }
  }
}

import * as THREE from 'three';

function mat(color, roughness = 0.7, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}
function emMat(color, intensity = 2) {
  return new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color), emissiveIntensity: intensity, roughness: 0.4 });
}

const CAR_COLORS = [0xc0392b, 0x2980b9, 0x27ae60, 0xf39c12, 0x8e44ad, 0xecf0f1, 0x2c3e50, 0xe67e22];

export function createCar() {
  const color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
  const group = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 4.4), mat(color, 0.3, 0.65));
  body.position.y = 0.8; body.castShadow = true; body.receiveShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.85, 0.75, 2.1),
    new THREE.MeshStandardMaterial({ color: 0x0a1520, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.6 })
  );
  cabin.position.set(0, 1.68, -0.15); cabin.castShadow = true;
  group.add(cabin);

  // Headlights
  for (const sx of [-0.65, 0.65]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.1), emMat(0xfff8e0, 2.5));
    hl.position.set(sx, 0.9, 2.21); group.add(hl);
  }

  // Tail lights
  for (const sx of [-0.65, 0.65]) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.1), emMat(0xff1500, 1.8));
    tl.position.set(sx, 0.9, -2.21); group.add(tl);
  }

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 8);
  const wheelMat = mat(0x111111, 0.95, 0.05);
  for (const [sx, sz] of [[-1.15, 1.4], [1.15, 1.4], [-1.15, -1.4], [1.15, -1.4]]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2; w.position.set(sx, 0.34, sz); group.add(w);
  }

  return group;
}

export function createJeepney() {
  const group = new THREE.Group();
  const bodyColor = [0xb03020, 0x20a060, 0xd4a020, 0x2050b0][Math.floor(Math.random() * 4)];

  const body = new THREE.Mesh(new THREE.BoxGeometry(3, 1.8, 6), mat(bodyColor, 0.45, 0.3));
  body.position.y = 1.1; body.castShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, 5), mat(0xc08010, 0.5, 0.4));
  roof.position.y = 2.15; group.add(roof);

  // Decorative roof rack
  const rack = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 4.6), mat(0x888888, 0.4, 0.8));
  rack.position.y = 2.35; group.add(rack);

  // Headlights
  for (const sx of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 5), emMat(0xffffcc, 2));
    hl.position.set(sx, 1.1, 3.05); group.add(hl);
  }

  // Tail lights
  for (const sx of [-1, 1]) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.08), emMat(0xff1500, 1.5));
    tl.position.set(sx, 1.1, -3.05); group.add(tl);
  }

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
  const wheelMat = mat(0x0a0a0a, 0.9);
  for (const [sx, sz] of [[-1.5, -2], [1.5, -2], [-1.5, 0], [1.5, 0], [-1.5, 2], [1.5, 2]]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2; w.position.set(sx, 0.4, sz); group.add(w);
  }

  return group;
}

export function createDog() {
  const furColor = [0x8B6914, 0x4a3020, 0xd4a055, 0x888888, 0x111111][Math.floor(Math.random() * 5)];
  const group = new THREE.Group();
  const m = mat(furColor, 0.92);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.95), m.clone());
  body.position.y = 0.42; body.castShadow = true; group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.32), m.clone());
  head.position.set(0, 0.53, 0.55); head.castShadow = true; group.add(head);

  // Snout
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.16), mat(furColor * 0.85, 0.92));
  snout.position.set(0, 0.47, 0.7); group.add(snout);

  // Ears
  for (const sx of [-0.11, 0.11]) {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.09), mat(Math.floor(furColor * 0.75), 0.92));
    ear.position.set(sx, 0.66, 0.53); group.add(ear);
  }

  // Tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.3, 4), m.clone());
  tail.name = 'tail';
  tail.position.set(0, 0.5, -0.52); tail.rotation.x = 0.6; group.add(tail);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.34, 4);
  const legNames = ['legFL', 'legFR', 'legRL', 'legRR'];
  for (const [i, [sx, sz]] of [[-0.18, 0.33], [0.18, 0.33], [-0.18, -0.28], [0.18, -0.28]].entries()) {
    const leg = new THREE.Mesh(legGeo, m.clone());
    leg.name = legNames[i];
    leg.position.set(sx, 0.16, sz); group.add(leg);
  }

  return group;
}

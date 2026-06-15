import * as THREE from 'three';
import { BUILDINGS } from '../data/GameData.js';

function stdMat(color, roughness = 0.8, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function emissiveMat(color, intensity = 1.3) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    roughness: 0.4
  });
}

// ---- Instanced trees (sparse, scruffy urban trees) ----
function createTreeInstances(scene, positions) {
  const dummy = new THREE.Object3D();

  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 5, 7);
  const trunkMat = stdMat(0x3a2a1a, 0.95);
  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, positions.length);
  trunkMesh.receiveShadow = true;
  positions.forEach(([x, z], i) => {
    dummy.position.set(x, 2.5, z);
    dummy.updateMatrix();
    trunkMesh.setMatrixAt(i, dummy.matrix);
  });
  trunkMesh.instanceMatrix.needsUpdate = true;
  scene.add(trunkMesh);

  const crownGeo = new THREE.SphereGeometry(2.6, 8, 8);
  const crownMat = stdMat(0x1a3320, 0.9);
  const crownMesh = new THREE.InstancedMesh(crownGeo, crownMat, positions.length);
  positions.forEach(([x, z], i) => {
    dummy.position.set(x, 6, z);
    dummy.updateMatrix();
    crownMesh.setMatrixAt(i, dummy.matrix);
  });
  crownMesh.instanceMatrix.needsUpdate = true;
  scene.add(crownMesh);
}

// ---- Instanced lamp posts with warm sodium glow ----
function createLampInstances(scene, lampPositions) {
  const dummy = new THREE.Object3D();

  const poleGeo = new THREE.CylinderGeometry(0.1, 0.12, 6, 6);
  const poleMat = stdMat(0x222222, 0.7, 0.4);
  const poleMesh = new THREE.InstancedMesh(poleGeo, poleMat, lampPositions.length);
  poleMesh.receiveShadow = true;
  lampPositions.forEach(([x, z], i) => {
    dummy.position.set(x, 3, z);
    dummy.updateMatrix();
    poleMesh.setMatrixAt(i, dummy.matrix);
  });
  poleMesh.instanceMatrix.needsUpdate = true;
  scene.add(poleMesh);

  // Sodium-orange bulbs (emissive)
  const bulbGeo = new THREE.SphereGeometry(0.35, 8, 8);
  const bulbMat = emissiveMat(0xFF6600, 1.6);
  const bulbMesh = new THREE.InstancedMesh(bulbGeo, bulbMat, lampPositions.length);
  lampPositions.forEach(([x, z], i) => {
    dummy.position.set(x, 6.2, z);
    dummy.updateMatrix();
    bulbMesh.setMatrixAt(i, dummy.matrix);
  });
  bulbMesh.instanceMatrix.needsUpdate = true;
  scene.add(bulbMesh);
}

// ---- Neon sign panel above a building's door ----
function createNeonSign(scene, bdata) {
  if (!bdata.neonSign) return;
  const w = Math.min(bdata.width * 0.7, 7);
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(w, 1.4, 0.3),
    emissiveMat(bdata.neonSign.color, 1.8)
  );
  // Position above the door on the +Z facing side
  sign.position.set(bdata.x, Math.min(bdata.height, 6) + 0.5, bdata.z + bdata.depth / 2 + 0.4);
  scene.add(sign);

  // Backing board
  const board = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 1.8, 0.2), stdMat(0x111111, 0.9));
  board.position.set(bdata.x, Math.min(bdata.height, 6) + 0.5, bdata.z + bdata.depth / 2 + 0.25);
  scene.add(board);

  // A subtle colored point light to spill neon onto the street
  const glow = new THREE.PointLight(bdata.neonSign.color, 0.8, 16);
  glow.position.set(bdata.x, Math.min(bdata.height, 6) + 0.5, bdata.z + bdata.depth / 2 + 2);
  scene.add(glow);
}

function createBuilding(scene, bdata) {
  const group = new THREE.Group();
  const height = bdata.height || 8;
  const w = bdata.width;
  const d = bdata.depth;
  const isRedLight = bdata.district === 'red_light';

  // Outdoor "buildings" (alley, street food, court) get a minimal pad instead of a tower
  if (bdata.isOutdoor) {
    if (bdata.id === 'BASKETBALL') {
      const court = new THREE.Mesh(new THREE.BoxGeometry(w - 2, 0.15, d - 2), stdMat(0x884422, 0.9));
      court.position.y = 0.1;
      group.add(court);
      for (const side of [-1, 1]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.5, 6), stdMat(0x555555, 0.7, 0.4));
        pole.position.set(side * (w / 2 - 1.5), 1.75, 0);
        group.add(pole);
        const board = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.1), stdMat(0xcccccc, 0.3));
        board.position.set(side * (w / 2 - 1.5), 3.8, 0);
        group.add(board);
      }
    } else if (bdata.id === 'DARK_ALLEY') {
      // Narrow grimy alley walls + a flickering bulb + graffiti
      for (const side of [-1, 1]) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(0.4, height, d), stdMat(0x1a1a18, 0.95));
        wall.position.set(side * (w / 2), height / 2, 0);
        group.add(wall);
        // Graffiti tags
        const graf = new THREE.Mesh(new THREE.PlaneGeometry(d * 0.7, 1.5),
          new THREE.MeshStandardMaterial({ color: 0x33ff88, emissive: new THREE.Color(0x22aa55), emissiveIntensity: 0.5, side: THREE.DoubleSide }));
        graf.position.set(side * (w / 2 - 0.25), 2, 0);
        graf.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        group.add(graf);
      }
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), emissiveMat(0xffccaa, 1.2));
      bulb.position.set(0, height - 0.5, 0);
      group.add(bulb);
      const aLight = new THREE.PointLight(0xffaa66, 0.6, 10);
      aLight.position.set(0, height - 0.5, 0);
      group.add(aLight);
    } else {
      // Street food stall: small cart with a grill
      const cart = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d), stdMat(0x4a2a1a, 0.8));
      cart.position.y = 0.6;
      group.add(cart);
      const grill = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.2, d * 0.6), emissiveMat(0xff4400, 0.8));
      grill.position.y = 1.25;
      group.add(grill);
      const glow = new THREE.PointLight(0xff5500, 0.7, 8);
      glow.position.set(0, 2, 0);
      group.add(glow);
    }
    group.position.set(bdata.x, 0, bdata.z);
    scene.add(group);
    return { group, buildingData: bdata };
  }

  // Body material: glass/metal for BGC, dark grungy for red-light
  let bodyMat;
  if (isRedLight) {
    bodyMat = stdMat(bdata.color, 0.85, 0.05);
  } else if (['office', 'mall'].includes(bdata.buildingType)) {
    bodyMat = new THREE.MeshStandardMaterial({ color: bdata.color, roughness: 0.15, metalness: 0.6 });
  } else {
    bodyMat = stdMat(bdata.color, 0.75, 0.15);
  }
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, height, d), bodyMat);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Roof
  if (['residential', 'church', 'market', 'store', 'spa'].includes(bdata.buildingType)) {
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.75, height * 0.5, 4), stdMat(bdata.roofColor, 0.9));
    roof.position.y = height + height * 0.25;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);
  } else {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 0.5, d + 0.5), stdMat(bdata.roofColor, 0.85));
    roof.position.y = height + 0.25;
    group.add(roof);
  }

  // Church steeple
  if (bdata.buildingType === 'church') {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(4, height * 0.8, 4), bodyMat.clone());
    tower.position.set(-w / 2 + 2, height * 0.9, 0);
    group.add(tower);
    const steeple = new THREE.Mesh(new THREE.ConeGeometry(2.5, height * 0.7, 4), stdMat(bdata.roofColor, 0.85));
    steeple.position.set(-w / 2 + 2, height * 1.7, 0);
    steeple.rotation.y = Math.PI / 4;
    group.add(steeple);
  }

  // Lit windows — one emissive strip per floor (avoids hundreds of individual meshes)
  const winRows = Math.min(3, Math.max(1, Math.floor(height / 5)));
  const winColor = isRedLight ? 0xff5588 : 0xffcc66;
  for (let row = 0; row < winRows; row++) {
    const winMat = emissiveMat(winColor, 0.7);
    const winStrip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.75, 0.6, 0.15), winMat);
    const wY = (row + 1) * (height / (winRows + 1));
    winStrip.position.set(0, wY, d / 2 + 0.08);
    group.add(winStrip);
  }

  // Door
  const door = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 0.2), stdMat(0x0a0a0a, 0.6, 0.3));
  door.position.set(0, 1.25, d / 2 + 0.11);
  group.add(door);

  group.position.set(bdata.x, 0, bdata.z);
  scene.add(group);

  // Extra red glow for red-light district buildings (no PointLight to save draw calls)
  if (isRedLight) {
    const signGlow = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.4, 0.1),
      emissiveMat(0xff0044, 2.5));
    signGlow.position.set(0, height + 0.5, d / 2 + 0.05);
    group.add(signGlow);
  }

  return { group, buildingData: bdata };
}

function createJeepney(scene, x, z) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(3, 1.8, 6), stdMat(0xb03020, 0.7, 0.2));
  body.position.y = 1.1;
  group.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, 5), stdMat(0xc08010, 0.6, 0.2));
  roof.position.y = 2.15;
  group.add(roof);
  for (const sx of [-1.4, 1.4]) {
    for (const sz of [-2, 0, 2]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 10), stdMat(0x0a0a0a, 0.9));
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(sx, 0.4, sz);
      group.add(wheel);
    }
  }
  // Headlights
  for (const sx of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), emissiveMat(0xffffcc, 1.5));
    hl.position.set(sx, 1, 3.05);
    group.add(hl);
  }
  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

function createFountain(scene, x, z) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.5, 0.8, 16), stdMat(0x555555, 0.6, 0.2));
  base.position.y = 0.4;
  group.add(base);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x113355, transparent: true, opacity: 0.85, roughness: 0.05, metalness: 0.6 });
  const water = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.1, 16), waterMat);
  water.position.y = 1;
  group.add(water);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 3, 8), stdMat(0x444444, 0.6, 0.3));
  pole.position.y = 2.5;
  group.add(pole);
  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

function createBench(scene, x, z, rotY = 0) {
  const group = new THREE.Group();
  const woodMat = stdMat(0x3a2a1a, 0.85);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2, 0.15, 0.5), woodMat);
  seat.position.y = 0.8;
  group.add(seat);
  for (const lx of [-0.7, 0.7]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.5), stdMat(0x222222, 0.7, 0.3));
    leg.position.set(lx, 0.4, 0);
    group.add(leg);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 0.1), woodMat);
  back.position.set(0, 1.15, -0.2);
  group.add(back);
  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  scene.add(group);
  return group;
}

function createTrashBin(scene, x, z) {
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 1, 8), stdMat(0x1a1a1a, 0.9));
  bin.position.set(x, 0.5, z);
  bin.castShadow = true;
  scene.add(bin);
}

function createPuddle(scene, x, z, r = 2) {
  const puddleMat = new THREE.MeshStandardMaterial({
    color: 0x223344,
    transparent: true,
    opacity: 0.45,
    roughness: 0.05,
    metalness: 0.8
  });
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(r, 16), puddleMat);
  puddle.rotation.x = -Math.PI / 2;
  puddle.position.set(x, 0.03, z);
  scene.add(puddle);
}

function createGraffitiWall(scene, x, z, rotY, color) {
  const graf = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 2),
    new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color), emissiveIntensity: 0.4, side: THREE.DoubleSide })
  );
  graf.position.set(x, 1.5, z);
  graf.rotation.y = rotY;
  scene.add(graf);
}

export function generateWorld(scene) {
  // Wet dark asphalt ground
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.4 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Red-light district floor tint (z ~90-110)
  const rlZone = new THREE.Mesh(new THREE.PlaneGeometry(160, 60),
    new THREE.MeshStandardMaterial({ color: 0x2a0a14, roughness: 0.25, metalness: 0.4 }));
  rlZone.rotation.x = -Math.PI / 2;
  rlZone.position.set(0, 0.005, 95);
  scene.add(rlZone);

  // Roads
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x0e0e0e, roughness: 0.25, metalness: 0.5 });
  const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(400, 10), roadMat);
  hRoad.rotation.x = -Math.PI / 2;
  hRoad.position.set(0, 0.02, 0);
  scene.add(hRoad);
  const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(10, 400), roadMat);
  vRoad.rotation.x = -Math.PI / 2;
  vRoad.position.set(0, 0.02, 0);
  scene.add(vRoad);
  for (const pos of [-60, -30, 30, 60, 90]) {
    const sr1 = new THREE.Mesh(new THREE.PlaneGeometry(400, 6), roadMat);
    sr1.rotation.x = -Math.PI / 2;
    sr1.position.set(0, 0.015, pos);
    scene.add(sr1);
    const sr2 = new THREE.Mesh(new THREE.PlaneGeometry(6, 400), roadMat);
    sr2.rotation.x = -Math.PI / 2;
    sr2.position.set(pos, 0.015, 0);
    scene.add(sr2);
  }

  // Faded yellow road lines
  const lineMat = stdMat(0x999900, 0.6);
  for (let pos = -160; pos <= 160; pos += 20) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(8, 0.3), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(pos, 0.025, 0);
    scene.add(line);
    const line2 = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 8), lineMat);
    line2.rotation.x = -Math.PI / 2;
    line2.position.set(0, 0.025, pos);
    scene.add(line2);
  }

  // Buildings + neon signs
  const buildingMeshObjects = [];
  for (const bdata of BUILDINGS) {
    const result = createBuilding(scene, bdata);
    buildingMeshObjects.push(result);
    createNeonSign(scene, bdata);
  }

  // Fountain at center
  createFountain(scene, 0, 0);

  // Sparse urban trees
  createTreeInstances(scene, [
    [-20, -20], [20, -20], [-50, -50], [50, -50], [-100, -100], [100, 100],
    [-30, 40], [40, 30], [-90, 10], [90, -10], [10, -50], [-40, -90],
    [-110, 30], [110, -30], [60, -40], [-60, 40]
  ]);

  // Lamp posts along roads
  const lampPositions = [];
  for (let pos = -150; pos <= 150; pos += 20) {
    lampPositions.push([pos, 6]);
    lampPositions.push([pos, -6]);
    lampPositions.push([6, pos]);
    lampPositions.push([-6, pos]);
  }
  createLampInstances(scene, lampPositions);

  // Benches
  createBench(scene, -15, 15, Math.PI / 4);
  createBench(scene, 15, 15, -Math.PI / 4);
  createBench(scene, -15, -15, -Math.PI / 4);
  createBench(scene, 15, -15, Math.PI / 4);

  // Jeepney
  createJeepney(scene, 45, -85);
  createJeepney(scene, -40, 80);

  // Grungy props: trash bins
  for (const [tx, tz] of [[-12, 88], [14, 92], [48, 90], [-43, 80], [-3, 105], [25, -12], [-25, 25], [72, -52]]) {
    createTrashBin(scene, tx, tz);
  }

  // Wet street puddles
  for (const [px, pz, pr] of [[8, 50, 2], [-10, 70, 1.5], [20, 95, 2.5], [-30, 90, 2], [0, 30, 1.8], [40, -20, 2], [-60, 20, 1.5], [5, 110, 2]]) {
    createPuddle(scene, px, pz, pr);
  }

  // Graffiti walls around the red-light district
  createGraffitiWall(scene, -10, 100, 0, 0xff2288);
  createGraffitiWall(scene, 30, 100, 0, 0x22ddff);
  createGraffitiWall(scene, -50, 88, Math.PI / 2, 0xffdd22);

  // Water plane (kept; far edge)
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x0a1a2a, transparent: true, opacity: 0.85, roughness: 0.05, metalness: 0.7 });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.15, 140);
  scene.add(water);

  // ---- Night lighting ----
  // Bright enough to navigate but still moody
  const ambientLight = new THREE.AmbientLight(0x1a2d45, 0.9);
  scene.add(ambientLight);

  // Moonlight — directional, no shadows (huge perf win)
  const sunLight = new THREE.DirectionalLight(0x5577bb, 1.2);
  sunLight.position.set(60, 80, -40);
  sunLight.castShadow = false;
  scene.add(sunLight);

  // Warm hemisphere: sky cool blue, ground warm orange-tinted asphalt
  const hemiLight = new THREE.HemisphereLight(0x223355, 0x1a1208, 0.6);
  scene.add(hemiLight);

  // Sodium street lamp pools — 4 PointLights at main intersections
  const streetLampPositions = [[0, 0], [60, 0], [-60, 0], [0, -60]];
  for (const [lx, lz] of streetLampPositions) {
    const l = new THREE.PointLight(0xff8822, 1.2, 60);
    l.position.set(lx, 6, lz);
    scene.add(l);
  }

  return { water, buildingMeshObjects, ambientLight, sunLight };
}

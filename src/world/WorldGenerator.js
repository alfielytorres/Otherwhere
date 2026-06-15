import * as THREE from 'three';
import { BUILDINGS } from '../data/GameData.js';

function makeMaterial(color, opts = {}) {
  return new THREE.MeshLambertMaterial({ color, ...opts });
}

function addBox(scene, w, h, d, color, x, y, z, opts = {}) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = makeMaterial(color, opts);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function createPalmTree(scene, x, z) {
  const group = new THREE.Group();

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 7, 8);
  const trunkMat = makeMaterial(0x8B6914);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 3.5;
  trunk.castShadow = true;
  group.add(trunk);

  // Leaves - multiple discs
  for (let i = 0; i < 4; i++) {
    const leafGeo = new THREE.CylinderGeometry(0.1, 3.5 - i * 0.5, 0.3, 8);
    const leafMat = makeMaterial(i % 2 === 0 ? 0x2E7D32 : 0x388E3C);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.y = 7 + i * 0.4;
    leaf.castShadow = true;
    group.add(leaf);
  }

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

function createMangoTree(scene, x, z) {
  const group = new THREE.Group();

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 5, 8);
  const trunkMat = makeMaterial(0x5D4037);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 2.5;
  trunk.castShadow = true;
  group.add(trunk);

  // Crown
  const crownGeo = new THREE.SphereGeometry(3.5, 10, 10);
  const crownMat = makeMaterial(0x2E7D32);
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.position.y = 7;
  crown.castShadow = true;
  group.add(crown);

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

function createLampPost(scene, x, z) {
  const group = new THREE.Group();

  const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 6, 6);
  const poleMat = makeMaterial(0x555555);
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 3;
  group.add(pole);

  const bulbGeo = new THREE.SphereGeometry(0.35, 8, 8);
  const bulbMat = new THREE.MeshLambertMaterial({ color: 0xFFFF99, emissive: 0xAAAA44 });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.y = 6.3;
  group.add(bulb);

  const light = new THREE.PointLight(0xFFFF88, 0.8, 15);
  light.position.y = 6.3;
  group.add(light);

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

function createBuilding(scene, bdata) {
  const group = new THREE.Group();
  const height = bdata.height || 8;
  const w = bdata.width;
  const d = bdata.depth;

  // Main body
  const bodyGeo = new THREE.BoxGeometry(w, height, d);
  const bodyMat = makeMaterial(bdata.color);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Roof
  if (['residential', 'church', 'market', 'store', 'spa'].includes(bdata.buildingType)) {
    // Hip/pointed roof
    const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, height * 0.6, 4);
    const roofMat = makeMaterial(bdata.roofColor);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = height + (height * 0.3);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
  } else {
    // Flat roof / parapet
    const roofGeo = new THREE.BoxGeometry(w + 0.5, 0.5, d + 0.5);
    const roofMat = makeMaterial(bdata.roofColor);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = height + 0.25;
    group.add(roof);
  }

  // Church tower/steeple
  if (bdata.buildingType === 'church') {
    const towerGeo = new THREE.BoxGeometry(4, height * 0.8, 4);
    const towerMat = makeMaterial(bdata.color);
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(-w / 2 + 2, height * 0.9, 0);
    tower.castShadow = true;
    group.add(tower);

    const steepleGeo = new THREE.ConeGeometry(2.5, height * 0.7, 4);
    const steepleMat = makeMaterial(bdata.roofColor);
    const steeple = new THREE.Mesh(steepleGeo, steepleMat);
    steeple.position.set(-w / 2 + 2, height * 1.7, 0);
    steeple.rotation.y = Math.PI / 4;
    group.add(steeple);
  }

  // Windows
  const windowMat = new THREE.MeshLambertMaterial({ color: 0x87CEEB, emissive: 0x224466 });
  const winRows = Math.max(1, Math.floor(height / 4));
  const winCols = Math.max(1, Math.floor(w / 4));

  for (let row = 0; row < winRows; row++) {
    for (let col = 0; col < winCols; col++) {
      const winGeo = new THREE.BoxGeometry(1.2, 1, 0.2);
      const win = new THREE.Mesh(winGeo, windowMat);
      const wX = -w / 2 + (col + 0.8) * (w / winCols);
      const wY = (row + 1) * (height / (winRows + 1));
      win.position.set(wX, wY, d / 2 + 0.1);
      group.add(win);
    }
  }

  // Sign panel in front
  if (bdata.buildingType !== 'outdoor') {
    const signGeo = new THREE.BoxGeometry(Math.min(w * 0.7, 8), 1.5, 0.3);
    const signMat = makeMaterial(0x222222);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.5, d / 2 + 0.2);
    group.add(sign);
  }

  // Basketball court markings
  if (bdata.id === 'BASKETBALL_COURT') {
    const courtGeo = new THREE.BoxGeometry(bdata.width - 2, 0.15, bdata.depth - 2);
    const courtMat = makeMaterial(0xE8A020);
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.position.y = 0.1;
    group.add(court);

    // Hoops on each end
    for (let side of [-1, 1]) {
      const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.5, 6);
      const poleMat = makeMaterial(0x888888);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(side * (bdata.depth / 2 - 1.5), 1.75, 0);
      group.add(pole);

      const boardGeo = new THREE.BoxGeometry(0.1, 1.2, 1.8);
      const boardMat = makeMaterial(0xCCDDFF);
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.set(side * (bdata.depth / 2 - 1.5), 3.8, 0);
      group.add(board);
    }
  }

  // Beach sand
  if (bdata.id === 'BEACH') {
    const sandGeo = new THREE.BoxGeometry(bdata.width, 0.2, bdata.depth);
    const sandMat = makeMaterial(0xF5DEB3);
    const sand = new THREE.Mesh(sandGeo, sandMat);
    sand.position.y = 0.1;
    group.add(sand);
  }

  group.position.set(bdata.x, 0, bdata.z);
  scene.add(group);

  // Return a simple mesh proxy for collision
  const proxy = new THREE.Mesh(
    new THREE.BoxGeometry(w, height, d),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  proxy.position.set(bdata.x, height / 2, bdata.z);
  scene.add(proxy);

  return { group, proxy, buildingData: bdata };
}

function createJeepney(scene, x, z) {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.BoxGeometry(3, 1.8, 6);
  const bodyMat = makeMaterial(0xE74C3C);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.1;
  group.add(body);

  // Roof
  const roofGeo = new THREE.BoxGeometry(2.8, 0.3, 5);
  const roofMat = makeMaterial(0xF39C12);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 2.15;
  group.add(roof);

  // Wheels
  for (let sx of [-1.4, 1.4]) {
    for (let sz of [-2, 0, 2]) {
      const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 10);
      const wheelMat = makeMaterial(0x111111);
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(sx, 0.4, sz);
      group.add(wheel);
    }
  }

  // Decorations (colorful strips)
  for (let i = 0; i < 3; i++) {
    const stripGeo = new THREE.BoxGeometry(3.1, 0.2, 0.1);
    const colors = [0xFCD116, 0x0038A8, 0xCE1126];
    const stripMat = makeMaterial(colors[i]);
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set(0, 0.8 + i * 0.4, 3);
    group.add(strip);
  }

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

function createFountain(scene, x, z) {
  const group = new THREE.Group();

  const baseGeo = new THREE.CylinderGeometry(4, 4.5, 0.8, 16);
  const baseMat = makeMaterial(0xAAAAAA);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.4;
  group.add(base);

  const basinGeo = new THREE.CylinderGeometry(3, 3, 0.5, 16, 1, true);
  const basinMat = makeMaterial(0x888888);
  const basin = new THREE.Mesh(basinGeo, basinMat);
  basin.position.y = 0.85;
  group.add(basin);

  const waterGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.1, 16);
  const waterMat = new THREE.MeshLambertMaterial({ color: 0x29B6F6, transparent: true, opacity: 0.8 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = 1;
  group.add(water);

  const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 3, 8);
  const poleMat = makeMaterial(0x999999);
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 2.5;
  group.add(pole);

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

function createBench(scene, x, z, rotY = 0) {
  const group = new THREE.Group();

  const seatGeo = new THREE.BoxGeometry(2, 0.15, 0.5);
  const woodMat = makeMaterial(0x8B5E3C);
  const seat = new THREE.Mesh(seatGeo, woodMat);
  seat.position.y = 0.8;
  group.add(seat);

  for (let lx of [-0.7, 0.7]) {
    const legGeo = new THREE.BoxGeometry(0.1, 0.8, 0.5);
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(lx, 0.4, 0);
    group.add(leg);
  }

  const backGeo = new THREE.BoxGeometry(2, 0.5, 0.1);
  const back = new THREE.Mesh(backGeo, woodMat);
  back.position.set(0, 1.15, -0.2);
  group.add(back);

  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  scene.add(group);
  return group;
}

export function generateWorld(scene) {
  // Ground
  const groundGeo = new THREE.PlaneGeometry(400, 400);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x8BC34A });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // District zones (colored ground patches)
  const zoneData = [
    { x: -75, z: -75, w: 130, d: 130, color: 0xF5E6CA }, // NW Residential
    { x: 75, z: -75, w: 130, d: 130, color: 0xFCE4EC },  // NE Commercial
    { x: -75, z: 75, w: 130, d: 130, color: 0xC8E6C9 },  // SW Nature/Park
    { x: 75, z: 75, w: 130, d: 130, color: 0xE3F2FD },   // SE Entertainment
    { x: 0, z: 0, w: 40, d: 40, color: 0xFFF9C4 }        // Center plaza
  ];
  for (const z of zoneData) {
    const geo = new THREE.PlaneGeometry(z.w, z.d);
    const mat = new THREE.MeshLambertMaterial({ color: z.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(z.x, 0.01, z.z);
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  // Roads - main cross
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
  // Horizontal road
  const hRoadGeo = new THREE.PlaneGeometry(400, 10);
  const hRoad = new THREE.Mesh(hRoadGeo, roadMat);
  hRoad.rotation.x = -Math.PI / 2;
  hRoad.position.set(0, 0.02, 0);
  scene.add(hRoad);

  // Vertical road
  const vRoadGeo = new THREE.PlaneGeometry(10, 400);
  const vRoad = new THREE.Mesh(vRoadGeo, roadMat);
  vRoad.rotation.x = -Math.PI / 2;
  vRoad.position.set(0, 0.02, 0);
  scene.add(vRoad);

  // Secondary roads
  for (let pos of [-60, -30, 30, 60]) {
    const sr1Geo = new THREE.PlaneGeometry(400, 6);
    const sr1 = new THREE.Mesh(sr1Geo, roadMat);
    sr1.rotation.x = -Math.PI / 2;
    sr1.position.set(0, 0.015, pos);
    scene.add(sr1);

    const sr2Geo = new THREE.PlaneGeometry(6, 400);
    const sr2 = new THREE.Mesh(sr2Geo, roadMat);
    sr2.rotation.x = -Math.PI / 2;
    sr2.position.set(pos, 0.015, 0);
    scene.add(sr2);
  }

  // Road lines
  const lineMat = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
  for (let pos = -160; pos <= 160; pos += 20) {
    const lineGeo = new THREE.PlaneGeometry(8, 0.3);
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(pos, 0.025, 0);
    scene.add(line);

    const line2Geo = new THREE.PlaneGeometry(0.3, 8);
    const line2 = new THREE.Mesh(line2Geo, lineMat);
    line2.rotation.x = -Math.PI / 2;
    line2.position.set(0, 0.025, pos);
    scene.add(line2);
  }

  // Buildings
  const buildingMeshObjects = [];
  for (const bdata of BUILDINGS) {
    const result = createBuilding(scene, bdata);
    buildingMeshObjects.push(result);
  }

  // Fountain at center
  createFountain(scene, 0, 0);

  // Palm trees scattered around
  const palmPositions = [
    [-20, -20], [20, -20], [-20, 20], [20, 20],
    [-50, -50], [50, -50], [-50, 50], [50, 50],
    [-100, -100], [100, -100], [-100, 100], [100, 100],
    [-30, 90], [30, 90], [-10, 110], [10, 110],
    [-40, -90], [40, -90], [-90, 0], [90, 0],
    [-110, -30], [110, -30], [-110, 30], [110, 30],
    [5, -50], [-5, -50], [35, -60], [-35, -60],
    [120, 0], [-120, 0], [0, 120], [0, -120],
    [-70, -30], [65, 45], [-45, 80], [55, -85],
    [-85, 55], [80, 80], [-25, 70], [25, -70],
    [10, 50], [-15, 55], [40, -10], [-40, -10],
    [70, -90], [-70, 90], [90, 40], [-90, -45]
  ];
  for (const [x, z] of palmPositions) {
    createPalmTree(scene, x, z);
  }

  // Mango trees
  const mangoPositions = [
    [-60, -40], [60, -40], [-60, 40], [60, 40],
    [-30, -100], [30, -100], [-30, 100], [30, 100],
    [-100, 0], [100, 0], [0, -100], [0, 100],
    [-80, -20], [80, -20], [-80, 20], [80, 20],
    [-40, 50], [40, -50], [-50, 30], [50, -30]
  ];
  for (const [x, z] of mangoPositions) {
    createMangoTree(scene, x, z);
  }

  // Lamp posts along main roads
  for (let pos = -150; pos <= 150; pos += 20) {
    createLampPost(scene, pos, 6);
    createLampPost(scene, pos, -6);
    createLampPost(scene, 6, pos);
    createLampPost(scene, -6, pos);
  }

  // Benches in park (SW zone)
  for (let i = 0; i < 6; i++) {
    const bx = -70 + (i % 3) * 15;
    const bz = 55 + Math.floor(i / 3) * 10;
    createBench(scene, bx, bz, i % 2 === 0 ? 0 : Math.PI / 2);
  }

  // Plaza benches
  createBench(scene, -15, 15, Math.PI / 4);
  createBench(scene, 15, 15, -Math.PI / 4);
  createBench(scene, -15, -15, -Math.PI / 4);
  createBench(scene, 15, -15, Math.PI / 4);

  // Jeepney near market
  createJeepney(scene, 45, -85);

  // Beach water plane
  const waterGeo = new THREE.PlaneGeometry(80, 40);
  const waterMat = new THREE.MeshLambertMaterial({
    color: 0x0288D1,
    transparent: true,
    opacity: 0.85
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.15, 120);
  water.receiveShadow = true;
  scene.add(water);

  // Lighting
  scene.background = new THREE.Color(0x87CEEB);

  const ambientLight = new THREE.AmbientLight(0xFFF5E0, 0.7);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xFFE082, 1.2);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 500;
  sunLight.shadow.camera.left = -150;
  sunLight.shadow.camera.right = 150;
  sunLight.shadow.camera.top = 150;
  sunLight.shadow.camera.bottom = -150;
  scene.add(sunLight);

  // Point lights near some buildings
  const pointLightPositions = [
    [0, -30], [60, -70], [70, 60], [-60, 60]
  ];
  for (const [px, pz] of pointLightPositions) {
    const pl = new THREE.PointLight(0xFFDD99, 0.5, 30);
    pl.position.set(px, 5, pz);
    scene.add(pl);
  }

  return { water, buildingMeshObjects, ambientLight, sunLight };
}

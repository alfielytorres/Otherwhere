import * as THREE from 'three';

export const INTERIOR_BASE_X = 500;
export const ROOM_SPACING = 80;

function mat(color, roughness = 0.8, metalness = 0, emissive = 0, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    emissive: new THREE.Color(emissive),
    emissiveIntensity
  });
}

function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cyl(rt, rb, h, material, x = 0, y = 0, z = 0, seg = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function emissivePanel(w, h, color, x, y, z, rotY = 0) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({
      color,
      emissive: new THREE.Color(color),
      emissiveIntensity: 1.4,
      roughness: 0.3,
      side: THREE.DoubleSide
    })
  );
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  return m;
}

function buildRoom(group, W, H, D, floorColor, wallColor, ceilColor = 0x1a1a1a) {
  // Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat(floorColor, 0.9));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);
  // Ceiling
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat(ceilColor, 0.9));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = H;
  group.add(ceil);
  // Walls (North, South, East, West)
  const wallMat = mat(wallColor, 0.85);
  const wN = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
  wN.position.set(0, H / 2, -D / 2);
  wN.receiveShadow = true;
  group.add(wN);
  const wS = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat.clone());
  wS.position.set(0, H / 2, D / 2);
  wS.rotation.y = Math.PI;
  group.add(wS);
  const wE = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat.clone());
  wE.position.set(W / 2, H / 2, 0);
  wE.rotation.y = -Math.PI / 2;
  group.add(wE);
  const wW = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat.clone());
  wW.position.set(-W / 2, H / 2, 0);
  wW.rotation.y = Math.PI / 2;
  group.add(wW);
}

function addPointLight(group, color, intensity, x, y, z, distance = 12) {
  const light = new THREE.PointLight(color, intensity, distance);
  light.position.set(x, y, z);
  group.add(light);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 8),
    new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color), emissiveIntensity: 1 })
  );
  bulb.position.set(x, y, z);
  group.add(bulb);
}

// Simple dancer figure for clubs
function makeDancer(outfitColor = 0xff66aa, pose = 0) {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xc68642, roughness: 0.8 });
  const outfit = new THREE.MeshStandardMaterial({ color: outfitColor, roughness: 0.6,
    emissive: new THREE.Color(outfitColor), emissiveIntensity: 0.3 });
  // Body
  g.add(box(0.22, 0.55, 0.14, outfit, 0, 0.9, 0));
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 5), skin);
  head.position.set(0, 1.47, 0);
  g.add(head);
  // Hair
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: 0x1a0a0a }));
  hair.position.set(0, 1.53, 0);
  g.add(hair);
  // Arms raised (dancing pose)
  const armL = box(0.08, 0.32, 0.08, outfit, -0.2, 1.2, 0);
  armL.rotation.z = pose === 1 ? 0.8 : -0.5;
  g.add(armL);
  const armR = box(0.08, 0.32, 0.08, outfit, 0.2, 1.2, 0);
  armR.rotation.z = pose === 1 ? -0.5 : 0.8;
  g.add(armR);
  // Legs
  g.add(box(0.09, 0.4, 0.09, new THREE.MeshStandardMaterial({ color: 0x111111 }), -0.08, 0.42, 0));
  g.add(box(0.09, 0.4, 0.09, new THREE.MeshStandardMaterial({ color: 0x111111 }), 0.08, 0.42, 0));
  return g;
}

// Reusable furniture
function makeChair(seatColor = 0x222222) {
  const g = new THREE.Group();
  g.add(box(0.5, 0.05, 0.5, mat(seatColor, 0.8), 0, 0.5, 0));
  g.add(box(0.5, 0.5, 0.06, mat(seatColor, 0.8), 0, 0.75, -0.22));
  for (const [lx, lz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
    g.add(cyl(0.03, 0.03, 0.5, mat(0x333333), lx, 0.25, lz, 6));
  }
  return g;
}

function makeRoundTable(color = 0x5a3a1a) {
  const g = new THREE.Group();
  g.add(cyl(0.55, 0.55, 0.06, mat(color, 0.6), 0, 0.8, 0));
  g.add(cyl(0.06, 0.1, 0.8, mat(0x222222), 0, 0.4, 0, 8));
  return g;
}

function makeStool(color = 0x222222) {
  const g = new THREE.Group();
  g.add(cyl(0.22, 0.22, 0.08, mat(color, 0.6), 0, 0.75, 0));
  g.add(cyl(0.05, 0.05, 0.75, mat(0x444444, 0.4, 0.5), 0, 0.37, 0, 8));
  return g;
}

// === Interior builders. Each returns { interactionZones } in LOCAL coordinates ===

function buildHome(group, W, H, D) {
  buildRoom(group, W, H, D, 0x8B6914, 0xF5F0E8, 0x2a2a2a);

  // L-shaped sofa
  const sofa = new THREE.Group();
  sofa.add(box(4, 0.5, 1.2, mat(0x3a3a40), 0, 0.25, 0));
  sofa.add(box(4, 0.7, 0.3, mat(0x3a3a40), 0, 0.6, -0.45));
  sofa.add(box(1.2, 0.5, 2.5, mat(0x3a3a40), -1.4, 0.25, 1.2));
  sofa.add(box(0.3, 0.7, 2.5, mat(0x3a3a40), -2.0, 0.6, 1.2));
  sofa.position.set(2, 0, 2);
  group.add(sofa);
  // Glass coffee table
  group.add(box(1.8, 0.05, 0.9, new THREE.MeshStandardMaterial({ color: 0xaadfff, transparent: true, opacity: 0.4, roughness: 0.1 }), 2, 0.45, 3.5));
  group.add(cyl(0.03, 0.03, 0.45, mat(0x888888, 0.3, 0.7), 1.2, 0.22, 3.5, 8));
  group.add(cyl(0.03, 0.03, 0.45, mat(0x888888, 0.3, 0.7), 2.8, 0.22, 3.5, 8));
  // TV on stand
  group.add(box(2.2, 0.5, 0.5, mat(0x2a2a2a), 2, 0.25, 6));
  group.add(box(2.6, 0.1, 0.1, mat(0x111111), 2, 1.4, 6.2));
  const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.35, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x1133aa, emissive: new THREE.Color(0x2255cc), emissiveIntensity: 0.8 }));
  tvScreen.position.set(2, 1.2, 6.1);
  group.add(tvScreen);
  // Wall art
  group.add(box(1.2, 0.9, 0.05, mat(0xaa7744), 2, 2.3, 6.4));

  // Kitchen along left wall (-X)
  group.add(box(1, 0.9, 6, mat(0xe8e8e8, 0.4), -W / 2 + 0.6, 0.45, -3));
  group.add(box(1.05, 0.08, 6, mat(0xd0d0d8, 0.3, 0.3), -W / 2 + 0.6, 0.92, -3)); // marble top
  // Stove burners
  group.add(box(0.9, 0.05, 0.9, mat(0x222222), -W / 2 + 0.6, 0.95, -5));
  for (const [bx, bz] of [[-0.2, -5.2], [0.2, -5.2], [-0.2, -4.8], [0.2, -4.8]]) {
    group.add(cyl(0.12, 0.12, 0.02, mat(0x111111, 0.4, 0.5), -W / 2 + 0.6 + bx, 0.98, bz, 10));
  }
  // Fridge
  group.add(box(1, 2, 1, mat(0xcccccc, 0.3, 0.4), -W / 2 + 0.6, 1, -1));
  // Sink
  group.add(box(0.7, 0.1, 0.5, mat(0x999999, 0.2, 0.6), -W / 2 + 0.6, 0.96, -3));

  // Bedroom area (north -Z, right side)
  group.add(box(2.4, 0.4, 3, mat(0x5a3a1a), 5, 0.2, -5.5)); // bed base
  group.add(box(2.3, 0.25, 2.9, mat(0xf5f5f5, 0.9), 5, 0.5, -5.5)); // sheets
  group.add(box(2.4, 1, 0.2, mat(0x5a3a1a), 5, 0.8, -7)); // headboard
  group.add(box(0.7, 0.1, 0.4, mat(0xffffff, 0.9), 5, 0.7, -6.4)); // pillow
  group.add(box(0.6, 0.6, 0.6, mat(0x6a4a2a), 6.6, 0.3, -6.8)); // bedside table
  group.add(box(1.5, 1.2, 0.6, mat(0x6a4a2a), 7.5, 0.6, -3)); // dresser

  // Bathroom cubicle (corner -X,-Z)
  group.add(box(0.1, H, 3, mat(0xddeeff, 0.3), -W / 2 + 3, H / 2, -D / 2 + 1.5)); // glass partition
  group.add(box(1, 0.05, 1, mat(0xccccdd, 0.3), -W / 2 + 1.5, 0.05, -D / 2 + 1)); // shower tile
  group.add(box(0.5, 0.8, 0.5, mat(0xffffff, 0.4), -W / 2 + 3.5, 0.4, -D / 2 + 0.8)); // toilet

  // Indoor plant
  group.add(cyl(0.25, 0.2, 0.5, mat(0xbb5522, 0.9), -2, 0.25, 6, 8));
  group.add(cyl(0.05, 0.6, 1.2, mat(0x2e7d32, 0.85), -2, 1.1, 6, 8));

  // Ceiling light
  addPointLight(group, 0xfff0d0, 1.5, 0, H - 0.4, 0, 20);
  addPointLight(group, 0xfff0d0, 0.8, -4, H - 0.4, -3, 12);

  return {
    interactionZones: [
      { x: 5, z: -5.5, radius: 2.5, activityKeys: ['SLEEP'], label: 'Matulog' },
      { x: -W / 2 + 1.6, z: -5, radius: 2.5, activityKeys: ['COOK'], label: 'Magluto' },
      { x: -W / 2 + 1.5, z: -D / 2 + 1, radius: 2.2, activityKeys: ['SHOWER'], label: 'Maligo' },
      { x: 2, z: 4.5, radius: 2.6, activityKeys: ['WATCH_TV'], label: 'Manood ng TV' },
      { x: 6.6, z: -3, radius: 2.2, activityKeys: ['READ'], label: 'Magbasa' }
    ]
  };
}

function buildBar(group, W, H, D) {
  buildRoom(group, W, H, D, 0x1a0a0a, 0x3a2010, 0x0a0505);

  // Bar counter along back wall (-Z)
  group.add(box(W - 3, 1.1, 1, mat(0x2a1505, 0.5), 0, 0.55, -D / 2 + 1));
  group.add(box(W - 3, 0.1, 1, mat(0x3a2010, 0.3, 0.3), 0, 1.15, -D / 2 + 1));
  // Backlit bottle shelf
  group.add(emissivePanel(W - 4, 2, 0xffaa44, 0, 2.2, -D / 2 + 0.15));
  for (let i = 0; i < 8; i++) {
    group.add(cyl(0.08, 0.1, 0.5, mat(0x336644, 0.2, 0.4), -3.5 + i, 1.6, -D / 2 + 0.5, 6));
  }
  // Bar stools (6)
  for (let i = 0; i < 6; i++) {
    const s = makeStool(0x441111);
    s.position.set(-3 + i * 1.2, 0, -D / 2 + 2.2);
    group.add(s);
  }

  // Small round tables with stools
  for (const [tx, tz] of [[-4, 2], [0, 3], [4, 2], [-3, 4]]) {
    const t = makeRoundTable(0x3a1a0a);
    t.position.set(tx, 0, tz);
    group.add(t);
    for (const off of [[-0.9, 0], [0.9, 0]]) {
      const s = makeStool(0x441111);
      s.position.set(tx + off[0], 0, tz + off[1]);
      group.add(s);
    }
  }

  // Stage with pole (front, +Z)
  group.add(box(4, 0.3, 2.5, mat(0x2a0a2a), 0, 0.15, D / 2 - 2));
  group.add(cyl(0.06, 0.06, H - 0.3, mat(0xccccaa, 0.2, 0.8), 0, (H - 0.3) / 2 + 0.3, D / 2 - 2, 10));

  // Neon signs
  group.add(emissivePanel(2.5, 0.7, 0xff0044, -W / 2 + 1.5, H - 1, -D / 2 + 0.1));
  group.add(emissivePanel(2, 0.6, 0xff66aa, W / 2 - 1.5, H - 1, -D / 2 + 0.1));

  // Lighting - red/pink atmosphere
  addPointLight(group, 0xff3366, 1.0, -3, H - 0.5, 0, 12);
  addPointLight(group, 0xff66aa, 0.9, 3, H - 0.5, 2, 12);
  addPointLight(group, 0xff0044, 0.8, 0, H - 0.5, D / 2 - 2, 10);

  return {
    interactionZones: [
      { x: 0, z: -D / 2 + 2.5, radius: 2.6, activityKeys: ['DRINK', 'SOCIALIZE'], label: 'Uminom' },
      { x: 0, z: D / 2 - 2, radius: 2.6, activityKeys: ['SING', 'WATCH_SHOW'], label: 'Kumanta / Manood' }
    ]
  };
}

function buildSevenEleven(group, W, H, D) {
  buildRoom(group, W, H, D, 0xeeeeee, 0xffffff, 0xf5f5f5);
  group.add(box(W, 0.4, 0.05, mat(0x00aa44, 0.6), 0, 2, -D / 2 + 0.1)); // green stripe

  // Refrigerator units along back wall (glowing)
  for (let i = 0; i < 3; i++) {
    group.add(box(2.2, 2.4, 0.8, mat(0x223344, 0.2, 0.3), -3.5 + i * 3, 1.2, -D / 2 + 0.6));
    const glow = new THREE.Mesh(new THREE.BoxGeometry(2, 2.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xcceeff, emissive: new THREE.Color(0x88bbff), emissiveIntensity: 0.7 }));
    glow.position.set(-3.5 + i * 3, 1.2, -D / 2 + 1.05);
    group.add(glow);
  }

  // Shelving units with products
  const prodColors = [0xff4422, 0xffcc00, 0x2244ff, 0x22cc44, 0xff8800, 0xcc22aa];
  for (let r = 0; r < 3; r++) {
    group.add(box(0.6, 2, 3, mat(0xdddddd, 0.5), -3 + r * 3, 1, 1));
    for (let s = 0; s < 4; s++) {
      for (let p = 0; p < 3; p++) {
        group.add(box(0.4, 0.3, 0.3, mat(prodColors[(r + s + p) % prodColors.length], 0.6),
          -3 + r * 3, 0.5 + s * 0.5, -0.2 + p));
      }
    }
  }

  // Counter with register (front)
  group.add(box(3, 1, 0.9, mat(0x555555, 0.6), -3, 0.5, D / 2 - 1.5));
  group.add(box(0.5, 0.3, 0.4, mat(0x222222), -3, 1.15, D / 2 - 1.5)); // register

  // Slurpee machine
  group.add(box(1, 1.6, 0.8, mat(0xcccccc, 0.4), 3, 0.8, D / 2 - 1.5));
  group.add(cyl(0.3, 0.3, 0.8, mat(0xff8800, 0.3, 0.2, 0xff8800, 0.4), 2.7, 1.5, D / 2 - 1.5, 10));
  group.add(cyl(0.3, 0.3, 0.8, mat(0x8822cc, 0.3, 0.2, 0x8822cc, 0.4), 3.3, 1.5, D / 2 - 1.5, 10));

  // Bright fluorescent lighting
  addPointLight(group, 0xffffff, 1.6, -3, H - 0.3, 0, 18);
  addPointLight(group, 0xffffff, 1.6, 3, H - 0.3, 0, 18);

  return {
    interactionZones: [
      { x: 0, z: 1, radius: 3.5, activityKeys: ['BUY_DRINKS', 'BUY_SNACKS', 'BUY_CIGARETTE'], label: 'Bumili' }
    ]
  };
}

function buildOffice(group, W, H, D) {
  buildRoom(group, W, H, D, 0x888888, 0x2a3a4a, 0xcccccc);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xaaddee, transparent: true, opacity: 0.25, roughness: 0.1, metalness: 0.3 });
  group.add(box(0.1, H, D, glassMat, W / 2 - 0.2, H / 2, 0));
  group.add(box(0.1, H, D, glassMat, -W / 2 + 0.2, H / 2, 0));

  // Desks in 2 rows
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const dx = -6 + col * 4;
      const dz = -1 + row * 4;
      group.add(box(2, 0.06, 1.2, mat(0x6a4a2a, 0.5), dx, 0.72, dz));
      for (const [lx, lz] of [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]]) {
        group.add(cyl(0.04, 0.04, 0.72, mat(0x333333), dx + lx, 0.36, dz + lz, 6));
      }
      group.add(box(0.7, 0.5, 0.05, mat(0x111111), dx, 1.1, dz - 0.3));
      const scr = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.44, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x113366, emissive: new THREE.Color(0x2255aa), emissiveIntensity: 0.7 }));
      scr.position.set(dx, 1.1, dz - 0.27);
      group.add(scr);
      const chair = makeChair(0x222244);
      chair.position.set(dx, 0, dz + 0.9);
      group.add(chair);
    }
  }

  // Reception desk (front)
  group.add(box(4, 1.1, 1, mat(0x445566, 0.5), 0, 0.55, D / 2 - 1.5));
  group.add(box(4, 0.08, 1, mat(0x223344, 0.3, 0.3), 0, 1.15, D / 2 - 1.5));

  // Meeting room (back)
  group.add(box(6, H, 0.1, glassMat.clone(), 0, H / 2, -D / 2 + 4));
  group.add(box(0.1, H, 4, glassMat.clone(), -3, H / 2, -D / 2 + 2));
  group.add(box(0.1, H, 4, glassMat.clone(), 3, H / 2, -D / 2 + 2));
  group.add(box(3, 0.1, 1.5, mat(0x3a2a1a, 0.4), 0, 0.75, -D / 2 + 2));
  for (const cz of [-D / 2 + 1.2, -D / 2 + 2.8]) {
    const c1 = makeChair(0x222222); c1.position.set(-1, 0, cz); group.add(c1);
    const c2 = makeChair(0x222222); c2.position.set(1, 0, cz); group.add(c2);
  }
  group.add(emissivePanel(3, 1, 0x2299ff, 0, H - 1.2, -D / 2 + 0.1)); // logo

  addPointLight(group, 0xffffff, 1.4, -4, H - 0.3, 0, 18);
  addPointLight(group, 0xffffff, 1.4, 4, H - 0.3, 0, 18);
  addPointLight(group, 0xffffff, 1.0, 0, H - 0.3, -D / 2 + 2, 14);

  return {
    interactionZones: [
      { x: 0, z: 1, radius: 4, activityKeys: ['WORK', 'BROWSE_INTERNET'], label: 'Magtrabaho' },
      { x: 0, z: -D / 2 + 2, radius: 3, activityKeys: ['REPORT_TO_BOSS'], label: 'Mag-ulat sa Boss' }
    ]
  };
}

function buildMall(group, W, H, D) {
  buildRoom(group, W, H, D, 0xE8E0D0, 0xffffff, 0xf0f0f0);
  const atrium = new THREE.Mesh(new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0xddeeff), emissiveIntensity: 0.6 }));
  atrium.rotation.x = Math.PI / 2;
  atrium.position.set(0, H - 0.05, 0);
  group.add(atrium);

  // Shop stalls on sides
  const awnings = [0xff4444, 0x44aaff, 0xffaa00, 0x44cc88];
  const stallPos = [[-W / 2 + 2, -5], [-W / 2 + 2, 5], [W / 2 - 2, -5], [W / 2 - 2, 5]];
  for (let i = 0; i < 4; i++) {
    const [sx, sz] = stallPos[i];
    group.add(box(3, 2.5, 3, mat(0xdddddd, 0.6), sx, 1.25, sz));
    group.add(box(3.4, 0.2, 1.2, mat(awnings[i], 0.7), sx + (sx < 0 ? 1.8 : -1.8), 2.4, sz));
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 2.6),
      new THREE.MeshStandardMaterial({ color: 0xaaddff, transparent: true, opacity: 0.4, emissive: new THREE.Color(0x224466), emissiveIntensity: 0.3 }));
    win.position.set(sx + (sx < 0 ? 1.5 : -1.5), 1.3, sz);
    group.add(win);
  }

  // Food court tables (center)
  for (const [tx, tz] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) {
    const t = makeRoundTable(0x999999);
    t.position.set(tx, 0, tz);
    group.add(t);
    for (const off of [[-0.8, 0], [0.8, 0]]) {
      const c = makeChair(0x884422);
      c.position.set(tx + off[0], 0, tz + off[1]);
      group.add(c);
    }
  }

  // Central planter/fountain
  group.add(cyl(1.5, 1.6, 0.6, mat(0xbbbbbb, 0.6), 0, 0.3, 0, 16));
  group.add(cyl(0.2, 0.6, 1, mat(0x2e7d32, 0.85), 0, 1.1, 0, 8));

  addPointLight(group, 0xffffff, 1.4, 0, H - 0.5, 0, 26);
  addPointLight(group, 0xffffff, 0.9, -7, H - 0.5, 0, 16);
  addPointLight(group, 0xffffff, 0.9, 7, H - 0.5, 0, 16);

  return {
    interactionZones: [
      { x: -W / 2 + 3.5, z: -5, radius: 3, activityKeys: ['SHOP'], label: 'Mamili' },
      { x: 0, z: 2, radius: 3.5, activityKeys: ['EAT_FOOD_COURT'], label: 'Kumain sa Food Court' },
      { x: W / 2 - 3.5, z: 5, radius: 3, activityKeys: ['AIRCON_BREAK'], label: 'Magpahinga sa Aircon' }
    ]
  };
}

function buildChurch(group, W, H, D) {
  buildRoom(group, W, H, D, 0xBBB0A0, 0xE8E0D0, 0xd8d0c0);

  // Altar at back (-Z)
  group.add(box(8, 0.4, 3, mat(0xd4c5a0, 0.7), 0, 0.2, -D / 2 + 2));
  group.add(box(3, 0.1, 1.2, mat(0xeee0c0, 0.6), 0, 1.3, -D / 2 + 2));
  group.add(box(3, 1.2, 0.1, mat(0xfaf0e0, 0.7), 0, 0.7, -D / 2 + 2.6));
  // Cross (brass)
  group.add(box(0.3, 3, 0.2, mat(0xB8860B, 0.5, 0.5), 0, 3, -D / 2 + 0.3));
  group.add(box(1.8, 0.3, 0.2, mat(0xB8860B, 0.5, 0.5), 0, 3.7, -D / 2 + 0.3));

  // Pews (6 each side)
  for (let row = 0; row < 6; row++) {
    for (const side of [-1, 1]) {
      const pew = new THREE.Group();
      pew.add(box(3, 0.1, 0.6, mat(0x8B6914, 0.7), 0, 0.55, 0));
      pew.add(box(3, 0.5, 0.08, mat(0x8B6914, 0.7), 0, 0.8, -0.26));
      pew.add(box(0.1, 0.55, 0.6, mat(0x6a4a0a), -1.4, 0.27, 0));
      pew.add(box(0.1, 0.55, 0.6, mat(0x6a4a0a), 1.4, 0.27, 0));
      pew.position.set(side * 3.5, 0, -4 + row * 2.2);
      group.add(pew);
    }
  }

  // Stained glass windows (emissive)
  const glassColors = [0x2266ff, 0xff3333, 0xffdd00, 0x22cc66];
  for (let i = 0; i < 4; i++) {
    const c = glassColors[i % glassColors.length];
    group.add(emissivePanel(1.4, 3, c, -W / 2 + 0.1, 4, -4 + i * 3, Math.PI / 2));
    group.add(emissivePanel(1.4, 3, c, W / 2 - 0.1, 4, -4 + i * 3, -Math.PI / 2));
  }

  // Candle stands on sides
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      group.add(cyl(0.05, 0.05, 0.4, mat(0xfffacd, 0.8), side * 5, 1.2, -3 + i * 0.4, 6));
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 6),
        new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: new THREE.Color(0xff5500), emissiveIntensity: 1.2 }));
      flame.position.set(side * 5, 1.5, -3 + i * 0.4);
      group.add(flame);
    }
    addPointLight(group, 0xffaa44, 0.4, side * 5, 1.6, -2, 6);
  }

  // Soft warm ambient
  addPointLight(group, 0xfff0d0, 1.0, 0, H - 1, 0, 22);
  addPointLight(group, 0xffe0b0, 0.7, 0, H - 1, -D / 2 + 3, 14);

  return {
    interactionZones: [
      { x: 0, z: -D / 2 + 5, radius: 3.5, activityKeys: ['ATTEND_MASS', 'PRAY'], label: 'Magsimba / Manalangin' },
      { x: -5, z: -2.5, radius: 2.5, activityKeys: ['LIGHT_CANDLE'], label: 'Mag-ilaw ng Kandila' }
    ]
  };
}

function buildRestaurant(group, W, H, D) {
  buildRoom(group, W, H, D, 0xC8B89A, 0xddaa55, 0xeeeeee);

  // Turo-turo steam table at back
  group.add(box(7, 1, 1.2, mat(0x8B4513, 0.6), 0, 0.5, -D / 2 + 1.2));
  const glassCase = new THREE.Mesh(new THREE.BoxGeometry(7, 0.7, 1),
    new THREE.MeshStandardMaterial({ color: 0xcceeff, transparent: true, opacity: 0.4, roughness: 0.1 }));
  glassCase.position.set(0, 1.4, -D / 2 + 1.2);
  group.add(glassCase);
  const foodColors = [0xcc6622, 0x884422, 0x44aa33, 0xddaa44, 0xaa3322];
  for (let i = 0; i < 5; i++) {
    group.add(box(1.1, 0.25, 0.7, mat(0xcccccc, 0.4, 0.5), -2.8 + i * 1.4, 1.1, -D / 2 + 1.2));
    group.add(box(1, 0.1, 0.6, mat(foodColors[i], 0.7), -2.8 + i * 1.4, 1.25, -D / 2 + 1.2));
  }

  // Round tables with plastic chairs
  for (const [tx, tz] of [[-3.5, 0], [3.5, 0], [-3.5, 3.5], [3.5, 3.5]]) {
    const t = makeRoundTable(0xaa8866);
    t.position.set(tx, 0, tz);
    group.add(t);
    for (const off of [[-0.85, 0, 0], [0.85, 0, Math.PI], [0, -0.85, Math.PI / 2], [0, 0.85, -Math.PI / 2]]) {
      const c = makeChair(0xcc4422);
      c.position.set(tx + off[0], 0, tz + off[1]);
      c.rotation.y = off[2];
      group.add(c);
    }
    group.add(cyl(0.2, 0.2, 0.02, mat(0xffffff, 0.4), tx, 0.84, tz, 12)); // plate
  }

  // Ceiling fan
  const fan = new THREE.Group();
  fan.add(cyl(0.15, 0.15, 0.3, mat(0x444444), 0, 0, 0, 8));
  for (let i = 0; i < 4; i++) {
    const bg = new THREE.Group();
    bg.add(box(1.6, 0.04, 0.3, mat(0x6a4a2a), 0.8, 0, 0));
    bg.rotation.y = (i / 4) * Math.PI * 2;
    fan.add(bg);
  }
  fan.position.set(0, H - 0.4, 1.5);
  group.add(fan);

  group.add(emissivePanel(4, 1.5, 0xff8800, 0, H - 1.2, -D / 2 + 0.1)); // menu board

  addPointLight(group, 0xfff0d0, 1.4, 0, H - 0.5, 0, 18);
  addPointLight(group, 0xffe0b0, 0.9, 0, H - 0.5, -D / 2 + 2, 12);

  return {
    interactionZones: [
      { x: 0, z: -D / 2 + 2.5, radius: 3, activityKeys: ['EAT_ADOBO', 'EAT_SINIGANG', 'EAT_LECHON'], label: 'Kumain' }
    ]
  };
}

function buildInternetCafe(group, W, H, D) {
  buildRoom(group, W, H, D, 0x111111, 0x151520, 0x0a0a10);
  // RGB LED strips on walls
  const rgb = [0xff0033, 0x00ff66, 0x0066ff];
  for (let i = 0; i < 3; i++) {
    group.add(emissivePanel(D, 0.15, rgb[i], -W / 2 + 0.1, 1 + i * 0.8, 0, Math.PI / 2));
    group.add(emissivePanel(D, 0.15, rgb[i], W / 2 - 0.1, 1 + i * 0.8, 0, -Math.PI / 2));
    group.add(emissivePanel(W, 0.15, rgb[i], 0, 1 + i * 0.8, -D / 2 + 0.1));
  }

  // Gaming stations - 3 rows
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const dx = -3.5 + col * 3.5;
      const dz = -3 + row * 2.5;
      group.add(box(1.4, 0.06, 0.9, mat(0x1a1a1a, 0.5), dx, 0.72, dz));
      group.add(box(0.8, 0.5, 0.05, mat(0x000000), dx, 1.1, dz - 0.3));
      const scr = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.44, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x2266ff, emissive: new THREE.Color(0x3399ff), emissiveIntensity: 0.9 }));
      scr.position.set(dx, 1.1, dz - 0.27);
      group.add(scr);
      const chair = makeChair(0x330033);
      chair.position.set(dx, 0, dz + 0.7);
      group.add(chair);
    }
  }

  // Snack counter (front)
  group.add(box(3, 1, 0.8, mat(0x222222, 0.5), -3, 0.5, D / 2 - 1.2));
  group.add(box(2.6, 0.4, 0.6, mat(0xff8800, 0.6), -3, 1.2, D / 2 - 1.2));

  // RGB overhead strip
  group.add(emissivePanel(W - 2, 0.2, 0xff00ff, 0, H - 0.1, -1));
  addPointLight(group, 0x3366ff, 0.8, 0, H - 0.5, -1, 16);
  addPointLight(group, 0xff0066, 0.5, -4, H - 0.5, 2, 12);
  addPointLight(group, 0x00ff66, 0.5, 4, H - 0.5, 2, 12);

  return {
    interactionZones: [
      { x: 0, z: -1, radius: 4, activityKeys: ['PLAY_GAMES', 'BROWSE_INTERNET'], label: 'Maglaro' },
      { x: -3, z: D / 2 - 2, radius: 2.5, activityKeys: ['BUY_SNACKS'], label: 'Bumili ng Meryenda' }
    ]
  };
}

function buildGym(group, W, H, D) {
  buildRoom(group, W, H, D, 0x111111, 0x222228, 0x1a1a1a);
  // Mirrored front wall (+Z)
  group.add(box(W - 2, 3.5, 0.1, mat(0x8899AA, 0.05, 0.9), 0, 2, D / 2 - 0.1));

  // Treadmills (back wall)
  for (let i = 0; i < 4; i++) {
    const tm = new THREE.Group();
    tm.add(box(0.8, 0.25, 1.8, mat(0x111111, 0.6), 0, 0.12, 0));
    tm.add(box(0.7, 0.05, 1.6, mat(0x222222, 0.5), 0, 0.28, 0));
    tm.add(box(0.6, 0.05, 0.05, mat(0x888888, 0.3, 0.6), 0, 1.1, -0.7));
    const scr = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x113311, emissive: new THREE.Color(0x22aa44), emissiveIntensity: 0.6 }));
    scr.position.set(0, 1.3, -0.7);
    tm.add(scr);
    tm.position.set(-5.5 + i * 2, 0, -D / 2 + 1.5);
    group.add(tm);
  }

  // Bench press stations
  for (const bx of [-3, 3]) {
    group.add(box(0.5, 0.5, 1.6, mat(0x222222, 0.6), bx, 0.5, 0));
    group.add(box(0.5, 0.5, 0.5, mat(0x222222, 0.6), bx, 0.65, -0.85));
    const bar = cyl(0.03, 0.03, 2.2, mat(0x888888, 0.3, 0.7), bx, 1.4, 0, 8);
    bar.rotation.z = Math.PI / 2;
    group.add(bar);
    for (const s of [-1, 1]) {
      const w = cyl(0.25, 0.25, 0.1, mat(0x111111, 0.7), bx + s * 0.95, 1.4, 0, 12);
      w.rotation.z = Math.PI / 2;
      group.add(w);
    }
  }

  // Dumbbell rack (left wall)
  group.add(box(3, 0.8, 0.6, mat(0x333333, 0.6), -W / 2 + 1.5, 0.5, 4));
  for (let i = 0; i < 5; i++) {
    const db = new THREE.Group();
    const dbBar = cyl(0.03, 0.03, 0.35, mat(0x555555), 0, 0, 0, 8);
    dbBar.rotation.z = Math.PI / 2;
    db.add(dbBar);
    for (const s of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.SphereGeometry(0.08 + i * 0.015, 8, 8), mat(0x111111));
      w.position.x = s * 0.2;
      db.add(w);
    }
    db.position.set(-W / 2 + 0.5 + i * 0.5, 0.95, 4);
    group.add(db);
  }

  // Cable machine + punching bag (right wall)
  group.add(box(0.5, 3, 0.5, mat(0x333333, 0.6), W / 2 - 1, 1.5, 3));
  group.add(cyl(0.3, 0.3, 1.4, mat(0x661111, 0.7), W / 2 - 1.5, 1.5, -3, 12)); // punching bag

  addPointLight(group, 0xffffff, 1.5, -3, H - 0.3, 0, 18);
  addPointLight(group, 0xffffff, 1.5, 3, H - 0.3, 0, 18);

  return {
    interactionZones: [
      { x: -3, z: 0, radius: 3, activityKeys: ['EXERCISE'], label: 'Mag-ehersisyo' },
      { x: 3, z: 0, radius: 3, activityKeys: ['TRAIN'], label: 'Mag-ensayo' }
    ]
  };
}

function buildKaraoke(group, W, H, D) {
  buildRoom(group, W, H, D, 0x1a001a, 0x12001a, 0x0a000a);
  // Disco floor tiles
  const tileC = [0xff0066, 0x6600ff, 0x00ccff, 0xffcc00];
  for (let x = 0; x < 4; x++) {
    for (let z = 0; z < 4; z++) {
      group.add(box(1.2, 0.02, 1.2, mat(tileC[(x + z) % 4], 0.4, 0.2, tileC[(x + z) % 4], 0.3), -2.5 + x * 1.6, 0.02, -2.5 + z * 1.6));
    }
  }

  // Big TV (back wall)
  group.add(box(4, 2.4, 0.1, mat(0x000000), 0, 2, -D / 2 + 0.15));
  const tv = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.2, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x113366, emissive: new THREE.Color(0x3366cc), emissiveIntensity: 0.9 }));
  tv.position.set(0, 2, -D / 2 + 0.2);
  group.add(tv);

  // Curved sofa (red) along sides
  for (const side of [-1, 1]) {
    group.add(box(0.9, 0.6, 5, mat(0xcc1122, 0.7), side * (W / 2 - 0.8), 0.3, 1));
    group.add(box(0.9, 0.8, 0.3, mat(0xaa0011, 0.7), side * (W / 2 - 0.8), 0.7, -1.4));
  }

  // Central table with bottles
  group.add(cyl(0.7, 0.7, 0.5, mat(0x222222, 0.4, 0.3), 0, 0.45, 2, 12));
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2;
    group.add(cyl(0.07, 0.09, 0.4, mat(0x224422, 0.2, 0.4), Math.cos(ang) * 0.3, 0.9, 2 + Math.sin(ang) * 0.3, 6));
  }

  // Mic stands
  for (const mx of [-1, 1]) {
    group.add(cyl(0.03, 0.03, 1.4, mat(0x888888, 0.3, 0.6), mx, 0.7, 0, 8));
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), mat(0x333333));
    head.position.set(mx, 1.4, 0);
    group.add(head);
  }

  // Disco ball
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), mat(0xcccccc, 0.1, 0.9, 0x888888, 0.4));
  ball.position.set(0, H - 0.5, 0);
  group.add(ball);

  // Colored lights — boosted
  addPointLight(group, 0xff0099, 2.0, -2, H - 1, 0, 16);
  addPointLight(group, 0x6600ff, 2.0, 2, H - 1, 0, 16);
  addPointLight(group, 0x0099ff, 1.5, 0, H - 1, 2, 14);

  // Dancers on the disco floor
  const dancerPivotA = new THREE.Group();
  dancerPivotA.position.set(-2, 0, -1);
  dancerPivotA.add(makeDancer(0xff00ff, 0));
  group.add(dancerPivotA);

  const dancerPivotB = new THREE.Group();
  dancerPivotB.position.set(2, 0, -1);
  dancerPivotB.rotation.y = Math.PI;
  dancerPivotB.add(makeDancer(0x00ffff, 1));
  group.add(dancerPivotB);

  return {
    dancers: [dancerPivotA, dancerPivotB],
    interactionZones: [
      { x: 0, z: -1, radius: 3, activityKeys: ['SING'], label: 'Kumanta' },
      { x: 0, z: 2.5, radius: 2.5, activityKeys: ['DRINK', 'SOCIALIZE'], label: 'Uminom' }
    ]
  };
}

function buildSpa(group, W, H, D) {
  buildRoom(group, W, H, D, 0xD4A860, 0x2d5a3d, 0x1d3a2d);

  // Massage tables
  for (let i = 0; i < 3; i++) {
    const tx = -3.5 + i * 3.5;
    group.add(box(0.95, 0.4, 2.2, mat(0x6a4a2a, 0.6), tx, 0.2, 0));
    group.add(box(0.9, 0.15, 2.1, mat(0xfaf8f0, 0.8), tx, 0.47, 0));
    group.add(box(0.5, 0.1, 0.35, mat(0xffffff, 0.8), tx, 0.6, -0.85)); // pillow
    if (i < 2) {
      const curtain = new THREE.Mesh(new THREE.PlaneGeometry(2.5, H - 0.5),
        new THREE.MeshStandardMaterial({ color: 0x3a6a4a, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
      curtain.position.set(tx + 1.75, (H - 0.5) / 2, 0);
      group.add(curtain);
    }
  }

  // Plants
  for (const px of [-W / 2 + 1, W / 2 - 1]) {
    group.add(cyl(0.25, 0.2, 0.5, mat(0xbb5522, 0.9), px, 0.25, D / 2 - 1.5, 8));
    group.add(cyl(0.05, 0.6, 1.2, mat(0x2e7d32, 0.85), px, 1.1, D / 2 - 1.5, 8));
  }

  // Candles
  for (const cx of [-2, 0, 2]) {
    group.add(cyl(0.06, 0.06, 0.2, mat(0xffddaa, 0.6, 0, 0xff8844, 0.6), cx, 0.6, D / 2 - 1, 6));
  }

  // Reception desk (front)
  group.add(box(3, 1, 0.8, mat(0x6a4a2a, 0.5), 0, 0.5, D / 2 - 1.5));

  addPointLight(group, 0xffcc88, 1.0, 0, H - 0.5, 0, 18);
  addPointLight(group, 0xffbb77, 0.6, 0, H - 0.5, D / 2 - 2, 10);

  return {
    interactionZones: [
      { x: 0, z: 0, radius: 4, activityKeys: ['GET_HILOT', 'REST'], label: 'Magpa-hilot' }
    ]
  };
}

function buildPalengke(group, W, H, D) {
  buildRoom(group, W, H, D, 0x888888, 0x4a3a2a, 0x2a2018);

  // Market stalls in rows
  const awn = [0xff4422, 0x44aaff, 0xffcc00];
  for (let r = 0; r < 3; r++) {
    const sx = -7 + r * 7;
    group.add(box(0.2, 2.5, 6, mat(0x6a4a2a, 0.7), sx - 2.5, 1.25, 0));
    group.add(box(0.2, 2.5, 6, mat(0x6a4a2a, 0.7), sx + 2.5, 1.25, 0));
    group.add(box(5.2, 0.2, 6, mat(awn[r], 0.7), sx, 2.6, 0)); // awning
    const veg = [0x44aa33, 0xff6622, 0xaa3322, 0xddaa44];
    for (let i = 0; i < 4; i++) {
      group.add(box(0.9, 0.4, 0.9, mat(veg[i], 0.7), sx - 1.5 + (i % 2) * 1.5, 0.95, -1.5 + Math.floor(i / 2) * 1.5));
    }
    group.add(box(4.5, 0.9, 1, mat(0x5a3a1a, 0.7), sx, 0.45, 1.5)); // table
  }

  // Hanging meat
  for (let i = 0; i < 5; i++) {
    group.add(cyl(0.12, 0.12, 0.8, mat(0x882222, 0.7), -4 + i * 2, H - 1, -D / 2 + 1.5, 8));
  }

  // Butcher counter at back
  group.add(box(W - 4, 1, 1.2, mat(0x999999, 0.5), 0, 0.5, -D / 2 + 1));

  // Hanging bare bulbs
  for (const bx of [-6, 0, 6]) {
    addPointLight(group, 0xffeebb, 1.1, bx, H - 0.8, 0, 14);
  }

  return {
    interactionZones: [
      { x: 0, z: 1.5, radius: 4, activityKeys: ['BUY_GROCERIES', 'BUY_SNACKS'], label: 'Mamili ng Pagkain' }
    ]
  };
}

function buildSariSari(group, W, H, D) {
  buildRoom(group, W, H, D, 0xD4C4A8, 0x6a5a3a, 0x3a3020);

  // Counter with window (front)
  group.add(box(W - 1, 1.1, 0.6, mat(0x6a4a2a, 0.6), 0, 0.55, D / 2 - 1));
  const winGlass = new THREE.Mesh(new THREE.BoxGeometry(W - 3, 1, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xaaddff, transparent: true, opacity: 0.3, roughness: 0.1 }));
  winGlass.position.set(0, 1.7, D / 2 - 1);
  group.add(winGlass);

  // Shelves packed with products
  const prods = [0xff4422, 0xffcc00, 0x2244ff, 0x22cc44, 0xff8800, 0xcc22aa];
  for (let s = 0; s < 4; s++) {
    group.add(box(W - 2, 0.06, 0.5, mat(0x5a4a2a, 0.6), 0, 0.6 + s * 0.7, -D / 2 + 0.5));
    for (let p = 0; p < 6; p++) {
      group.add(box(0.4, 0.4, 0.3, mat(prods[(s + p) % prods.length], 0.6), -2.5 + p, 0.85 + s * 0.7, -D / 2 + 0.5));
    }
  }

  // Hanging sachets
  for (let i = 0; i < 6; i++) {
    group.add(box(0.15, 0.5, 0.05, mat(0xffaa22, 0.6), -2 + i * 0.8, H - 1, 0));
  }

  // Fridge with drinks
  group.add(box(1.2, 2, 0.8, mat(0x223344, 0.3), W / 2 - 1, 1, -1));
  const fridgeGlow = new THREE.Mesh(new THREE.BoxGeometry(1, 1.8, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xcceeff, emissive: new THREE.Color(0x88bbff), emissiveIntensity: 0.6 }));
  fridgeGlow.position.set(W / 2 - 1, 1, -0.6);
  group.add(fridgeGlow);

  addPointLight(group, 0xffeecc, 1.3, 0, H - 0.3, 0, 14);

  return {
    interactionZones: [
      { x: 0, z: D / 2 - 2, radius: 3, activityKeys: ['BUY_DRINKS', 'BUY_SNACKS', 'CHISMIS'], label: 'Bumili' }
    ]
  };
}

function buildGirlieBar(group, W, H, D) {
  buildRoom(group, W, H, D, 0x050505, 0x1a0005, 0x0a0005);

  // Raised stage with pole (front)
  group.add(box(5, 0.3, 3, mat(0x1a0010, 0.5), 0, 0.15, D / 2 - 2.5));
  group.add(cyl(0.06, 0.06, H - 0.3, mat(0xccccaa, 0.2, 0.8), 0, (H - 0.3) / 2 + 0.3, D / 2 - 2.5, 10));
  group.add(cyl(0.06, 0.06, H - 0.3, mat(0xccccaa, 0.2, 0.8), -1.5, (H - 0.3) / 2 + 0.3, D / 2 - 2, 10));

  // Bar counter with backlit shelves (back)
  group.add(box(W - 4, 1.1, 1, mat(0x1a0a05, 0.4), 0, 0.55, -D / 2 + 1));
  group.add(box(W - 4, 0.1, 1, mat(0x2a1505, 0.3, 0.3), 0, 1.15, -D / 2 + 1));
  group.add(emissivePanel(W - 5, 2.2, 0xffaa44, 0, 2.3, -D / 2 + 0.15));
  for (let i = 0; i < 10; i++) {
    group.add(cyl(0.07, 0.09, 0.5, mat(0x224422, 0.2, 0.4), -4.5 + i, 1.6, -D / 2 + 0.5, 6));
  }

  // Leather booths on sides
  for (const side of [-1, 1]) {
    group.add(box(1.2, 0.6, 4, mat(0x2a0a0a, 0.5), side * (W / 2 - 0.9), 0.3, 0));
    group.add(box(1.2, 0.9, 0.3, mat(0x1a0505, 0.5), side * (W / 2 - 0.9), 0.75, -2.2));
    const t = makeRoundTable(0x1a0a0a);
    t.position.set(side * (W / 2 - 2.2), 0, 0);
    group.add(t);
  }

  // Scattered small tables
  for (const [tx, tz] of [[-2, 2], [2, 2]]) {
    const t = makeRoundTable(0x1a0a0a);
    t.position.set(tx, 0, tz);
    group.add(t);
    for (const off of [[-0.8, 0], [0.8, 0]]) {
      const s = makeStool(0x330000);
      s.position.set(tx + off[0], 0, tz + off[1]);
      group.add(s);
    }
  }

  // Neon signs
  group.add(emissivePanel(2.5, 0.8, 0xff0099, -W / 2 + 1.8, H - 1, -D / 2 + 0.1));
  group.add(emissivePanel(2.5, 0.8, 0x00aaff, W / 2 - 1.8, H - 1, -D / 2 + 0.1));

  // Red/pink/purple lighting — boosted
  addPointLight(group, 0xff0066, 2.5, -4, H - 0.5, 0, 18);
  addPointLight(group, 0xcc00ff, 2.0, 4, H - 0.5, 0, 18);
  addPointLight(group, 0xff3399, 2.5, 0, H - 1, D / 2 - 2.5, 16);
  addPointLight(group, 0xff6600, 1.5, 0, H - 0.5, -D / 2 + 2, 14);

  // Pole dancer 1 — orbits the center pole
  const pivot1 = new THREE.Group();
  pivot1.position.set(0, 0.3, D / 2 - 2.5);
  const d1 = makeDancer(0xff44aa, 0);
  d1.position.set(0.6, 0, 0);
  pivot1.add(d1);
  group.add(pivot1);

  // Dancer 2 on second pole — opposite rotation phase
  const pivot2 = new THREE.Group();
  pivot2.position.set(-1.5, 0.3, D / 2 - 2);
  pivot2.rotation.y = Math.PI; // start opposite
  const d2 = makeDancer(0xffaadd, 1);
  d2.position.set(0.5, 0, 0);
  pivot2.add(d2);
  group.add(pivot2);

  return {
    dancers: [pivot1, pivot2],
    interactionZones: [
      { x: 0, z: D / 2 - 4, radius: 3.5, activityKeys: ['WATCH_SHOW', 'DRINK', 'SOCIALIZE'], label: 'Uminom at Manood' },
      { x: W / 2 - 2.2, z: 0, radius: 2.8, activityKeys: ['VIP_ROOM'], label: 'VIP Room' }
    ]
  };
}

function buildCasino(group, W, H, D) {
  buildRoom(group, W, H, D, 0x1a1400, 0x2a2010, 0x100c00);

  // Mahjong tables
  for (const [tx, tz] of [[-4, -3], [0, -3], [4, -3]]) {
    group.add(box(1.6, 0.9, 1.6, mat(0x223322, 0.7), tx, 0.45, tz));
    group.add(box(1.7, 0.08, 1.7, mat(0x115522, 0.6), tx, 0.92, tz));
    for (let i = 0; i < 8; i++) {
      group.add(box(0.12, 0.1, 0.18, mat(0xeeeecc, 0.6), tx - 0.6 + (i % 4) * 0.4, 1.0, tz - 0.3 + Math.floor(i / 4) * 0.6));
    }
    for (const off of [[-1.1, 0], [1.1, 0], [0, -1.1], [0, 1.1]]) {
      const s = makeStool(0x332200);
      s.position.set(tx + off[0], 0, tz + off[1]);
      group.add(s);
    }
  }

  // Card tables (round, green felt)
  for (const [tx, tz] of [[-3, 3], [3, 3]]) {
    group.add(cyl(1, 1, 0.9, mat(0x115522, 0.7), tx, 0.45, tz, 16));
    group.add(cyl(1.05, 1.05, 0.06, mat(0x0a4418, 0.8), tx, 0.92, tz, 16));
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2;
      const s = makeStool(0x332200);
      s.position.set(tx + Math.cos(ang) * 1.4, 0, tz + Math.sin(ang) * 1.4);
      group.add(s);
    }
  }

  // Bar on one side
  group.add(box(1, 1.1, 5, mat(0x2a1a05, 0.5), -W / 2 + 1, 0.55, 0));
  group.add(emissivePanel(4, 1.5, 0xffaa00, -W / 2 + 0.15, 2, 0, Math.PI / 2));

  // Security booth
  group.add(box(1.5, 2.2, 1.5, mat(0x111111, 0.6), W / 2 - 1.2, 1.1, D / 2 - 1.5));

  // Amber dim lighting
  addPointLight(group, 0xffaa44, 0.9, -3, H - 0.5, -3, 14);
  addPointLight(group, 0xffaa44, 0.9, 3, H - 0.5, -3, 14);
  addPointLight(group, 0xffbb55, 0.8, 0, H - 0.5, 3, 14);

  return {
    interactionZones: [
      { x: 0, z: -3, radius: 4, activityKeys: ['GAMBLE'], label: 'Magsugal' },
      { x: -W / 2 + 2.2, z: 0, radius: 2.8, activityKeys: ['DRINK'], label: 'Uminom' }
    ]
  };
}

function buildPawnshop(group, W, H, D) {
  buildRoom(group, W, H, D, 0xC8C0B0, 0x3a3a2a, 0x2a2a1a);

  const caseMat = new THREE.MeshStandardMaterial({ color: 0xcceeff, transparent: true, opacity: 0.35, roughness: 0.1 });
  for (const cx of [-2, 0, 2]) {
    group.add(box(1.6, 0.9, 0.7, mat(0x4a4a3a, 0.5), cx, 0.45, -D / 2 + 1));
    group.add(box(1.6, 0.5, 0.7, caseMat, cx, 1.15, -D / 2 + 1));
    group.add(box(0.3, 0.2, 0.2, mat(0xffdd44, 0.2, 0.8), cx - 0.3, 1.0, -D / 2 + 1)); // gold
    group.add(box(0.4, 0.3, 0.05, mat(0x222222, 0.3), cx + 0.3, 1.0, -D / 2 + 1)); // phone
  }

  // Bulletproof glass counter (front)
  group.add(box(W - 1, 1.1, 0.6, mat(0x5a5a4a, 0.5), 0, 0.55, 0));
  const bpGlass = new THREE.Mesh(new THREE.BoxGeometry(W - 1, 1.4, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xbbddee, transparent: true, opacity: 0.3, roughness: 0.05 }));
  bpGlass.position.set(0, 1.8, 0);
  group.add(bpGlass);

  // Items on display shelf
  group.add(box(W - 2, 0.06, 0.4, mat(0x4a4a3a, 0.6), 0, 1.8, -D / 2 + 0.4));
  const itemCols = [0x222222, 0xaa8844, 0x445566, 0x886622];
  for (let i = 0; i < 4; i++) {
    group.add(box(0.5, 0.35, 0.3, mat(itemCols[i], 0.4), -1.5 + i, 2.0, -D / 2 + 0.4));
  }

  // Safe in corner
  group.add(box(1, 1.2, 1, mat(0x222222, 0.6, 0.3), W / 2 - 1, 0.6, D / 2 - 1));
  group.add(cyl(0.15, 0.15, 0.1, mat(0x888888, 0.3, 0.7), W / 2 - 1, 1.2, D / 2 - 0.5, 12));

  addPointLight(group, 0xffeecc, 1.3, 0, H - 0.3, 0, 14);

  return {
    interactionZones: [
      { x: 0, z: D / 2 - 2, radius: 3, activityKeys: ['PAWN_ITEM', 'BUY_CONTRABAND'], label: 'Magsangla' }
    ]
  };
}

function buildSketchyMassage(group, W, H, D) {
  buildRoom(group, W, H, D, 0x3a1a2a, 0x2a0a1a, 0x1a050f);

  // Reception desk
  group.add(box(3, 1, 0.8, mat(0x4a1a2a, 0.5), 0, 0.5, D / 2 - 1.5));

  // 3 private rooms with curtains
  for (let i = 0; i < 3; i++) {
    const rx = -3 + i * 3;
    group.add(box(0.1, H - 0.5, 4, mat(0x3a0a1a, 0.7), rx - 1.3, (H - 0.5) / 2, -1));
    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(2.4, H - 0.5),
      new THREE.MeshStandardMaterial({ color: 0xcc4488, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
    curtain.position.set(rx, (H - 0.5) / 2, 1);
    group.add(curtain);
    group.add(box(0.8, 0.4, 1.8, mat(0x5a2a3a, 0.6), rx, 0.2, -1.5));
    group.add(box(0.75, 0.12, 1.7, mat(0xddaacc, 0.7), rx, 0.46, -1.5));
  }

  // Soft pink lighting
  addPointLight(group, 0xff5599, 1.0, 0, H - 0.5, 0, 16);
  addPointLight(group, 0xff88bb, 0.6, 0, H - 0.5, D / 2 - 2, 10);

  return {
    interactionZones: [
      { x: 0, z: D / 2 - 2.5, radius: 3.5, activityKeys: ['GET_SPECIAL_MASSAGE', 'REST'], label: 'Masahe' }
    ]
  };
}

// Map building id -> { builder, W, H, D }
function getInteriorSpec(b) {
  switch (b.id) {
    case 'HOME': return { builder: buildHome, W: 18, H: 3.2, D: 16 };
    case 'POBLACION_BAR': return { builder: buildBar, W: 14, H: 3, D: 12 };
    case 'SEVEN_ELEVEN': return { builder: buildSevenEleven, W: 12, H: 3, D: 10 };
    case 'BGC_TOWER': return { builder: buildOffice, W: 20, H: 3.5, D: 18 };
    case 'MALL': return { builder: buildMall, W: 24, H: 5, D: 20 };
    case 'CHURCH': return { builder: buildChurch, W: 14, H: 6, D: 20 };
    case 'RESTAURANT': return { builder: buildRestaurant, W: 14, H: 3, D: 12 };
    case 'INTERNET_CAFE': return { builder: buildInternetCafe, W: 14, H: 3, D: 12 };
    case 'GYM': return { builder: buildGym, W: 18, H: 4, D: 14 };
    case 'KARAOKE': return { builder: buildKaraoke, W: 12, H: 3, D: 10 };
    case 'HILOT_SPA': return { builder: buildSpa, W: 14, H: 3, D: 12 };
    case 'PALENGKE': return { builder: buildPalengke, W: 24, H: 4, D: 18 };
    case 'SARI_SARI': return { builder: buildSariSari, W: 10, H: 3, D: 8 };
    case 'BURGOS_BAR': return { builder: buildGirlieBar, W: 16, H: 3, D: 14 };
    case 'UNDERGROUND_CASINO': return { builder: buildCasino, W: 18, H: 3, D: 16 };
    case 'PAWNSHOP': return { builder: buildPawnshop, W: 10, H: 3, D: 8 };
    case 'SKETCHY_MASSAGE': return { builder: buildSketchyMassage, W: 12, H: 3, D: 10 };
    default: return null;
  }
}

/**
 * Build all building interiors as 3D rooms placed at world X = INTERIOR_BASE_X + n*ROOM_SPACING.
 * Returns a Map<buildingId, interiorData>.
 */
export function createInteriors(scene, buildings) {
  const interiors = new Map();
  let index = 0;

  for (const b of buildings) {
    if (b.isOutdoor) continue; // outdoor buildings have no interior
    const spec = getInteriorSpec(b);
    if (!spec) continue;

    const offsetX = INTERIOR_BASE_X + index * ROOM_SPACING;
    index++;

    const group = new THREE.Group();
    group.position.set(offsetX, 0, 0);
    group.visible = false; // hidden until player enters

    const result = spec.builder(group, spec.W, spec.H, spec.D);
    scene.add(group);

    const { W, D } = spec;

    // Convert local zones to world space
    const interactionZones = (result.interactionZones || []).map(z => ({
      x: offsetX + z.x,
      y: 0,
      z: z.z,
      radius: z.radius || 2.5,
      activityKeys: z.activityKeys,
      label: z.label
    }));

    interiors.set(b.id, {
      buildingId: b.id,
      offsetX,
      group,
      entryPoint: { x: offsetX, y: 0, z: D / 2 - 1.5 },
      interactionZones,
      bounds: {
        minX: offsetX - W / 2 + 0.6,
        maxX: offsetX + W / 2 - 0.6,
        minZ: -D / 2 + 0.6,
        maxZ: D / 2 - 0.6
      }
    });
  }

  return interiors;
}

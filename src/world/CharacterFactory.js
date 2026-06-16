import * as THREE from 'three';

const SKIN_TONES  = [0xC68642, 0xAB7442, 0x8D5524, 0xD4A574, 0xE8B89A, 0xF1C27D];
const SHIRT_COLORS = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12, 0x9B59B6, 0xFF5722, 0x00BCD4, 0xFF9800, 0xE91E63, 0x1ABC9C, 0xFFFFFF, 0xCCCCCC];
const DRESS_COLORS = [0xFF69B4, 0xFF1493, 0xE91E63, 0x9C27B0, 0x673AB7, 0xFF5722, 0xF06292, 0xCE93D8, 0xFFCDD2, 0xA5D6A7, 0x80DEEA, 0xFFF176];
const PANTS_COLORS = [0x1A237E, 0x37474F, 0x212121, 0x4A148C, 0x1B5E20, 0x3E2723, 0x263238];
const HAIR_COLORS  = [0x1A1A1A, 0x2C1810, 0x3D2B1F, 0x0a0a0a, 0x5C3317, 0x4a2c0a];

function mat(color, roughness = 0.72, metalness = 0, emissive = 0, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness,
    emissive: new THREE.Color(emissive), emissiveIntensity });
}

function s(mesh) { mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }
function mk(geo, m) { return s(new THREE.Mesh(geo, m)); }

// ─── Male ────────────────────────────────────────────────────────────────────
function buildMale(skinColor, shirtColor, pantsColor, hairColor = 0x1A1A1A) {
  const g = new THREE.Group();
  const SKIN = mat(skinColor, 0.84);
  const TOP  = mat(shirtColor, 0.76);
  const BOT  = mat(pantsColor, 0.80);
  const HAIR = mat(hairColor, 0.88);
  const EYE  = mat(0x111111, 0.95);
  const SHOE = mat(0x0d0d0d, 0.55, 0.1);

  // Head
  const head = mk(new THREE.SphereGeometry(0.14, 10, 8), SKIN.clone());
  head.scale.set(1.0, 0.93, 1.0); // slightly squarish jaw
  head.position.y = 1.67;
  g.add(head);

  // Short hair — tight skullcap visible from above
  const hair = mk(new THREE.SphereGeometry(0.148, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.50), HAIR);
  hair.position.y = 1.74;
  g.add(hair);

  // Eyes
  const eyeG = new THREE.SphereGeometry(0.022, 5, 5);
  const lEye = mk(eyeG, EYE); lEye.position.set(-0.058, 1.67, 0.12); g.add(lEye);
  const rEye = mk(eyeG, EYE); rEye.position.set( 0.058, 1.67, 0.12); g.add(rEye);

  // Neck
  g.add(Object.assign(mk(new THREE.CylinderGeometry(0.056, 0.062, 0.1, 8), SKIN.clone()), {position: new THREE.Vector3(0, 1.51, 0)}));
  const neck = mk(new THREE.CylinderGeometry(0.056, 0.062, 0.1, 8), SKIN.clone());
  neck.position.y = 1.51; g.add(neck);

  // Torso — V-shape: wide shoulders (0.26), narrow waist (0.16)
  const torso = mk(new THREE.CylinderGeometry(0.26, 0.16, 0.56, 8), TOP.clone());
  torso.position.y = 1.1; g.add(torso);

  // Upper arms (named for walk animation)
  const uArmG = new THREE.CapsuleGeometry(0.065, 0.28, 3, 8);
  const lArm = mk(uArmG, TOP.clone()); lArm.name = 'lArm'; lArm.position.set(-0.32, 1.18, 0); lArm.rotation.z =  0.1; g.add(lArm);
  const rArm = mk(uArmG, TOP.clone()); rArm.name = 'rArm'; rArm.position.set( 0.32, 1.18, 0); rArm.rotation.z = -0.1; g.add(rArm);

  // Forearms
  const fArmG = new THREE.CapsuleGeometry(0.05, 0.24, 3, 8);
  const lFA = mk(fArmG, SKIN.clone()); lFA.position.set(-0.34, 0.87, 0); g.add(lFA);
  const rFA = mk(fArmG, SKIN.clone()); rFA.position.set( 0.34, 0.87, 0); g.add(rFA);

  // Hips — narrower than shoulders
  const hips = mk(new THREE.CylinderGeometry(0.155, 0.145, 0.15, 8), BOT.clone());
  hips.position.y = 0.74; g.add(hips);

  // Thighs (named for walk animation)
  const thG = new THREE.CapsuleGeometry(0.082, 0.30, 3, 8);
  const lLeg = mk(thG, BOT.clone()); lLeg.name = 'lLeg'; lLeg.position.set(-0.115, 0.49, 0); g.add(lLeg);
  const rLeg = mk(thG, BOT.clone()); rLeg.name = 'rLeg'; rLeg.position.set( 0.115, 0.49, 0); g.add(rLeg);

  // Calves
  const caG = new THREE.CapsuleGeometry(0.058, 0.27, 3, 8);
  const lCa = mk(caG, BOT.clone()); lCa.position.set(-0.115, 0.19, 0); g.add(lCa);
  const rCa = mk(caG, BOT.clone()); rCa.position.set( 0.115, 0.19, 0); g.add(rCa);

  // Shoes
  const shG = new THREE.BoxGeometry(0.11, 0.065, 0.18);
  const lSh = mk(shG, SHOE.clone()); lSh.position.set(-0.115, 0.033, 0.035); g.add(lSh);
  const rSh = mk(shG, SHOE.clone()); rSh.position.set( 0.115, 0.033, 0.035); g.add(rSh);

  return g;
}

// ─── Female ──────────────────────────────────────────────────────────────────
function buildFemale(skinColor, dressColor, hairColor = 0x1A1A1A) {
  const g = new THREE.Group();
  const SKIN  = mat(skinColor, 0.82);
  const DRESS = mat(dressColor, 0.72);
  const HAIR  = mat(hairColor, 0.86);
  const EYE   = mat(0x111111, 0.95);
  const SHOE  = mat(0xCC3377, 0.50, 0.05);

  // Head — rounder, slightly smaller
  const head = mk(new THREE.SphereGeometry(0.13, 10, 8), SKIN.clone());
  head.scale.set(1.02, 1.0, 1.02);
  head.position.y = 1.65;
  g.add(head);

  // Long full hair — large sphere that extends below head (clearly visible from above)
  const hairBody = mk(
    new THREE.SphereGeometry(0.175, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.78),
    HAIR
  );
  hairBody.position.y = 1.61;
  g.add(hairBody);
  // Hair top
  const hairTop = mk(
    new THREE.SphereGeometry(0.138, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.50),
    HAIR
  );
  hairTop.position.y = 1.71;
  g.add(hairTop);

  // Eyes — slightly larger
  const eyeG = new THREE.SphereGeometry(0.024, 6, 6);
  const lEye = mk(eyeG, EYE); lEye.position.set(-0.05, 1.655, 0.116); g.add(lEye);
  const rEye = mk(eyeG, EYE); rEye.position.set( 0.05, 1.655, 0.116); g.add(rEye);

  // Neck — slender
  const neck = mk(new THREE.CylinderGeometry(0.044, 0.050, 0.1, 8), SKIN.clone());
  neck.position.y = 1.49; g.add(neck);

  // Shoulders + chest (narrow)
  const shoulders = mk(new THREE.CylinderGeometry(0.165, 0.13, 0.22, 8), DRESS.clone());
  shoulders.position.y = 1.28; g.add(shoulders);

  // Bust — two spheres (clearly visible from front/side)
  const bustG = new THREE.SphereGeometry(0.085, 8, 8);
  const lBust = mk(bustG, DRESS.clone()); lBust.position.set(-0.08, 1.19, 0.09); g.add(lBust);
  const rBust = mk(bustG, DRESS.clone()); rBust.position.set( 0.08, 1.19, 0.09); g.add(rBust);

  // Upper arms — slim
  const uArmG = new THREE.CapsuleGeometry(0.046, 0.26, 3, 8);
  const lArm = mk(uArmG, SKIN.clone()); lArm.name = 'lArm'; lArm.position.set(-0.225, 1.19, 0); lArm.rotation.z =  0.15; g.add(lArm);
  const rArm = mk(uArmG, SKIN.clone()); rArm.name = 'rArm'; rArm.position.set( 0.225, 1.19, 0); rArm.rotation.z = -0.15; g.add(rArm);

  // Forearms
  const fArmG = new THREE.CapsuleGeometry(0.038, 0.22, 3, 8);
  const lFA = mk(fArmG, SKIN.clone()); lFA.position.set(-0.245, 0.88, 0); g.add(lFA);
  const rFA = mk(fArmG, SKIN.clone()); rFA.position.set( 0.245, 0.88, 0); g.add(rFA);

  // Waist — narrow
  const waist = mk(new THREE.CylinderGeometry(0.12, 0.13, 0.18, 8), DRESS.clone());
  waist.position.y = 1.01; g.add(waist);

  // Flared dress/skirt — wide at hem, narrower at waist (clearly female silhouette)
  const skirt = mk(new THREE.CylinderGeometry(0.13, 0.32, 0.72, 10), DRESS.clone());
  skirt.position.y = 0.66; g.add(skirt);

  // Legs visible below skirt hem (named for walk animation)
  const legG = new THREE.CapsuleGeometry(0.055, 0.22, 3, 8);
  const lLeg = mk(legG, SKIN.clone()); lLeg.name = 'lLeg'; lLeg.position.set(-0.09, 0.22, 0); g.add(lLeg);
  const rLeg = mk(legG, SKIN.clone()); rLeg.name = 'rLeg'; rLeg.position.set( 0.09, 0.22, 0); g.add(rLeg);

  // Heeled shoes
  const shG = new THREE.BoxGeometry(0.09, 0.055, 0.14);
  const lSh = mk(shG, SHOE.clone()); lSh.position.set(-0.09, 0.027, 0.02); g.add(lSh);
  const rSh = mk(shG, SHOE.clone()); rSh.position.set( 0.09, 0.027, 0.02); g.add(rSh);

  return g;
}

// ─── Public API ──────────────────────────────────────────────────────────────
export function createPlayer(name = 'Juan') {
  const group = buildMale(0xC68642, 0xFFFAF0, 0x1A237E, 0x1A1A1A);
  group.name = `player_${name}`;
  return group;
}

export function createNPC(name) {
  const skin  = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
  const hair  = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
  const isFem = Math.random() < 0.5;

  let group;
  if (isFem) {
    const dress = DRESS_COLORS[Math.floor(Math.random() * DRESS_COLORS.length)];
    group = buildFemale(skin, dress, hair);
  } else {
    const shirt = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
    const pants = PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)];
    group = buildMale(skin, shirt, pants, hair);
  }
  group.name = `npc_${name}`;

  // Blob shadow
  const blobM = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 });
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.32, 10), blobM);
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.01;
  group.add(blob);

  return group;
}

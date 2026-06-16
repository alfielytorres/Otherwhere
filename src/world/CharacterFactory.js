import * as THREE from 'three';

const SKIN_TONES  = [0xC68642, 0xAB7442, 0x8D5524, 0xD4A574, 0xE8B89A, 0xF1C27D];
const SHIRT_COLORS = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12, 0x9B59B6, 0xFF5722, 0x00BCD4, 0xFF9800, 0xE91E63, 0x1ABC9C, 0xFFFFFF, 0xCCCCCC];
const PANTS_COLORS = [0x1A237E, 0x37474F, 0x212121, 0x4A148C, 0x1B5E20, 0x3E2723, 0x263238, 0x4E342E];
const HAIR_COLORS  = [0x1A1A1A, 0x2C1810, 0x3D2B1F, 0x0a0a0a];

function mat(color, roughness = 0.72, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function _shadow(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function buildMale(skinColor, shirtColor, pantsColor, hairColor = 0x1A1A1A) {
  const group = new THREE.Group();
  const SKIN  = mat(skinColor, 0.85);
  const SHIRT = mat(shirtColor, 0.78);
  const PANTS = mat(pantsColor, 0.82);
  const HAIR  = mat(hairColor, 0.9);
  const EYE   = mat(0x111111, 0.95);
  const SHOE  = mat(0x111111, 0.6, 0.1);

  // Head (slightly rectangular jaw for masculine look)
  const head = _shadow(new THREE.Mesh(new THREE.SphereGeometry(0.135, 10, 8), SKIN.clone()));
  head.scale.set(1, 0.95, 1);
  head.position.y = 1.66;
  group.add(head);

  // Short hair (skullcap)
  const hair = _shadow(new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.52),
    HAIR
  ));
  hair.position.y = 1.72;
  group.add(hair);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.022, 5, 5);
  const lEye = _shadow(new THREE.Mesh(eyeGeo, EYE));
  lEye.position.set(-0.055, 1.665, 0.118);
  group.add(lEye);
  const rEye = _shadow(new THREE.Mesh(eyeGeo, EYE));
  rEye.position.set(0.055, 1.665, 0.118);
  group.add(rEye);

  // Neck
  const neck = _shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.1, 8), SKIN.clone()));
  neck.position.y = 1.5;
  group.add(neck);

  // Torso — broad shoulders, narrower waist (tapered top-heavy)
  const torsoTop = _shadow(new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.17, 0.54, 8), SHIRT.clone()
  ));
  torsoTop.position.y = 1.1;
  group.add(torsoTop);

  // Upper arms (named for walk animation)
  const uArmGeo = new THREE.CapsuleGeometry(0.06, 0.28, 3, 8);
  const lArm = _shadow(new THREE.Mesh(uArmGeo, SHIRT.clone()));
  lArm.name = 'lArm';
  lArm.position.set(-0.28, 1.18, 0);
  lArm.rotation.z = 0.12;
  group.add(lArm);
  const rArm = _shadow(new THREE.Mesh(uArmGeo, SHIRT.clone()));
  rArm.name = 'rArm';
  rArm.position.set(0.28, 1.18, 0);
  rArm.rotation.z = -0.12;
  group.add(rArm);

  // Forearms
  const fArmGeo = new THREE.CapsuleGeometry(0.048, 0.24, 3, 8);
  const lFA = _shadow(new THREE.Mesh(fArmGeo, SKIN.clone())); lFA.position.set(-0.31, 0.88, 0); group.add(lFA);
  const rFA = _shadow(new THREE.Mesh(fArmGeo, SKIN.clone())); rFA.position.set(0.31, 0.88, 0);  group.add(rFA);

  // Hips — narrower than torso top
  const hips = _shadow(new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.14, 0.14, 8), PANTS.clone()
  ));
  hips.position.y = 0.73;
  group.add(hips);

  // Thighs (named for walk animation)
  const thighGeo = new THREE.CapsuleGeometry(0.08, 0.3, 3, 8);
  const lLeg = _shadow(new THREE.Mesh(thighGeo, PANTS.clone()));
  lLeg.name = 'lLeg';
  lLeg.position.set(-0.11, 0.5, 0);
  group.add(lLeg);
  const rLeg = _shadow(new THREE.Mesh(thighGeo, PANTS.clone()));
  rLeg.name = 'rLeg';
  rLeg.position.set(0.11, 0.5, 0);
  group.add(rLeg);

  // Calves
  const calfGeo = new THREE.CapsuleGeometry(0.057, 0.28, 3, 8);
  const lCa = _shadow(new THREE.Mesh(calfGeo, PANTS.clone())); lCa.position.set(-0.11, 0.2, 0); group.add(lCa);
  const rCa = _shadow(new THREE.Mesh(calfGeo, PANTS.clone())); rCa.position.set(0.11, 0.2, 0);  group.add(rCa);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.11, 0.065, 0.18);
  const lSh = _shadow(new THREE.Mesh(shoeGeo, SHOE.clone())); lSh.position.set(-0.11, 0.032, 0.035); group.add(lSh);
  const rSh = _shadow(new THREE.Mesh(shoeGeo, SHOE.clone())); rSh.position.set(0.11, 0.032, 0.035);  group.add(rSh);

  return group;
}

function buildFemale(skinColor, shirtColor, pantsColor, hairColor = 0x1A1A1A) {
  const group = new THREE.Group();
  const SKIN  = mat(skinColor, 0.82);
  const SHIRT = mat(shirtColor, 0.75);
  const PANTS = mat(pantsColor, 0.80);
  const HAIR  = mat(hairColor, 0.88);
  const EYE   = mat(0x111111, 0.95);
  const SHOE  = mat(0x1a1a1a, 0.55, 0.05);

  // Head — softer, slightly rounder
  const head = _shadow(new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), SKIN.clone()));
  head.scale.set(1.02, 1, 1.02);
  head.position.y = 1.64;
  group.add(head);

  // Long hair (fuller sphere extending below head)
  const hairBack = _shadow(new THREE.Mesh(
    new THREE.SphereGeometry(0.145, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.78),
    HAIR
  ));
  hairBack.position.y = 1.65;
  group.add(hairBack);
  // Hair top
  const hairTop = _shadow(new THREE.Mesh(
    new THREE.SphereGeometry(0.137, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.50),
    HAIR
  ));
  hairTop.position.y = 1.72;
  group.add(hairTop);

  // Eyes (slightly larger)
  const eyeGeo = new THREE.SphereGeometry(0.024, 6, 6);
  const lEye = _shadow(new THREE.Mesh(eyeGeo, EYE)); lEye.position.set(-0.048, 1.648, 0.114); group.add(lEye);
  const rEye = _shadow(new THREE.Mesh(eyeGeo, EYE)); rEye.position.set(0.048, 1.648, 0.114);  group.add(rEye);

  // Neck — slender
  const neck = _shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.052, 0.1, 8), SKIN.clone()));
  neck.position.y = 1.49;
  group.add(neck);

  // Chest / bust area — narrower top shoulder width, wider mid
  const shoulderArea = _shadow(new THREE.Mesh(
    new THREE.CylinderGeometry(0.175, 0.16, 0.18, 8), SHIRT.clone()
  ));
  shoulderArea.position.y = 1.28;
  group.add(shoulderArea);

  // Bust — two spheres
  const bustGeo = new THREE.SphereGeometry(0.072, 8, 8);
  const lBust = _shadow(new THREE.Mesh(bustGeo, SHIRT.clone()));
  lBust.position.set(-0.075, 1.19, 0.1);
  group.add(lBust);
  const rBust = _shadow(new THREE.Mesh(bustGeo, SHIRT.clone()));
  rBust.position.set(0.075, 1.19, 0.1);
  group.add(rBust);

  // Waist — narrower
  const waist = _shadow(new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.155, 0.32, 8), SHIRT.clone()
  ));
  waist.position.y = 0.98;
  group.add(waist);

  // Upper arms — slimmer
  const uArmGeo = new THREE.CapsuleGeometry(0.05, 0.26, 3, 8);
  const lArm = _shadow(new THREE.Mesh(uArmGeo, SHIRT.clone()));
  lArm.name = 'lArm';
  lArm.position.set(-0.235, 1.2, 0);
  lArm.rotation.z = 0.14;
  group.add(lArm);
  const rArm = _shadow(new THREE.Mesh(uArmGeo, SHIRT.clone()));
  rArm.name = 'rArm';
  rArm.position.set(0.235, 1.2, 0);
  rArm.rotation.z = -0.14;
  group.add(rArm);

  // Forearms
  const fArmGeo = new THREE.CapsuleGeometry(0.04, 0.22, 3, 8);
  const lFA = _shadow(new THREE.Mesh(fArmGeo, SKIN.clone())); lFA.position.set(-0.26, 0.89, 0); group.add(lFA);
  const rFA = _shadow(new THREE.Mesh(fArmGeo, SKIN.clone())); rFA.position.set(0.26, 0.89, 0);  group.add(rFA);

  // Hips — wider than waist (hourglass)
  const hips = _shadow(new THREE.Mesh(
    new THREE.CylinderGeometry(0.185, 0.17, 0.18, 8), PANTS.clone()
  ));
  hips.position.y = 0.73;
  group.add(hips);

  // Butt — slightly prominent
  const buttGeo = new THREE.SphereGeometry(0.13, 8, 8);
  const butt = _shadow(new THREE.Mesh(buttGeo, PANTS.clone()));
  butt.scale.set(1.3, 0.85, 0.9);
  butt.position.set(0, 0.72, -0.06);
  group.add(butt);

  // Thighs — fuller (named for walk animation)
  const thighGeo = new THREE.CapsuleGeometry(0.085, 0.3, 3, 8);
  const lLeg = _shadow(new THREE.Mesh(thighGeo, PANTS.clone()));
  lLeg.name = 'lLeg';
  lLeg.position.set(-0.1, 0.49, 0);
  group.add(lLeg);
  const rLeg = _shadow(new THREE.Mesh(thighGeo, PANTS.clone()));
  rLeg.name = 'rLeg';
  rLeg.position.set(0.1, 0.49, 0);
  group.add(rLeg);

  // Calves — tapered
  const calfGeo = new THREE.CapsuleGeometry(0.055, 0.27, 3, 8);
  const lCa = _shadow(new THREE.Mesh(calfGeo, PANTS.clone())); lCa.position.set(-0.1, 0.19, 0); group.add(lCa);
  const rCa = _shadow(new THREE.Mesh(calfGeo, PANTS.clone())); rCa.position.set(0.1, 0.19, 0);  group.add(rCa);

  // Shoes — smaller, slight heel shape
  const shoeGeo = new THREE.BoxGeometry(0.09, 0.058, 0.155);
  const lSh = _shadow(new THREE.Mesh(shoeGeo, SHOE.clone())); lSh.position.set(-0.1, 0.029, 0.028); group.add(lSh);
  const rSh = _shadow(new THREE.Mesh(shoeGeo, SHOE.clone())); rSh.position.set(0.1, 0.029, 0.028);  group.add(rSh);

  return group;
}

export function createPlayer(name = 'Juan') {
  // Player is male by default
  const group = buildMale(0xC68642, 0xFFFAF0, 0x1A237E, 0x1A1A1A);
  group.name = `player_${name}`;
  return group;
}

export function createNPC(name) {
  const skinColor  = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
  const shirtColor = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
  const pantsColor = PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)];
  const hairColor  = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];

  // Roughly half female, half male NPCs
  const isFemale = Math.random() < 0.5;
  const group = isFemale
    ? buildFemale(skinColor, shirtColor, pantsColor, hairColor)
    : buildMale(skinColor, shirtColor, pantsColor, hairColor);
  group.name = `npc_${name}`;

  // Blob shadow
  const blobMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 });
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.3, 10), blobMat);
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.01;
  group.add(blob);

  return group;
}

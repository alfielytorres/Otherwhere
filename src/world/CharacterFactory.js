import * as THREE from 'three';

const SKIN_TONES = [0xC68642, 0xAB7442, 0x8D5524, 0xD4A574, 0xE8B89A, 0xF1C27D];
const SHIRT_COLORS = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12, 0x9B59B6, 0xFF5722, 0x00BCD4, 0xFF9800, 0xE91E63, 0x1ABC9C, 0xFFFFFF, 0xCCCCCC];
const PANTS_COLORS = [0x1A237E, 0x37474F, 0x212121, 0x4A148C, 0x1B5E20, 0x3E2723, 0x263238, 0x4E342E];
const HAIR_COLORS = [0x1A1A1A, 0x2C1810, 0x3D2B1F, 0x0a0a0a];

function mat(color, roughness = 0.72, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function buildCharacter(skinColor, shirtColor, pantsColor, hairColor = 0x1A1A1A) {
  const group = new THREE.Group();

  const SKIN = mat(skinColor, 0.85);
  const SHIRT = mat(shirtColor, 0.78);
  const PANTS = mat(pantsColor, 0.82);
  const HAIR = mat(hairColor, 0.9);
  const EYE = mat(0x111111, 0.95);
  const SHOE = mat(0x111111, 0.6, 0.1);

  const shadow = (mesh) => { mesh.castShadow = true; mesh.receiveShadow = true; return mesh; };

  // Head
  const head = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), SKIN.clone()));
  head.position.y = 1.63;
  group.add(head);

  // Hair
  const hair = shadow(new THREE.Mesh(
    new THREE.SphereGeometry(0.135, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
    HAIR
  ));
  hair.position.y = 1.705;
  group.add(hair);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.022, 5, 5);
  const lEye = shadow(new THREE.Mesh(eyeGeo, EYE)); lEye.position.set(-0.05, 1.645, 0.115); group.add(lEye);
  const rEye = shadow(new THREE.Mesh(eyeGeo, EYE)); rEye.position.set(0.05, 1.645, 0.115); group.add(rEye);

  // Neck
  const neck = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 6), SKIN.clone()));
  neck.position.y = 1.48;
  group.add(neck);

  // Torso
  const torso = shadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.5, 3, 8), SHIRT.clone()));
  torso.position.y = 1.1;
  group.add(torso);

  // Upper arms
  const uArmGeo = new THREE.CapsuleGeometry(0.055, 0.25, 2, 6);
  const lUA = shadow(new THREE.Mesh(uArmGeo, SHIRT.clone())); lUA.position.set(-0.24, 1.2, 0); lUA.rotation.z = 0.15; group.add(lUA);
  const rUA = shadow(new THREE.Mesh(uArmGeo, SHIRT.clone())); rUA.position.set(0.24, 1.2, 0); rUA.rotation.z = -0.15; group.add(rUA);

  // Forearms
  const fArmGeo = new THREE.CapsuleGeometry(0.045, 0.22, 2, 6);
  const lFA = shadow(new THREE.Mesh(fArmGeo, SKIN.clone())); lFA.position.set(-0.28, 0.92, 0); group.add(lFA);
  const rFA = shadow(new THREE.Mesh(fArmGeo, SKIN.clone())); rFA.position.set(0.28, 0.92, 0); group.add(rFA);

  // Hips
  const hips = shadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.1, 2, 6), PANTS.clone()));
  hips.position.y = 0.73;
  group.add(hips);

  // Thighs
  const thighGeo = new THREE.CapsuleGeometry(0.075, 0.28, 2, 6);
  const lTh = shadow(new THREE.Mesh(thighGeo, PANTS.clone())); lTh.position.set(-0.1, 0.52, 0); group.add(lTh);
  const rTh = shadow(new THREE.Mesh(thighGeo, PANTS.clone())); rTh.position.set(0.1, 0.52, 0); group.add(rTh);

  // Calves
  const calfGeo = new THREE.CapsuleGeometry(0.055, 0.27, 2, 6);
  const lCa = shadow(new THREE.Mesh(calfGeo, PANTS.clone())); lCa.position.set(-0.1, 0.23, 0); group.add(lCa);
  const rCa = shadow(new THREE.Mesh(calfGeo, PANTS.clone())); rCa.position.set(0.1, 0.23, 0); group.add(rCa);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.1, 0.06, 0.16);
  const lSh = shadow(new THREE.Mesh(shoeGeo, SHOE.clone())); lSh.position.set(-0.1, 0.03, 0.03); group.add(lSh);
  const rSh = shadow(new THREE.Mesh(shoeGeo, SHOE.clone())); rSh.position.set(0.1, 0.03, 0.03); group.add(rSh);

  return group;
}

export function createPlayer(name = 'Juan') {
  const group = buildCharacter(0xC68642, 0xFFFAF0, 0x1A237E, 0x1A1A1A);
  group.name = `player_${name}`;
  return group;
}

export function createNPC(name) {
  const skinColor = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
  const shirtColor = SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
  const pantsColor = PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)];
  const hairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
  const group = buildCharacter(skinColor, shirtColor, pantsColor, hairColor);
  group.name = `npc_${name}`;

  // Blob shadow (fake AO under feet, visible even without shadow maps)
  const blobMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 });
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.28, 8), blobMat);
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.01;
  group.add(blob);

  return group;
}

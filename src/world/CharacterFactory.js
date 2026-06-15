import * as THREE from 'three';

const SKIN_TONES = [0xC68642, 0xAB7442, 0x8D5524, 0xD4A574, 0xE8B89A];
const SHIRT_COLORS = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12, 0x9B59B6, 0xFF5722, 0x00BCD4, 0xFF9800, 0xE91E63, 0x1ABC9C];
const PANTS_COLORS = [0x1A237E, 0x37474F, 0x212121, 0x4A148C, 0x1B5E20, 0x3E2723];

function mat(color) {
  return new THREE.MeshLambertMaterial({ color });
}

function buildCharacter(skinColor, shirtColor, pantsColor, isPlayer = false) {
  const group = new THREE.Group();

  const SKIN = mat(skinColor);
  const SHIRT = mat(shirtColor);
  const PANTS = mat(pantsColor);
  const HAIR = mat(0x1A1A1A);
  const EYE = mat(0x111111);
  const SHOE = mat(0x1A1A1A);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 5), SKIN.clone());
  head.position.y = 1.63;
  head.castShadow = isPlayer;
  group.add(head);

  // Hair (top half-sphere)
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.135, 6, 5, 0, Math.PI * 2, 0, Math.PI * 0.5),
    HAIR
  );
  hair.position.y = 1.70;
  group.add(hair);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.022, 5, 5);
  const leftEye = new THREE.Mesh(eyeGeo, EYE);
  leftEye.position.set(-0.05, 1.645, 0.115);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, EYE);
  rightEye.position.set(0.05, 1.645, 0.115);
  group.add(rightEye);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 6), SKIN.clone());
  neck.position.y = 1.48;
  group.add(neck);

  // Torso
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.5, 2, 6), SHIRT.clone());
  torso.position.y = 1.1;
  torso.castShadow = isPlayer;
  group.add(torso);

  // Upper arms
  const uArmGeo = new THREE.CapsuleGeometry(0.055, 0.25, 2, 6);
  const lUpperArm = new THREE.Mesh(uArmGeo, SHIRT.clone());
  lUpperArm.position.set(-0.24, 1.2, 0);
  lUpperArm.rotation.z = 0.15;
  lUpperArm.castShadow = isPlayer;
  group.add(lUpperArm);
  const rUpperArm = new THREE.Mesh(uArmGeo, SHIRT.clone());
  rUpperArm.position.set(0.24, 1.2, 0);
  rUpperArm.rotation.z = -0.15;
  rUpperArm.castShadow = isPlayer;
  group.add(rUpperArm);

  // Forearms
  const fArmGeo = new THREE.CapsuleGeometry(0.045, 0.22, 2, 6);
  const lForearm = new THREE.Mesh(fArmGeo, SKIN.clone());
  lForearm.position.set(-0.28, 0.92, 0);
  lForearm.castShadow = isPlayer;
  group.add(lForearm);
  const rForearm = new THREE.Mesh(fArmGeo, SKIN.clone());
  rForearm.position.set(0.28, 0.92, 0);
  rForearm.castShadow = isPlayer;
  group.add(rForearm);

  // Hips
  const hips = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.1, 2, 6), PANTS.clone());
  hips.position.y = 0.73;
  hips.castShadow = isPlayer;
  group.add(hips);

  // Thighs
  const thighGeo = new THREE.CapsuleGeometry(0.075, 0.28, 2, 6);
  const lThigh = new THREE.Mesh(thighGeo, PANTS.clone());
  lThigh.position.set(-0.1, 0.52, 0);
  lThigh.castShadow = isPlayer;
  group.add(lThigh);
  const rThigh = new THREE.Mesh(thighGeo, PANTS.clone());
  rThigh.position.set(0.1, 0.52, 0);
  rThigh.castShadow = isPlayer;
  group.add(rThigh);

  // Calves
  const calfGeo = new THREE.CapsuleGeometry(0.055, 0.27, 2, 6);
  const lCalf = new THREE.Mesh(calfGeo, PANTS.clone());
  lCalf.position.set(-0.1, 0.23, 0);
  lCalf.castShadow = isPlayer;
  group.add(lCalf);
  const rCalf = new THREE.Mesh(calfGeo, PANTS.clone());
  rCalf.position.set(0.1, 0.23, 0);
  rCalf.castShadow = isPlayer;
  group.add(rCalf);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.1, 0.06, 0.16);
  const lShoe = new THREE.Mesh(shoeGeo, SHOE.clone());
  lShoe.position.set(-0.1, 0.03, 0.03);
  group.add(lShoe);
  const rShoe = new THREE.Mesh(shoeGeo, SHOE.clone());
  rShoe.position.set(0.1, 0.03, 0.03);
  group.add(rShoe);

  return group;
}

function buildSimpleNPC(skinColor, shirtColor, pantsColor) {
  const group = new THREE.Group();

  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 1.3, 0.3),
    new THREE.MeshLambertMaterial({ color: shirtColor })
  );
  body.position.y = 0.65;
  group.add(body);

  // Head
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.26, 0.26),
    new THREE.MeshLambertMaterial({ color: skinColor })
  );
  head.position.y = 1.6;
  group.add(head);

  // Shadow
  const shadowGeo = new THREE.CircleGeometry(0.28, 6);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 });
  const shadowBlob = new THREE.Mesh(shadowGeo, shadowMat);
  shadowBlob.rotation.x = -Math.PI / 2;
  shadowBlob.position.y = 0.01;
  group.add(shadowBlob);

  return group;
}

export function createPlayer(name = 'Juan') {
  const group = buildCharacter(0xC68642, 0xFFFAF0, 0x1A237E, true);
  group.name = `player_${name}`;
  return group;
}

export function createNPC(name, color = null) {
  const skinColor = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
  const shirtColor = color || SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
  const pantsColor = PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)];
  const group = buildSimpleNPC(skinColor, shirtColor, pantsColor);
  group.name = `npc_${name}`;
  return group;
}

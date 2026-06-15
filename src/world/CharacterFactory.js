import * as THREE from 'three';

export function createPlayer(name = 'Juan') {
  const group = new THREE.Group();
  group.name = `player_${name}`;

  const skinColor = 0xD2955A;
  const shirtColor = 0xFFFAF0; // barong tagalog white/cream
  const pantsColor = 0x1A237E;

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.8, 1.2, 0.5);
  const bodyMat = new THREE.MeshLambertMaterial({ color: shirtColor });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.6;
  body.castShadow = true;
  group.add(body);

  // Head
  const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
  const headMat = new THREE.MeshLambertMaterial({ color: skinColor });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.5;
  head.castShadow = true;
  group.add(head);

  // Left arm
  const armGeo = new THREE.BoxGeometry(0.22, 0.8, 0.22);
  const armMat = new THREE.MeshLambertMaterial({ color: shirtColor });
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(-0.55, 0.6, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  // Right arm
  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(0.55, 0.6, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  // Left leg
  const legGeo = new THREE.BoxGeometry(0.25, 0.9, 0.25);
  const legMat = new THREE.MeshLambertMaterial({ color: pantsColor });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.2, -0.25, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  // Right leg
  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.2, -0.25, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // Shadow circle
  const shadowGeo = new THREE.CircleGeometry(0.5, 8);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.2
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.69;
  group.add(shadow);

  // Eyes (small dark boxes)
  const eyeGeo = new THREE.BoxGeometry(0.1, 0.08, 0.05);
  const eyeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.15, 1.55, 0.31);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.15, 1.55, 0.31);
  group.add(rightEye);

  return group;
}

export function createNPC(name, color = null) {
  const group = new THREE.Group();
  group.name = `npc_${name}`;

  const skinColor = 0xC8874A;
  const clothesColor = color || randomClothesColor();
  const pantsColor = randomPantsColor();

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.75, 1.1, 0.45);
  const bodyMat = new THREE.MeshLambertMaterial({ color: clothesColor });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  // Head
  const headGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
  const headMat = new THREE.MeshLambertMaterial({ color: skinColor });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.4;
  head.castShadow = true;
  group.add(head);

  // Arms
  const armGeo = new THREE.BoxGeometry(0.2, 0.75, 0.2);
  const armMat = new THREE.MeshLambertMaterial({ color: clothesColor });
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(-0.5, 0.55, 0);
  group.add(leftArm);
  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(0.5, 0.55, 0);
  group.add(rightArm);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.22, 0.85, 0.22);
  const legMat = new THREE.MeshLambertMaterial({ color: pantsColor });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.18, -0.2, 0);
  group.add(leftLeg);
  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.18, -0.2, 0);
  group.add(rightLeg);

  // Shadow
  const shadowGeo = new THREE.CircleGeometry(0.45, 8);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.15
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.62;
  group.add(shadow);

  return group;
}

function randomClothesColor() {
  const colors = [
    0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12,
    0x9B59B6, 0x1ABC9C, 0xE67E22, 0xE91E63,
    0xFF5722, 0x00BCD4, 0x8BC34A, 0xFF9800
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function randomPantsColor() {
  const colors = [0x1A237E, 0x212121, 0x37474F, 0x4A148C, 0x1B5E20, 0x3E2723];
  return colors[Math.floor(Math.random() * colors.length)];
}

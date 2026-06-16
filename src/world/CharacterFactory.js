import * as THREE from 'three';

const SKIN_TONES  = [0xC8946A, 0xBE8055, 0xA0622E, 0xD9B08C, 0xECC5A0, 0xF5D5B5];
const SHIRT_COLORS = [0x2980B9, 0x27AE60, 0xE74C3C, 0x8E44AD, 0x16A085, 0x2C3E50, 0xF39C12, 0xBDC3C7];
const DRESS_COLORS = [0xFF4081, 0xE91E63, 0x9C27B0, 0xFF6EC7, 0xF06292, 0xCE93D8, 0xFF5722, 0x80DEEA, 0xAED581];
const PANTS_COLORS = [0x1A237E, 0x263238, 0x212121, 0x4A148C, 0x1B5E20, 0x3E2723];
const HAIR_COLORS  = [0x0a0808, 0x1a0f0a, 0x2C1810, 0x0d0d0d];
const EYE_COLORS   = [0x3D2B1F, 0x4a3728, 0x2d1f15, 0x5c3d2a];

function mat(color, roughness = 0.70, metalness = 0, emissive = 0, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness,
    emissive: new THREE.Color(emissive), emissiveIntensity });
}

function s(mesh) { mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }
function mk(geo, m) { return s(new THREE.Mesh(geo, m)); }

// Detailed face: eyes with iris, brows, nose, lips, cheek blush
function addFace(group, skinColor, headY, isFem) {
  const eyeWhite = mat(0xFFFAFA, 0.3);
  const irisColor = EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)];
  const iris = mat(irisColor, 0.5);
  const pupil = mat(0x050505, 0.9);
  const catchlight = mat(0xFFFFFF, 0.1);
  const browM = mat(0x0d0808, 0.9);
  const noseM = mat(skinColor, 0.78);
  const lipColor = isFem ? 0xD44060 : 0xB5736A;
  const lipM = mat(lipColor, 0.55);
  const blushM = new THREE.MeshStandardMaterial({ color: 0xFF9090, transparent: true, opacity: 0.18, roughness: 0.9 });

  // Left eye assembly
  const eyeOffsets = [[-0.055, 0], [0.055, 0]];
  for (const [ex] of eyeOffsets) {
    const side = ex < 0 ? -1 : 1;
    // White
    const white = mk(new THREE.SphereGeometry(0.028, 8, 8), eyeWhite.clone());
    white.position.set(ex, headY - 0.005, 0.118);
    white.scale.set(1, 0.75, 0.5);
    group.add(white);
    // Iris
    const ir = mk(new THREE.SphereGeometry(0.018, 8, 8), iris.clone());
    ir.position.set(ex, headY - 0.005, 0.128);
    ir.scale.set(1, 0.75, 0.5);
    group.add(ir);
    // Pupil
    const pu = mk(new THREE.SphereGeometry(0.01, 6, 6), pupil.clone());
    pu.position.set(ex, headY - 0.004, 0.131);
    group.add(pu);
    // Catchlight
    const cl = mk(new THREE.SphereGeometry(0.004, 5, 5), catchlight.clone());
    cl.position.set(ex + 0.006, headY + 0.006, 0.133);
    group.add(cl);
    // Eyelash bar (thin dark strip above eye)
    const lash = mk(new THREE.BoxGeometry(0.06, 0.006, 0.004), mat(0x050505, 0.9));
    lash.position.set(ex, headY + 0.014, 0.125);
    lash.rotation.z = side * 0.06;
    group.add(lash);
    // Eyebrow
    const brow = mk(new THREE.BoxGeometry(isFem ? 0.048 : 0.054, isFem ? 0.006 : 0.009, 0.004), browM.clone());
    brow.position.set(ex + side * 0.002, headY + 0.038, 0.114);
    brow.rotation.z = side * (isFem ? 0.1 : 0.04);
    group.add(brow);
  }

  // Nose — small sphere bump
  const nose = mk(new THREE.SphereGeometry(0.016, 6, 6), noseM.clone());
  nose.position.set(0, headY - 0.032, 0.13);
  nose.scale.set(1.1, 0.7, 0.7);
  group.add(nose);

  // Lips — upper and lower
  const lipW = isFem ? 0.055 : 0.048;
  const lipH = isFem ? 0.010 : 0.009;
  const upperLip = mk(new THREE.CapsuleGeometry(lipH, lipW, 3, 6), lipM.clone());
  upperLip.position.set(0, headY - 0.062, 0.125);
  upperLip.rotation.z = Math.PI / 2;
  upperLip.scale.set(1, isFem ? 1.4 : 1.0, 0.5);
  group.add(upperLip);
  const lowerLip = mk(new THREE.CapsuleGeometry(lipH * (isFem ? 1.3 : 1.1), lipW * 0.85, 3, 6), lipM.clone());
  lowerLip.position.set(0, headY - 0.076, 0.124);
  lowerLip.rotation.z = Math.PI / 2;
  lowerLip.scale.set(1, 1, 0.5);
  group.add(lowerLip);

  // Cheek blush (females only)
  if (isFem) {
    const blushG = new THREE.SphereGeometry(0.048, 8, 8);
    const lBlush = new THREE.Mesh(blushG, blushM.clone());
    lBlush.position.set(-0.085, headY - 0.022, 0.105);
    lBlush.scale.set(1, 0.55, 0.4);
    group.add(lBlush);
    const rBlush = new THREE.Mesh(blushG, blushM.clone());
    rBlush.position.set(0.085, headY - 0.022, 0.105);
    rBlush.scale.set(1, 0.55, 0.4);
    group.add(rBlush);
  }
}

// ─── Male ─────────────────────────────────────────────────────────────────────
function buildMale(skinColor, shirtColor, pantsColor, hairColor) {
  const g = new THREE.Group();
  const SKIN = mat(skinColor, 0.68);
  const TOP  = mat(shirtColor, 0.72);
  const BOT  = mat(pantsColor, 0.78);
  const HAIR = mat(hairColor, 0.72);
  const SHOE = mat(0x0d0d0d, 0.5, 0.1);

  const headY = 1.67;

  // Head — slightly angular jaw
  const head = mk(new THREE.SphereGeometry(0.14, 14, 12), SKIN.clone());
  head.scale.set(1.0, 0.94, 1.0);
  head.position.y = headY;
  g.add(head);

  // Short side-parted hair
  const hairCap = mk(new THREE.SphereGeometry(0.148, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.50), HAIR.clone());
  hairCap.position.y = headY + 0.065;
  g.add(hairCap);
  // Side part volume
  const sideV = mk(new THREE.SphereGeometry(0.08, 8, 8, 0, Math.PI, 0, Math.PI * 0.45), HAIR.clone());
  sideV.position.set(-0.05, headY + 0.07, 0.04);
  g.add(sideV);

  addFace(g, skinColor, headY, false);

  // Neck
  const neck = mk(new THREE.CylinderGeometry(0.058, 0.065, 0.11, 10), SKIN.clone());
  neck.position.y = 1.505;
  g.add(neck);

  // Torso — athletic V-taper
  const torso = mk(new THREE.CylinderGeometry(0.26, 0.155, 0.56, 10), TOP.clone());
  torso.position.y = 1.1;
  g.add(torso);

  // Upper arms
  const uArmG = new THREE.CapsuleGeometry(0.065, 0.28, 4, 10);
  const lArm = mk(uArmG, TOP.clone()); lArm.name = 'lArm'; lArm.position.set(-0.32, 1.18, 0); lArm.rotation.z =  0.1; g.add(lArm);
  const rArm = mk(uArmG, TOP.clone()); rArm.name = 'rArm'; rArm.position.set( 0.32, 1.18, 0); rArm.rotation.z = -0.1; g.add(rArm);

  // Forearms
  const fArmG = new THREE.CapsuleGeometry(0.050, 0.24, 4, 10);
  const lFA = mk(fArmG, SKIN.clone()); lFA.position.set(-0.34, 0.87, 0); g.add(lFA);
  const rFA = mk(fArmG, SKIN.clone()); rFA.position.set( 0.34, 0.87, 0); g.add(rFA);

  // Hips
  const hips = mk(new THREE.CylinderGeometry(0.155, 0.148, 0.16, 10), BOT.clone());
  hips.position.y = 0.73;
  g.add(hips);

  // Thighs
  const thG = new THREE.CapsuleGeometry(0.082, 0.30, 4, 10);
  const lLeg = mk(thG, BOT.clone()); lLeg.name = 'lLeg'; lLeg.position.set(-0.115, 0.485, 0); g.add(lLeg);
  const rLeg = mk(thG, BOT.clone()); rLeg.name = 'rLeg'; rLeg.position.set( 0.115, 0.485, 0); g.add(rLeg);

  // Calves
  const caG = new THREE.CapsuleGeometry(0.058, 0.27, 4, 10);
  const lCa = mk(caG, BOT.clone()); lCa.position.set(-0.115, 0.186, 0); g.add(lCa);
  const rCa = mk(caG, BOT.clone()); rCa.position.set( 0.115, 0.186, 0); g.add(rCa);

  // Shoes
  const shG = new THREE.BoxGeometry(0.11, 0.065, 0.18);
  const lSh = mk(shG, SHOE.clone()); lSh.position.set(-0.115, 0.033, 0.032); g.add(lSh);
  const rSh = mk(shG, SHOE.clone()); rSh.position.set( 0.115, 0.033, 0.032); g.add(rSh);

  return g;
}

// ─── Female ───────────────────────────────────────────────────────────────────
function buildFemale(skinColor, dressColor, hairColor) {
  const g = new THREE.Group();
  const SKIN  = mat(skinColor, 0.65);
  const DRESS = mat(dressColor, 0.68);
  const HAIR  = mat(hairColor, 0.68);
  const SHOE  = mat(0xCC3377, 0.48, 0.06);

  const headY = 1.64;

  // Head — soft, round
  const head = mk(new THREE.SphereGeometry(0.128, 14, 12), SKIN.clone());
  head.scale.set(1.02, 1.0, 1.02);
  head.position.y = headY;
  g.add(head);

  // Long flowing hair — main volume
  const hairMain = mk(
    new THREE.SphereGeometry(0.178, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.80),
    HAIR.clone()
  );
  hairMain.position.y = headY - 0.05;
  g.add(hairMain);
  // Hair top highlight
  const hairTop = mk(
    new THREE.SphereGeometry(0.135, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.50),
    mat(hairColor, 0.60)
  );
  hairTop.position.y = headY + 0.07;
  g.add(hairTop);
  // Hair highlight streak (lighter tone)
  const hlColor = new THREE.Color(hairColor).offsetHSL(0, -0.1, 0.1).getHex();
  const hairHL = mk(
    new THREE.CapsuleGeometry(0.025, 0.14, 3, 6),
    mat(hlColor, 0.55)
  );
  hairHL.position.set(0.08, headY + 0.06, -0.08);
  hairHL.rotation.z = 0.3;
  g.add(hairHL);

  addFace(g, skinColor, headY, true);

  // Neck — slender
  const neck = mk(new THREE.CylinderGeometry(0.042, 0.050, 0.1, 10), SKIN.clone());
  neck.position.y = 1.475;
  g.add(neck);

  // Shoulders + upper chest
  const shoulders = mk(new THREE.CylinderGeometry(0.16, 0.125, 0.22, 10), DRESS.clone());
  shoulders.position.y = 1.275;
  g.add(shoulders);

  // Bust
  const bustG = new THREE.SphereGeometry(0.088, 10, 10);
  const lBust = mk(bustG, DRESS.clone()); lBust.position.set(-0.082, 1.19, 0.092); g.add(lBust);
  const rBust = mk(bustG, DRESS.clone()); rBust.position.set( 0.082, 1.19, 0.092); g.add(rBust);

  // Upper arms — bare and slim
  const uArmG = new THREE.CapsuleGeometry(0.044, 0.26, 4, 10);
  const lArm = mk(uArmG, SKIN.clone()); lArm.name = 'lArm'; lArm.position.set(-0.215, 1.19, 0); lArm.rotation.z =  0.16; g.add(lArm);
  const rArm = mk(uArmG, SKIN.clone()); rArm.name = 'rArm'; rArm.position.set( 0.215, 1.19, 0); rArm.rotation.z = -0.16; g.add(rArm);

  // Forearms
  const fArmG = new THREE.CapsuleGeometry(0.036, 0.22, 4, 10);
  const lFA = mk(fArmG, SKIN.clone()); lFA.position.set(-0.235, 0.875, 0); g.add(lFA);
  const rFA = mk(fArmG, SKIN.clone()); rFA.position.set( 0.235, 0.875, 0); g.add(rFA);

  // Waist — hourglass
  const waist = mk(new THREE.CylinderGeometry(0.108, 0.12, 0.20, 10), DRESS.clone());
  waist.position.y = 1.005;
  g.add(waist);

  // Hip flare
  const hipFlare = mk(new THREE.CylinderGeometry(0.20, 0.185, 0.12, 10), DRESS.clone());
  hipFlare.position.y = 0.84;
  g.add(hipFlare);

  // Skirt — flared, wider at hem
  const skirt = mk(new THREE.CylinderGeometry(0.185, 0.34, 0.68, 12), DRESS.clone());
  skirt.position.y = 0.62;
  g.add(skirt);

  // Legs below skirt
  const legG = new THREE.CapsuleGeometry(0.053, 0.22, 4, 10);
  const lLeg = mk(legG, SKIN.clone()); lLeg.name = 'lLeg'; lLeg.position.set(-0.088, 0.22, 0); g.add(lLeg);
  const rLeg = mk(legG, SKIN.clone()); rLeg.name = 'rLeg'; rLeg.position.set( 0.088, 0.22, 0); g.add(rLeg);

  // Heeled shoes
  const shoeBody = new THREE.BoxGeometry(0.09, 0.048, 0.14);
  const lSh = mk(shoeBody, SHOE.clone()); lSh.position.set(-0.088, 0.024, 0.018); g.add(lSh);
  const rSh = mk(shoeBody, SHOE.clone()); rSh.position.set( 0.088, 0.024, 0.018); g.add(rSh);
  // Heel post
  const heelG = new THREE.CylinderGeometry(0.012, 0.009, 0.04, 6);
  const lHeel = mk(heelG, SHOE.clone()); lHeel.position.set(-0.088, 0.02, -0.04); g.add(lHeel);
  const rHeel = mk(heelG, SHOE.clone()); rHeel.position.set( 0.088, 0.02, -0.04); g.add(rHeel);

  return g;
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function createPlayer(name = 'Juan') {
  const group = buildMale(0xC8946A, 0xFFFAF0, 0x1A237E,
    HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)]);
  group.name = `player_${name}`;
  return group;
}

export function createNPC(name) {
  const skin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
  const hair = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
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

  const blobM = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.20 });
  const blob  = new THREE.Mesh(new THREE.CircleGeometry(0.32, 12), blobM);
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.01;
  group.add(blob);

  return group;
}

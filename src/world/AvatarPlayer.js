// Loads a ReadyPlayerMe (or Mixamo-rigged) GLB avatar and animates it
// procedurally using Mixamo bone names — no external animation files needed.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MIXAMO = {
  hips:     'mixamorigHips',
  spine:    'mixamorigSpine',
  spine1:   'mixamorigSpine1',
  spine2:   'mixamorigSpine2',
  neck:     'mixamorigNeck',
  head:     'mixamorigHead',
  lShoulder:'mixamorigLeftShoulder',
  lArm:     'mixamorigLeftArm',
  lForeArm: 'mixamorigLeftForeArm',
  rShoulder:'mixamorigRightShoulder',
  rArm:     'mixamorigRightArm',
  rForeArm: 'mixamorigRightForeArm',
  lUpLeg:   'mixamorigLeftUpLeg',
  lLeg:     'mixamorigLeftLeg',
  lFoot:    'mixamorigLeftFoot',
  rUpLeg:   'mixamorigRightUpLeg',
  rLeg:     'mixamorigRightLeg',
  rFoot:    'mixamorigRightFoot',
};

// Activity key → animation category
const ACT_CAT = {
  SLEEP:'sleep', GET_HILOT:'sleep', REST:'sleep', GET_SPECIAL_MASSAGE:'sleep',
  EAT_ADOBO:'eat', EAT_SINIGANG:'eat', EAT_LECHON:'eat', EAT_ISAW:'eat',
  EAT_BBQPORK:'eat', EAT_BALUT:'eat', EAT_FOOD_COURT:'eat',
  DRINK:'drink', BUY_DRINKS:'drink', VIP_ROOM:'drink',
  WORK:'type', BROWSE_INTERNET:'type', PLAY_GAMES:'type', REPORT_TO_BOSS:'type',
  EXERCISE:'exercise', TRAIN:'exercise',
  SING:'dance', WATCH_SHOW:'sit',
  SOCIALIZE:'sit', CHISMIS:'sit', READ:'sit', WATCH_TV:'sit', AIRCON_BREAK:'sit',
  PRAY:'pray', ATTEND_MASS:'pray', LIGHT_CANDLE:'pray',
  SHOP:'idle', BUY_SNACKS:'idle', BUY_CIGARETTE:'idle', BUY_GROCERIES:'idle',
  COOK:'idle', SHOWER:'idle', GAMBLE:'sit', PAWN_ITEM:'idle',
};

export class AvatarPlayer {
  constructor() {
    this.model   = null;
    this.bones   = {};
    this._baseY  = 0;
    this.loaded  = false;
  }

  async loadFromUrl(url, scene, startX = 0, startZ = 10) {
    const loader = new GLTFLoader();
    let gltf;
    try {
      // Append quality params for best RPM output
      const src = url.includes('?')
        ? url + '&textureAtlas=1024&lod=0&pose=A'
        : url + '?textureAtlas=1024&lod=0&pose=A';
      gltf = await loader.loadAsync(src);
    } catch {
      return false;
    }
    return this._setup(gltf, scene, startX, startZ);
  }

  async loadFromFile(path, scene, startX = 0, startZ = 10) {
    const loader = new GLTFLoader();
    let gltf;
    try { gltf = await loader.loadAsync(path); } catch { return false; }
    return this._setup(gltf, scene, startX, startZ);
  }

  _setup(gltf, scene, startX, startZ) {
    this.model = gltf.scene;
    this.model.traverse(child => {
      child.castShadow = true;
      child.receiveShadow = true;
      // Cache bone references
      for (const [key, name] of Object.entries(MIXAMO)) {
        if (child.name === name) this.bones[key] = child;
      }
    });

    // Auto-scale to ~1.75 units and align feet to y=0
    const box = new THREE.Box3().setFromObject(this.model);
    const h = box.max.y - box.min.y;
    if (h > 0) {
      const scale = 1.75 / h;
      this.model.scale.setScalar(scale);
      this._baseY = -box.min.y * scale;
    }
    this.model.position.set(startX, this._baseY, startZ);
    scene.add(this.model);

    this.loaded = true;
    return true;
  }

  // Called every frame
  update(delta, timestamp, speed, activityKey) {
    if (!this.loaded) return;
    const t = timestamp * 0.001;

    if (activityKey) {
      this._poseActivity(ACT_CAT[activityKey] || 'idle', t);
    } else if (speed > 0.5) {
      this._poseWalk(t, speed);
    } else {
      this._poseIdle(t);
    }
  }

  syncTo(x, y, z, rotY) {
    if (!this.model) return;
    this.model.position.set(x, y + this._baseY, z);
    this.model.rotation.y = rotY;
  }

  // ── Private animation methods ───────────────────────────────────────────────

  _b(key) { return this.bones[key] || null; }

  _poseIdle(t) {
    // Subtle breathing — spine expansion
    const breath = Math.sin(t * 0.9) * 0.018;
    this._setRot('spine',  breath * 0.5, 0, 0);
    this._setRot('spine1', breath, 0, 0);
    this._setRot('spine2', breath * 0.5, 0, 0);
    // Gentle head sway
    this._setRot('head', Math.sin(t * 0.4) * 0.022, Math.sin(t * 0.3) * 0.018, 0);
    this._setRot('neck', Math.sin(t * 0.4) * 0.012, 0, 0);
    // Arms rest slightly forward
    this._setRot('lArm',    0.06, 0,  0.12);
    this._setRot('rArm',    0.06, 0, -0.12);
    this._setRot('lForeArm', 0.05, 0, 0);
    this._setRot('rForeArm', 0.05, 0, 0);
    // Legs straight
    this._setRot('lUpLeg', 0, 0, 0);
    this._setRot('rUpLeg', 0, 0, 0);
    this._setRot('lLeg', 0, 0, 0);
    this._setRot('rLeg', 0, 0, 0);
    this._setPos('hips', 0, 0, 0);
  }

  _poseWalk(t, speed) {
    const rate = Math.min(speed / 8, 1) * 5.5;
    const swing = Math.sin(t * rate);
    const legAmp = 0.55;
    const armAmp = 0.4;
    const bob = Math.abs(Math.sin(t * rate)) * 0.04;

    this._setPos('hips', 0, -bob, 0);
    // Hip slight counter-rotation
    this._setRot('hips', 0, Math.sin(t * rate) * 0.06, 0);
    // Spine slight counter-twist
    this._setRot('spine', 0.02, -Math.sin(t * rate) * 0.05, 0);
    // Legs alternate
    this._setRot('lUpLeg',  swing * legAmp, 0, 0.04);
    this._setRot('rUpLeg', -swing * legAmp, 0, -0.04);
    // Knee bends on backswing
    this._setRot('lLeg', Math.max(0, -swing) * 0.55, 0, 0);
    this._setRot('rLeg', Math.max(0,  swing) * 0.55, 0, 0);
    // Feet angle with ground
    this._setRot('lFoot', Math.sin(t * rate + 0.3) * 0.12, 0, 0);
    this._setRot('rFoot', -Math.sin(t * rate + 0.3) * 0.12, 0, 0);
    // Arms swing opposite legs
    this._setRot('lArm', -swing * armAmp, 0,  0.1);
    this._setRot('rArm',  swing * armAmp, 0, -0.1);
    this._setRot('lForeArm', Math.max(0, -swing) * 0.3 + 0.05, 0, 0);
    this._setRot('rForeArm', Math.max(0,  swing) * 0.3 + 0.05, 0, 0);
    // Head stays level
    this._setRot('head', 0, 0, 0);
    this._setRot('neck', 0, 0, 0);
  }

  _poseActivity(cat, t) {
    // Reset legs and hips first
    this._setPos('hips', 0, 0, 0);
    this._setRot('hips', 0, 0, 0);
    this._setRot('lUpLeg', 0, 0, 0);
    this._setRot('rUpLeg', 0, 0, 0);
    this._setRot('lLeg', 0, 0, 0);
    this._setRot('rLeg', 0, 0, 0);
    this._setRot('lFoot', 0, 0, 0);
    this._setRot('rFoot', 0, 0, 0);
    this._setRot('spine', 0, 0, 0);
    this._setRot('spine1', 0, 0, 0);
    this._setRot('spine2', 0, 0, 0);

    switch (cat) {
      case 'sleep':
        this._setRot('spine', 0.35, 0, 0);
        this._setRot('spine1', 0.45, 0, 0);
        this._setRot('head', 0.3, 0, 0);
        this._setRot('lArm', 0.3, 0,  0.1);
        this._setRot('rArm', 0.3, 0, -0.1);
        this._setRot('lForeArm', 0.4, 0, 0);
        this._setRot('rForeArm', 0.4, 0, 0);
        break;

      case 'eat':
        this._setRot('rArm', -1.0 + Math.sin(t * 2.5) * 0.35, 0, -0.1);
        this._setRot('rForeArm', 0.8 + Math.sin(t * 2.5) * 0.15, 0, 0);
        this._setRot('lArm', -0.2, 0, 0.12);
        this._setRot('lForeArm', 0.3, 0, 0);
        this._setRot('head', -0.05, Math.sin(t * 1.2) * 0.04, 0);
        this._setRot('spine1', -0.08, 0, 0);
        break;

      case 'drink':
        this._setRot('rArm', -1.3 + Math.sin(t * 1.5) * 0.12, 0, -0.1);
        this._setRot('rForeArm', 1.1, 0, 0);
        this._setRot('lArm', -0.15, 0, 0.1);
        this._setRot('lForeArm', 0.2, 0, 0);
        break;

      case 'type':
        this._setRot('spine1', -0.12, 0, 0);
        this._setRot('lArm', -0.8, 0, 0.05);
        this._setRot('rArm', -0.8, 0, -0.05);
        this._setRot('lForeArm', 0.9 + Math.sin(t * 10) * 0.04, 0, 0);
        this._setRot('rForeArm', 0.9 + Math.sin(t * 10 + 1.2) * 0.04, 0, 0);
        this._setRot('head', -0.1, 0, 0);
        break;

      case 'exercise':
        this._setRot('lArm',   Math.sin(t * 5.5) * 1.1, 0,  0.1);
        this._setRot('rArm',  -Math.sin(t * 5.5) * 1.1, 0, -0.1);
        this._setRot('lUpLeg', -Math.sin(t * 5.5 + 0.8) * 0.5, 0, 0);
        this._setRot('rUpLeg',  Math.sin(t * 5.5 + 0.8) * 0.5, 0, 0);
        this._setPos('hips', 0, Math.abs(Math.sin(t * 5.5)) * 0.08, 0);
        break;

      case 'dance':
        this._setRot('lArm', -1.0 + Math.sin(t * 2.2) * 0.4, 0, 0.3 + Math.sin(t * 1.5) * 0.2);
        this._setRot('rArm', -1.0 + Math.sin(t * 2.2 + 1) * 0.4, 0, -0.3 - Math.sin(t * 1.5) * 0.2);
        this._setRot('hips', 0, Math.sin(t * 3.0) * 0.25, Math.sin(t * 2.0) * 0.12);
        this._setRot('spine1', 0, -Math.sin(t * 3.0) * 0.12, 0);
        this._setPos('hips', 0, Math.abs(Math.sin(t * 3.0)) * 0.05, 0);
        break;

      case 'pray':
        this._setRot('spine1', -0.1, 0, 0);
        this._setRot('head', -0.18, 0, 0);
        this._setRot('neck', -0.1, 0, 0);
        this._setRot('lArm', -1.0, 0,  0.25);
        this._setRot('rArm', -1.0, 0, -0.25);
        this._setRot('lForeArm', 0.5, 0, 0);
        this._setRot('rForeArm', 0.5, 0, 0);
        break;

      case 'sit':
        this._setRot('spine1', -0.05, 0, 0);
        this._setRot('lUpLeg', Math.PI / 2, 0, -0.05);
        this._setRot('rUpLeg', Math.PI / 2, 0,  0.05);
        this._setRot('lLeg', -Math.PI / 2 + 0.2, 0, 0);
        this._setRot('rLeg', -Math.PI / 2 + 0.2, 0, 0);
        this._setRot('lArm', 0.1, 0,  0.12);
        this._setRot('rArm', 0.1, 0, -0.12);
        this._setPos('hips', 0, -0.35, 0);
        break;

      default: // idle
        this._poseIdle(t);
    }
  }

  _setRot(key, x, y, z) {
    const b = this._b(key);
    if (b) { b.rotation.x = x; b.rotation.y = y; b.rotation.z = z; }
  }

  _setPos(key, x, y, z) {
    const b = this._b(key);
    if (b) { b.position.x += x; b.position.y += y; b.position.z += z; }
  }
}

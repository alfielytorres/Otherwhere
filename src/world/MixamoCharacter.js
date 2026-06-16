import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const BASE_PATH = './assets/character/';

// Maps activity key → animation clip name
const ACT_CLIP = {
  SLEEP: 'sleep', GET_HILOT: 'sleep', REST: 'sleep', GET_SPECIAL_MASSAGE: 'sleep',
  EAT_ADOBO: 'eat', EAT_SINIGANG: 'eat', EAT_LECHON: 'eat', EAT_ISAW: 'eat',
  EAT_BBQPORK: 'eat', EAT_BALUT: 'eat', EAT_FOOD_COURT: 'eat',
  DRINK: 'drink', BUY_DRINKS: 'drink', VIP_ROOM: 'drink',
  COOK: 'idle', SHOWER: 'idle',
  WORK: 'type', BROWSE_INTERNET: 'type', PLAY_GAMES: 'type', REPORT_TO_BOSS: 'type',
  EXERCISE: 'exercise', TRAIN: 'exercise',
  SING: 'dance', WATCH_SHOW: 'sit',
  SOCIALIZE: 'sit', CHISMIS: 'sit', READ: 'sit', WATCH_TV: 'sit', AIRCON_BREAK: 'sit',
  PRAY: 'pray', ATTEND_MASS: 'pray', LIGHT_CANDLE: 'pray',
  SHOP: 'idle', BUY_SNACKS: 'idle', BUY_CIGARETTE: 'idle', BUY_GROCERIES: 'idle',
  GAMBLE: 'sit', PAWN_ITEM: 'idle', BUY_CONTRABAND: 'idle',
};

const CLIP_NAMES = ['idle', 'walk', 'run', 'sit', 'eat', 'drink', 'sleep', 'type', 'exercise', 'pray', 'dance'];

export class MixamoCharacter {
  constructor() {
    this.model    = null;
    this.mixer    = null;
    this._clips   = {};
    this._actions = {};
    this._cur     = null;
    this._baseY   = 0;
    this.loaded   = false;
  }

  async load(scene, startX = 0, startZ = 10) {
    const loader = new GLTFLoader();
    let gltf;
    try {
      gltf = await loader.loadAsync(`${BASE_PATH}character.glb`);
    } catch {
      return false;
    }

    this.model = gltf.scene;
    this.model.traverse(child => {
      child.castShadow = true;
      child.receiveShadow = true;
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

    this.mixer = new THREE.AnimationMixer(this.model);

    // Load all animation clips (gracefully skip missing files)
    const results = await Promise.allSettled(
      CLIP_NAMES.map(name =>
        loader.loadAsync(`${BASE_PATH}${name}.glb`).then(g => ({ name, g }))
      )
    );

    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      const { name, g } = r.value;
      const clip = g.animations[0];
      if (!clip) continue;
      clip.name = name;
      this._clips[name] = clip;
      const action = this.mixer.clipAction(clip);
      action.clampWhenFinished = false;
      this._actions[name] = action;
    }

    // Clips embedded in the character model itself
    for (const clip of gltf.animations) {
      if (!this._clips[clip.name]) {
        this._clips[clip.name] = clip;
        this._actions[clip.name] = this.mixer.clipAction(clip);
      }
    }

    this.loaded = true;
    this._play('idle');
    return true;
  }

  _play(name, crossFade = 0.25) {
    const next = this._actions[name] || this._actions['idle'];
    if (!next || this._cur === name) return;

    const prev = this._cur ? this._actions[this._cur] : null;
    next.reset().setLoop(THREE.LoopRepeat, Infinity).setEffectiveWeight(1);
    next.enabled = true;
    next.play();

    if (prev && prev !== next) prev.crossFadeTo(next, crossFade, true);
    this._cur = name;
  }

  playActivity(actKey) {
    const clip = ACT_CLIP[actKey] || 'idle';
    this._play(clip, 0.3);
  }

  setMovementClip(speed) {
    if (speed > 8)        this._play('run',  0.2);
    else if (speed > 0.5) this._play('walk', 0.2);
    else                  this._play('idle', 0.3);
  }

  syncTo(x, y, z, rotY) {
    if (!this.model) return;
    this.model.position.set(x, y + this._baseY, z);
    this.model.rotation.y = rotY;
  }

  update(delta) {
    if (this.mixer) this.mixer.update(delta);
  }
}

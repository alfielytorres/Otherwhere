import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { World } from './core/ECS.js';
import { events } from './core/EventBus.js';
import {
  TransformComp, VelocityComp, MeshComp,
  PlayerComp, NeedsComp, NPCComp, BuildingComp
} from './components/Components.js';
import { generateWorld, createRainSystem } from './world/WorldGenerator.js';
import { createPlayer, createNPC } from './world/CharacterFactory.js';
import { createCar, createJeepney, createDog } from './world/VehicleFactory.js';
import { MovementSystem } from './systems/MovementSystem.js';
import { CameraSystem } from './systems/CameraSystem.js';
import { NeedsSystem } from './systems/NeedsSystem.js';
import { TimeSystem } from './systems/TimeSystem.js';
import { NPCSystem } from './systems/NPCSystem.js';
import { TrafficSystem } from './systems/TrafficSystem.js';
import { InteractionSystem } from './systems/InteractionSystem.js';
import { initHUD, updateHUD } from './ui/HUD.js';
import { initActivityMenu } from './ui/ActivityMenu.js';
import { initTouchControls } from './ui/TouchControls.js';
import { createInteriors } from './world/BuildingInteriors.js';
import { MixamoCharacter } from './world/MixamoCharacter.js';
import { AvatarPlayer } from './world/AvatarPlayer.js';
import { showCharacterCreator } from './ui/CharacterCreator.js';
import { BUILDINGS, NPC_NAMES, NPC_DIALOGUES, ACTIVITIES } from './data/GameData.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.running = false;
    this._lastTime = 0;
    this.water = null;
    this.timeSystem = null;
    this.ecsWorld = null;
    this.playerEntity = null;
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.neonLights = [];
    this.rain = null;
    this.trafficSystem = null;
    this.mixamoPlayer = null;
    this.avatarPlayer = null;
  }

  async start() {
    this._initRenderer();
    this._initScene();
    this._initWorld();
    this._initPlayer();
    this._initNPCs();
    this._initBuildings();
    this._initSystems();
    this._initTraffic();
    this._initUI();
    this._initEvents();
    this._initPostProcessing();

    this.ecsWorld.mixamoLoaded = false;

    setTimeout(() => {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }, 1500);

    this.running = true;
    requestAnimationFrame((t) => this._loop(t));

    // Wait for intro animation to finish (~4s), then show character creator
    await new Promise(r => setTimeout(r, 4000));
    const avatarUrl = await showCharacterCreator();

    if (avatarUrl) {
      this._loadAvatarPlayer(avatarUrl);
    } else {
      // No RPM avatar — try local Mixamo files, else stay procedural
      this._loadMixamoPlayer();
    }
  }

  async _loadAvatarPlayer(url) {
    const av = new AvatarPlayer();
    const ok = await av.loadFromUrl(url, this.scene, 0, 10);
    if (ok) {
      this.avatarPlayer = av;
      const meshComp = this.playerEntity.get(MeshComp);
      if (meshComp?.mesh) meshComp.mesh.visible = false;
      this.ecsWorld.mixamoLoaded = true;
    } else {
      // URL failed — fall back to local Mixamo files
      this._loadMixamoPlayer();
    }
  }

  async _loadMixamoPlayer() {
    const mx = new MixamoCharacter();
    const ok = await mx.load(this.scene, 0, 10);
    if (ok) {
      this.mixamoPlayer = mx;
      // Hide the procedural player mesh (kept alive as rotation proxy for MovementSystem)
      const meshComp = this.playerEntity.get(MeshComp);
      if (meshComp?.mesh) meshComp.mesh.visible = false;
      this.ecsWorld.mixamoLoaded = true;
    }
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.8;
    window.addEventListener('resize', () => this._onResize());
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0d1a2e, 0.004);
    this.scene.background = new THREE.Color(0x0d1a2e);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
    this.camera.position.set(0, 16, 22);
    this.camera.lookAt(0, 0, 0);

    const worldResult = generateWorld(this.scene);
    this.water = worldResult.water;
    this.ambientLight = worldResult.ambientLight;
    this.sunLight = worldResult.sunLight;
    this.neonLights = worldResult.neonLights || [];

    this.rain = createRainSystem(this.scene);
  }

  _initWorld() {
    this.ecsWorld = new World();
  }

  _initPlayer() {
    const playerMesh = createPlayer('Juan');
    playerMesh.position.set(0, 0, 10);
    this.scene.add(playerMesh);

    this.playerLight = new THREE.PointLight(0xffe0a0, 5.0, 22);
    this.playerLight.position.set(0, 2.5, 10);
    this.scene.add(this.playerLight);

    this.playerEntity = this.ecsWorld.createEntity(
      new TransformComp(0, 0, 10),
      new VelocityComp(),
      new MeshComp(playerMesh),
      new PlayerComp('Juan'),
      new NeedsComp()
    );
  }

  _initNPCs() {
    const npcPositions = [
      [-30, -50], [40, -60], [70, -80], [80, -40], [50, -20],
      [-50, -30], [-70, 0],  [-80, 50], [-40, 60], [-20, 80],
      [20, 70],   [50, 50],  [80, 70],  [30, -20], [-20, 30]
    ];

    // All 15 named NPCs
    for (let i = 0; i < NPC_NAMES.length; i++) {
      const name = NPC_NAMES[i];
      const pos = npcPositions[i] || [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200];

      const npcMesh = createNPC(name);
      npcMesh.position.set(pos[0], 0, pos[1]);
      this.scene.add(npcMesh);

      const npcComp = new NPCComp(name, 'walker');
      npcComp.dialogue = NPC_DIALOGUES[name] || ['Kumusta!'];
      npcComp.targetX = pos[0] + (Math.random() - 0.5) * 60;
      npcComp.targetZ = pos[1] + (Math.random() - 0.5) * 60;

      this.ecsWorld.createEntity(new TransformComp(pos[0], 0, pos[1]), new MeshComp(npcMesh), npcComp);
    }

    // 6 stray dogs
    const dogSpots = [[-15, 20], [35, -15], [-55, 45], [65, 25], [-25, -70], [10, 55]];
    for (const [dx, dz] of dogSpots) {
      const dogMesh = createDog();
      dogMesh.position.set(dx, 0, dz);
      this.scene.add(dogMesh);

      const dogComp = new NPCComp('dog', 'dog');
      dogComp.speed = 2 + Math.random() * 2;
      dogComp.targetX = dx + (Math.random() - 0.5) * 30;
      dogComp.targetZ = dz + (Math.random() - 0.5) * 30;
      dogComp.waitTime = Math.random() * 4;

      this.ecsWorld.createEntity(new TransformComp(dx, 0, dz), new MeshComp(dogMesh), dogComp);
    }
  }

  _initBuildings() {
    for (const bdata of BUILDINGS) {
      this.ecsWorld.createEntity(new BuildingComp(bdata));
    }
    this.interiors = createInteriors(this.scene, BUILDINGS);
  }

  _initSystems() {
    const movementSystem = new MovementSystem();
    const cameraSystem = new CameraSystem(this.camera);
    const needsSystem = new NeedsSystem();
    this.timeSystem = new TimeSystem(this.scene, this.ambientLight, this.sunLight);
    const npcSystem = new NPCSystem();
    this.timeSystem.gameHours = 22;
    this.timeSystem._updateLighting();
    const interactionSystem = new InteractionSystem(this.interiors);

    this.ecsWorld
      .addSystem(movementSystem)
      .addSystem(cameraSystem)
      .addSystem(needsSystem)
      .addSystem(this.timeSystem)
      .addSystem(npcSystem)
      .addSystem(interactionSystem);
  }

  _initTraffic() {
    this.trafficSystem = new TrafficSystem(this.scene);

    // Cars going east (lane 0)
    for (const [t, spd] of [[0, 0.048], [0.35, 0.038], [0.7, 0.055]]) {
      const m = createCar(); this.scene.add(m);
      this.trafficSystem.addVehicle(m, 0, t, spd);
    }
    // Cars going west (lane 1)
    for (const [t, spd] of [[0.18, 0.042], [0.55, 0.035], [0.82, 0.05]]) {
      const m = createCar(); this.scene.add(m);
      this.trafficSystem.addVehicle(m, 1, t, spd);
    }
    // Jeepneys going south (lane 2)
    for (const [t, spd] of [[0, 0.025], [0.52, 0.022]]) {
      const m = createJeepney(); this.scene.add(m);
      this.trafficSystem.addVehicle(m, 2, t, spd, 0xffcc88);
    }
    // Jeepneys going north (lane 3)
    for (const [t, spd] of [[0.27, 0.024], [0.74, 0.028]]) {
      const m = createJeepney(); this.scene.add(m);
      this.trafficSystem.addVehicle(m, 3, t, spd, 0xffcc88);
    }
  }

  _initUI() {
    initHUD(events);
    initActivityMenu(events);
    initTouchControls();

    // Floating activity badge (Sims-style above player head)
    this._actBadge = document.createElement('div');
    this._actBadge.style.cssText = `
      position:fixed;transform:translate(-50%,-100%);
      background:rgba(6,10,28,0.58);backdrop-filter:blur(18px) saturate(160%);
      -webkit-backdrop-filter:blur(18px) saturate(160%);
      border:1px solid rgba(255,255,255,0.1);border-radius:24px;
      padding:6px 14px 6px 12px;color:white;
      font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;
      letter-spacing:0.04em;display:none;pointer-events:none;z-index:200;
      white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.05);
    `;
    document.body.appendChild(this._actBadge);
    this._wasDoingActivity = false;
  }

  _initEvents() {
    events.on('enter_building', (data) => {
      const player = this.playerEntity.get(PlayerComp);
      const transform = this.playerEntity.get(TransformComp);
      const meshComp = this.playerEntity.get(MeshComp);

      player.isInsideBuilding = true;
      player.currentBuilding = data.building;

      if (data.building.isOutdoor) {
        events.emit('show_zone_activities', { activityKeys: data.building.activities, building: data.building });
        return;
      }

      player.exteriorX = transform.x;
      player.exteriorZ = transform.z;

      const interior = this.interiors.get(data.building.id);
      if (interior) {
        interior.group.visible = true;
        transform.x = interior.entryPoint.x;
        transform.z = interior.entryPoint.z;

        // Keep mesh visible — stay in 3rd person inside building
        if (meshComp && meshComp.mesh) {
          meshComp.mesh.position.set(transform.x, transform.y, transform.z);
          meshComp.mesh.visible = true;
        }

        player.interiorBounds = interior.bounds;
        this._savedFog = this.scene.fog;
        this.scene.fog = null;
        this._activeInterior = interior;
        // No longer switch to first-person — stay in orbit camera
      } else {
        events.emit('show_zone_activities', { activityKeys: data.building.activities, building: data.building });
      }
    });

    events.on('exit_building', () => {
      const player = this.playerEntity.get(PlayerComp);
      const transform = this.playerEntity.get(TransformComp);
      const meshComp = this.playerEntity.get(MeshComp);

      if (!player.isInsideBuilding) return;

      const wasOutdoor = player.currentBuilding && player.currentBuilding.isOutdoor;
      player.isInsideBuilding = false;
      player.currentBuilding = null;
      player.interiorBounds = null;

      if (!wasOutdoor) {
        if (this._activeInterior) {
          this._activeInterior.group.visible = false;
          this._activeInterior = null;
        }
        transform.x = player.exteriorX;
        transform.z = player.exteriorZ;
        if (meshComp && meshComp.mesh) {
          meshComp.mesh.position.set(transform.x, transform.y, transform.z);
          meshComp.mesh.visible = true;
        }
        if (this._savedFog !== undefined) {
          this.scene.fog = this._savedFog;
          this._savedFog = undefined;
        }
        // No exit_firstperson needed — we stayed in 3rd person
      }
    });

    events.on('start_activity', (data) => {
      const player = this.playerEntity.get(PlayerComp);
      const cost = data.actData.cost || 0;
      if (cost < 0 && player.money + cost < 0) {
        this._showQuickNotif('⚠️ Walang sapat na pera! (Not enough money!)');
        return;
      }
      if (cost < 0) player.money += cost;
      player.currentActivity = data.activityKey;
      const realDuration = data.actData.duration * 10;
      player.activityTimer = realDuration;
      player.activityDuration = realDuration;
      this._showQuickNotif(`🎯 Nagsimula: ${data.actData.name}!`);
    });

    events.on('talk_to_npc', (data) => {
      const { npc, npcTransform } = data;
      const player = this.playerEntity.get(PlayerComp);
      const playerTransform = this.playerEntity.get(TransformComp);

      // Update relationship
      const current = player.relationships[npc.name] || 0;
      const gain = 3 + Math.floor(Math.random() * 4);
      player.relationships[npc.name] = Math.min(100, current + gain);
      npc.relationship = player.relationships[npc.name];

      // NPC stops and faces player briefly
      npc.waitTime = 4;
      if (npcTransform && playerTransform) {
        const dx = playerTransform.x - npcTransform.x;
        const dz = playerTransform.z - npcTransform.z;
        npcTransform.rotY = Math.atan2(dx, dz);
      }

      // Cycle through dialogue lines
      const lines = npc.dialogue && npc.dialogue.length > 0 ? npc.dialogue : ['Kumusta!'];
      npc.dialogueIdx = ((npc.dialogueIdx || 0) + 1) % lines.length;
      events.emit('show_dialogue', {
        name: npc.name,
        text: lines[npc.dialogueIdx],
        relationship: player.relationships[npc.name]
      });
    });
  }

  _activityCategory(key) {
    const MAP = {
      SLEEP:'sleep', GET_HILOT:'sleep', REST:'sleep', GET_SPECIAL_MASSAGE:'sleep',
      EAT_ADOBO:'eat', EAT_SINIGANG:'eat', EAT_LECHON:'eat',
      EAT_ISAW:'eat', EAT_BBQPORK:'eat', EAT_BALUT:'eat', EAT_FOOD_COURT:'eat',
      DRINK:'drink', BUY_DRINKS:'drink', VIP_ROOM:'drink',
      COOK:'cook', SHOWER:'wash',
      WORK:'type', BROWSE_INTERNET:'type', PLAY_GAMES:'type', REPORT_TO_BOSS:'type',
      EXERCISE:'exercise', TRAIN:'exercise',
      SING:'sing', WATCH_SHOW:'sing',
      SOCIALIZE:'chat', CHISMIS:'chat',
      PRAY:'pray', ATTEND_MASS:'pray', LIGHT_CANDLE:'pray',
      READ:'read',
      WATCH_TV:'watch', AIRCON_BREAK:'watch',
      SHOP:'shop', BUY_SNACKS:'shop', BUY_CIGARETTE:'shop', BUY_GROCERIES:'shop',
      GAMBLE:'gamble', PAWN_ITEM:'gamble', BUY_CONTRABAND:'gamble',
    };
    return MAP[key] || 'default';
  }

  _applyActivityPose(mesh, activity, ts) {
    const s = ts * 0.001;
    const lA = mesh.getObjectByName('lArm');
    const rA = mesh.getObjectByName('rArm');
    const lL = mesh.getObjectByName('lLeg');
    const rL = mesh.getObjectByName('rLeg');
    const cat = this._activityCategory(activity);

    // Reset legs unless exercise
    if (lL) lL.rotation.x = 0;
    if (rL) rL.rotation.x = 0;
    mesh.rotation.z = 0;

    switch (cat) {
      case 'sleep':
        mesh.rotation.z = 1.35;
        mesh.position.y = 0.18;
        if (lA) lA.rotation.x = 0.25;
        if (rA) rA.rotation.x = 0.25;
        break;
      case 'eat':
        if (rA) rA.rotation.x = -1.0 + Math.sin(s * 2.5) * 0.4;
        if (lA) lA.rotation.x = -0.2;
        break;
      case 'drink':
        if (rA) rA.rotation.x = -1.3 + Math.sin(s * 1.5) * 0.18;
        if (lA) lA.rotation.x = -0.2;
        break;
      case 'cook':
        if (lA) lA.rotation.x = -0.6 + Math.sin(s * 3.5) * 0.45;
        if (rA) rA.rotation.x = -0.6 - Math.sin(s * 3.5) * 0.45;
        break;
      case 'wash':
        if (lA) lA.rotation.x = -0.5 + Math.sin(s * 4.5) * 0.55;
        if (rA) rA.rotation.x = -0.5 - Math.sin(s * 4.5) * 0.55;
        break;
      case 'type':
        if (lA) lA.rotation.x = -0.75 + Math.sin(s * 9) * 0.04;
        if (rA) rA.rotation.x = -0.75 + Math.sin(s * 9 + 1.3) * 0.04;
        break;
      case 'exercise':
        if (lA) lA.rotation.x =  Math.sin(s * 5.5) * 1.1;
        if (rA) rA.rotation.x = -Math.sin(s * 5.5) * 1.1;
        if (lL) lL.rotation.x = -Math.sin(s * 5.5 + 1) * 0.5;
        if (rL) rL.rotation.x =  Math.sin(s * 5.5 + 1) * 0.5;
        mesh.position.y = Math.abs(Math.sin(s * 5.5)) * 0.16;
        break;
      case 'sing':
        if (lA) lA.rotation.x = -1.0 + Math.sin(s * 2) * 0.28;
        if (rA) rA.rotation.x = -1.0 + Math.sin(s * 2 + 0.9) * 0.28;
        break;
      case 'chat':
        if (lA) lA.rotation.x = -0.3 + Math.sin(s * 1.8) * 0.25;
        if (rA) rA.rotation.x = -0.5 + Math.sin(s * 1.3) * 0.18;
        break;
      case 'pray':
        if (lA) lA.rotation.x = -0.95;
        if (rA) rA.rotation.x = -0.95;
        mesh.rotation.z = 0.06;
        break;
      case 'read':
        if (lA) lA.rotation.x = -0.7;
        if (rA) rA.rotation.x = -0.55;
        break;
      case 'watch':
        if (lA) lA.rotation.x = -0.18;
        if (rA) rA.rotation.x = -0.18;
        break;
      case 'shop':
      case 'gamble':
        if (lA) lA.rotation.x = -0.4 + Math.sin(s * 1.4) * 0.22;
        if (rA) rA.rotation.x = -0.55 + Math.sin(s * 1.1) * 0.18;
        break;
      default:
        if (lA) lA.rotation.x = Math.sin(s * 1.5) * 0.1;
        if (rA) rA.rotation.x = Math.sin(s * 1.5 + 1) * 0.1;
    }
  }

  _resetActivityPose(mesh) {
    if (!mesh) return;
    mesh.rotation.z = 0;
    mesh.position.y = 0;
    for (const name of ['lArm', 'rArm', 'lLeg', 'rLeg']) {
      const b = mesh.getObjectByName(name);
      if (b) b.rotation.x = 0;
    }
  }

  _initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8, 0.65, 0.12
    );
    this.composer.addPass(bloom);
    this.composer.addPass(new OutputPass());
  }

  _showQuickNotif(msg) {
    const notif = document.getElementById('hud-notification');
    if (!notif) return;
    notif.textContent = msg;
    notif.style.display = 'block';
    clearTimeout(notif._t);
    notif._t = setTimeout(() => { notif.style.display = 'none'; }, 2500);
  }

  _loop(timestamp) {
    if (!this.running) return;

    const delta = Math.min((timestamp - this._lastTime) / 1000, 0.1);
    this._lastTime = timestamp;

    // ECS (NPCs, camera, movement, needs, time, interaction)
    this.ecsWorld.update(delta);

    // Traffic
    if (this.trafficSystem) this.trafficSystem.update(delta, null);

    // Rain — shift particles down, wrap at bottom
    if (this.rain) {
      const p = this.rain.geometry.attributes.position.array;
      for (let i = 0; i < p.length; i += 3) {
        p[i + 1] -= delta * 30;
        if (p[i + 1] < 0) {
          p[i + 1] = 55;
          p[i]     = (Math.random() - 0.5) * 260;
          p[i + 2] = (Math.random() - 0.5) * 260;
        }
      }
      this.rain.geometry.attributes.position.needsUpdate = true;
    }

    // Neon flicker — random voltage drops
    if (this.neonLights.length) {
      for (const n of this.neonLights) {
        if (Math.random() < 0.003) {
          const off = Math.random() < 0.3;
          n.light.intensity = off ? 0 : 0.8 + Math.random() * 0.6;
          n.mat.emissiveIntensity = off ? 0 : 1.4 + Math.random() * 0.8;
        }
      }
    }

    // Animate water
    if (this.water) {
      const t = timestamp * 0.001;
      this.water.position.y = 0.15 + Math.sin(t * 0.8) * 0.05;
      this.water.material.opacity = 0.75 + Math.sin(t * 1.2) * 0.1;
    }

    // Animate interior NPCs
    if (this._activeInterior && this._activeInterior.group.visible) {
      const t = timestamp * 0.001;
      for (const dancer of this._activeInterior.dancers || []) {
        dancer.rotation.y += delta * 1.8;
      }
      for (const patron of this._activeInterior.patrons || []) {
        if (patron.head) patron.head.rotation.y = Math.sin(t * 0.35 + patron.phase) * 0.6;
      }
    }

    // Avatar animation — RPM AvatarPlayer takes priority over Mixamo file-based player
    if (this.playerEntity && this.ecsWorld.mixamoLoaded) {
      const transform  = this.playerEntity.get(TransformComp);
      const velocity   = this.playerEntity.get(VelocityComp);
      const playerComp = this.playerEntity.get(PlayerComp);
      const meshComp   = this.playerEntity.get(MeshComp);
      const spd = Math.sqrt(velocity.vx * velocity.vx + velocity.vz * velocity.vz);
      const rotY = meshComp?.mesh?.rotation.y ?? 0;

      if (this.avatarPlayer) {
        // RPM avatar — procedural bone animation
        this.avatarPlayer.syncTo(transform.x, transform.y, transform.z, rotY);
        this.avatarPlayer.update(delta, timestamp, spd, playerComp.currentActivity || null);
      } else if (this.mixamoPlayer) {
        // Mixamo GLB clips
        this.mixamoPlayer.syncTo(transform.x, transform.y, transform.z, rotY);
        if (playerComp.currentActivity) {
          this.mixamoPlayer.playActivity(playerComp.currentActivity);
        } else {
          this.mixamoPlayer.setMovementClip(spd);
        }
        this.mixamoPlayer.update(delta);
      }
    }

    // Activity pose + floating badge (procedural fallback + badge for both modes)
    if (this.playerEntity) {
      const playerComp = this.playerEntity.get(PlayerComp);
      const meshComp   = this.playerEntity.get(MeshComp);
      const transform  = this.playerEntity.get(TransformComp);

      if (playerComp.currentActivity) {
        // Procedural pose only when neither RPM nor Mixamo is loaded
        if (!this.ecsWorld.mixamoLoaded && meshComp?.mesh) {
          this._applyActivityPose(meshComp.mesh, playerComp.currentActivity, timestamp);
        }

        // Floating badge (world-space, shown for both Mixamo and procedural)
        if (this._actBadge && transform) {
          const actData = ACTIVITIES[playerComp.currentActivity];
          const headPos = new THREE.Vector3(transform.x, transform.y + 2.6, transform.z);
          headPos.project(this.camera);
          if (headPos.z < 1) {
            const sx = (headPos.x * 0.5 + 0.5) * window.innerWidth;
            const sy = (-headPos.y * 0.5 + 0.5) * window.innerHeight;
            const bob = Math.sin(timestamp * 0.0022) * 5;
            this._actBadge.style.left = `${sx}px`;
            this._actBadge.style.top = `${sy - 16 + bob}px`;
            if (actData) this._actBadge.textContent = `${actData.emoji} ${actData.name}`;
            this._actBadge.style.display = 'block';
          }
        }
        this._wasDoingActivity = true;
      } else {
        if (this._actBadge) this._actBadge.style.display = 'none';
        if (this._wasDoingActivity && !this.ecsWorld.mixamoLoaded && meshComp?.mesh) {
          this._resetActivityPose(meshComp.mesh);
          this._wasDoingActivity = false;
        }
        if (this._wasDoingActivity && this.ecsWorld.mixamoLoaded) {
          this._wasDoingActivity = false;
        }
      }
    }

    // Player light follows player
    if (this.playerEntity && this.playerLight) {
      const transform = this.playerEntity.get(TransformComp);
      if (transform) this.playerLight.position.set(transform.x, transform.y + 2.5, transform.z);
    }

    // HUD
    if (this.playerEntity) {
      const playerComp = this.playerEntity.get(PlayerComp);
      const needsComp = this.playerEntity.get(NeedsComp);
      let activityName = null;
      if (playerComp.currentActivity && ACTIVITIES[playerComp.currentActivity]) {
        activityName = ACTIVITIES[playerComp.currentActivity].name;
      }
      updateHUD(playerComp, needsComp, this.timeSystem, activityName);
    }

    this.composer.render();
    requestAnimationFrame((t) => this._loop(t));
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    if (this.composer) this.composer.setSize(w, h);
  }
}

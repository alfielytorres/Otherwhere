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
  }

  start() {
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

    setTimeout(() => {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }, 1500);

    this.running = true;
    requestAnimationFrame((t) => this._loop(t));
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

    // Animate interior dancers
    if (this._activeInterior && this._activeInterior.group.visible && this._activeInterior.dancers) {
      for (const dancer of this._activeInterior.dancers) {
        dancer.rotation.y += delta * 1.8;
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

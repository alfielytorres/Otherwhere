import * as THREE from 'three';
import { World } from './core/ECS.js';
import { events } from './core/EventBus.js';
import {
  TransformComp, VelocityComp, MeshComp,
  PlayerComp, NeedsComp, NPCComp, BuildingComp
} from './components/Components.js';
import { generateWorld } from './world/WorldGenerator.js';
import { createPlayer, createNPC } from './world/CharacterFactory.js';
import { MovementSystem } from './systems/MovementSystem.js';
import { CameraSystem } from './systems/CameraSystem.js';
import { NeedsSystem } from './systems/NeedsSystem.js';
import { TimeSystem } from './systems/TimeSystem.js';
import { NPCSystem } from './systems/NPCSystem.js';
import { InteractionSystem } from './systems/InteractionSystem.js';
import { initHUD, updateHUD } from './ui/HUD.js';
import { initActivityMenu } from './ui/ActivityMenu.js';
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
  }

  start() {
    this._initRenderer();
    this._initScene();
    this._initWorld();
    this._initPlayer();
    this._initNPCs();
    this._initBuildings();
    this._initSystems();
    this._initUI();
    this._initEvents();

    // Hide loading screen
    setTimeout(() => {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }, 1500);

    this.running = true;
    requestAnimationFrame((t) => this._loop(t));
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;

    window.addEventListener('resize', () => this._onResize());
  }

  _initScene() {
    this.scene = new THREE.Scene();
    // Manila night — lighter fog so you can see buildings at distance
    this.scene.fog = new THREE.FogExp2(0x0d1a2e, 0.004);
    this.scene.background = new THREE.Color(0x0d1a2e);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    this.camera.position.set(0, 16, 22);
    this.camera.lookAt(0, 0, 0);

    // Generate the world
    const worldResult = generateWorld(this.scene);
    this.water = worldResult.water;
    this.ambientLight = worldResult.ambientLight;
    this.sunLight = worldResult.sunLight;
  }

  _initWorld() {
    this.ecsWorld = new World();
  }

  _initPlayer() {
    const playerMesh = createPlayer('Juan');
    playerMesh.position.set(0, 0, 10);
    this.scene.add(playerMesh);

    this.playerEntity = this.ecsWorld.createEntity(
      new TransformComp(0, 0, 10),
      new VelocityComp(),
      new MeshComp(playerMesh),
      new PlayerComp('Juan'),
      new NeedsComp()
    );
  }

  _initNPCs() {
    const npcStartPositions = [
      [-30, -50], [40, -60], [70, -80], [80, -40], [50, -20],
      [-50, -30], [-70, 0], [-80, 50], [-40, 60], [-20, 80],
      [20, 70], [50, 50], [80, 70], [30, -20], [-20, 30],
      [100, -20], [-100, 20], [0, -70], [60, 30], [-30, 100]
    ];

    for (let i = 0; i < Math.min(NPC_NAMES.length, 8); i++) {
      const name = NPC_NAMES[i];
      const pos = npcStartPositions[i] || [
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      ];

      const npcMesh = createNPC(name);
      npcMesh.position.set(pos[0], 0, pos[1]);
      this.scene.add(npcMesh);

      const npcComp = new NPCComp(name, 'walker');
      npcComp.dialogue = NPC_DIALOGUES[name] || ['Kumusta!'];
      npcComp.targetX = pos[0] + (Math.random() - 0.5) * 40;
      npcComp.targetZ = pos[1] + (Math.random() - 0.5) * 40;

      this.ecsWorld.createEntity(
        new TransformComp(pos[0], 0, pos[1]),
        new MeshComp(npcMesh),
        npcComp
      );
    }
  }

  _initBuildings() {
    for (const bdata of BUILDINGS) {
      this.ecsWorld.createEntity(
        new BuildingComp(bdata)
      );
    }
    // Build detailed 3D interiors placed far away at world X >= INTERIOR_BASE_X
    this.interiors = createInteriors(this.scene, BUILDINGS);
  }

  _initSystems() {
    const movementSystem = new MovementSystem();
    const cameraSystem = new CameraSystem(this.camera);
    const needsSystem = new NeedsSystem();
    this.timeSystem = new TimeSystem(this.scene, this.ambientLight, this.sunLight);
    const npcSystem = new NPCSystem();
    // Start at 22:00 for the grungy nighttime aesthetic
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

  _initUI() {
    initHUD(events);
    initActivityMenu(events);
  }

  _initEvents() {
    events.on('enter_building', (data) => {
      const player = this.playerEntity.get(PlayerComp);
      const transform = this.playerEntity.get(TransformComp);
      const meshComp = this.playerEntity.get(MeshComp);

      player.isInsideBuilding = true;
      player.currentBuilding = data.building;

      // For outdoor buildings (alley, street food), just open the activity menu directly
      if (data.building.isOutdoor) {
        events.emit('show_zone_activities', {
          activityKeys: data.building.activities,
          building: data.building
        });
        return;
      }

      // Save exterior position
      player.exteriorX = transform.x;
      player.exteriorZ = transform.z;

      const interior = this.interiors.get(data.building.id);
      if (interior) {
        interior.group.visible = true; // show this interior's geometry

        // Teleport player to interior entry point
        transform.x = interior.entryPoint.x;
        transform.z = interior.entryPoint.z;

        if (meshComp && meshComp.mesh) {
          meshComp.mesh.position.set(transform.x, transform.y, transform.z);
          meshComp.mesh.visible = false;
        }

        // Set interior bounds for movement clamping
        player.interiorBounds = interior.bounds;

        // Disable fog so the interior is clearly visible
        this._savedFog = this.scene.fog;
        this.scene.fog = null;
        this._activeInterior = interior;

        // Switch to first-person, facing into the room (north / -Z => yaw PI)
        events.emit('enter_firstperson', { facingYaw: Math.PI });
      } else {
        // No interior available — fall back to opening menu directly
        events.emit('show_zone_activities', {
          activityKeys: data.building.activities,
          building: data.building
        });
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
        // Hide interior geometry
        if (this._activeInterior) {
          this._activeInterior.group.visible = false;
          this._activeInterior = null;
        }
        // Restore exterior position
        transform.x = player.exteriorX;
        transform.z = player.exteriorZ;
        if (meshComp && meshComp.mesh) {
          meshComp.mesh.position.set(transform.x, transform.y, transform.z);
          meshComp.mesh.visible = true;
        }
        // Restore fog
        if (this._savedFog !== undefined) {
          this.scene.fog = this._savedFog;
          this._savedFog = undefined;
        }
        events.emit('exit_firstperson');
      }
    });

    events.on('start_activity', (data) => {
      const player = this.playerEntity.get(PlayerComp);
      const needs = this.playerEntity.get(NeedsComp);

      // Check if player can afford it
      const cost = data.actData.cost || 0;
      if (cost < 0 && player.money + cost < 0) {
        this._showQuickNotif('⚠️ Walang sapat na pera! (Not enough money!)');
        return;
      }

      // Deduct cost immediately
      if (cost < 0) {
        player.money += cost;
      }

      // Start the activity
      player.currentActivity = data.activityKey;
      // Duration in game hours * seconds per game hour (60 real seconds per game hour)
      // But we want activities to feel fast: 1 game hour = 10 real seconds
      const realDuration = data.actData.duration * 10;
      player.activityTimer = realDuration;
      player.activityDuration = realDuration;

      this._showQuickNotif(`🎯 Nagsimula: ${data.actData.name}!`);
    });

    events.on('activity_complete', (data) => {
      // HUD handles the notification
    });

    events.on('need_critical', (data) => {
      // HUD handles the warning
    });
  }

  _showQuickNotif(msg) {
    let notif = document.getElementById('hud-notification');
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

    // Update ECS
    this.ecsWorld.update(delta);

    // Animate water
    if (this.water) {
      const t = timestamp * 0.001;
      this.water.position.y = 0.15 + Math.sin(t * 0.8) * 0.05;
      this.water.material.opacity = 0.75 + Math.sin(t * 1.2) * 0.1;
    }

    // Update HUD
    if (this.playerEntity) {
      const playerComp = this.playerEntity.get(PlayerComp);
      const needsComp = this.playerEntity.get(NeedsComp);
      let activityName = null;
      if (playerComp.currentActivity && ACTIVITIES[playerComp.currentActivity]) {
        activityName = ACTIVITIES[playerComp.currentActivity].name;
      }
      updateHUD(playerComp, needsComp, this.timeSystem, activityName);
    }

    // Render
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame((t) => this._loop(t));
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}

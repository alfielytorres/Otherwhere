import { System } from '../core/ECS.js';
import { TransformComp, PlayerComp, MeshComp } from '../components/Components.js';
import { events } from '../core/EventBus.js';
import * as THREE from 'three';

const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

export class CameraSystem extends System {
  constructor(camera) {
    super();
    this.camera = camera;
    this.mode = 'orbit'; // 'orbit' | 'firstperson'

    // Orbit state
    this.yaw = 0;
    this.pitch = 0.55; // ~30 degrees up
    this.distance = 20;
    this._orbitPos = new THREE.Vector3();
    this._lookTarget = new THREE.Vector3();
    this._rightDown = false;
    this._lastX = 0;
    this._lastY = 0;

    // First-person state
    this.fpYaw = Math.PI; // face into room
    this.fpPitch = 0;
    this._isPointerLocked = false;

    // Mouse handlers
    window.addEventListener('mousedown', (e) => {
      if (e.button === 2) { this._rightDown = true; this._lastX = e.clientX; this._lastY = e.clientY; }
    });
    window.addEventListener('mouseup', (e) => { if (e.button === 2) this._rightDown = false; });
    window.addEventListener('mousemove', (e) => {
      if (this.mode === 'orbit' && this._rightDown) {
        const dx = e.clientX - this._lastX;
        const dy = e.clientY - this._lastY;
        this._lastX = e.clientX;
        this._lastY = e.clientY;
        this.yaw -= dx * 0.005;
        this.pitch -= dy * 0.005;
        this.pitch = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, this.pitch));
      } else if (this.mode === 'firstperson' && this._isPointerLocked) {
        this.fpYaw -= e.movementX * 0.002;
        this.fpPitch -= e.movementY * 0.002;
        this.fpPitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.fpPitch));
      }
    });
    window.addEventListener('wheel', (e) => {
      if (this.mode === 'orbit') {
        this.distance = Math.max(5, Math.min(45, this.distance + e.deltaY * 0.03));
      }
    });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('pointerlockchange', () => {
      this._isPointerLocked = document.pointerLockElement === document.body;
    });
    if (!isTouchDevice) {
      document.addEventListener('click', () => {
        if (this.mode === 'firstperson' && !this._isPointerLocked) {
          document.body.requestPointerLock();
        }
      });
    }

    // Touch camera rotation via Pointer Events on the canvas
    // The joystick zone and buttons sit above the canvas (z-index 300) so
    // they naturally steal their own pointer events — no manual exclusion needed.
    if (isTouchDevice) {
      const canvas = document.getElementById('game-canvas');
      if (canvas) {
        let camPtr = null;
        let lastTX = 0;
        let lastTY = 0;

        canvas.addEventListener('pointerdown', (e) => {
          if (camPtr !== null) return;
          e.preventDefault();
          camPtr = e.pointerId;
          canvas.setPointerCapture(e.pointerId);
          lastTX = e.clientX;
          lastTY = e.clientY;
        });

        canvas.addEventListener('pointermove', (e) => {
          if (e.pointerId !== camPtr) return;
          const dx = e.clientX - lastTX;
          const dy = e.clientY - lastTY;
          lastTX = e.clientX;
          lastTY = e.clientY;
          if (this.mode === 'orbit') {
            this.yaw -= dx * 0.005;
            this.pitch -= dy * 0.005;
            this.pitch = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, this.pitch));
          } else if (this.mode === 'firstperson') {
            this.fpYaw -= dx * 0.004;
            this.fpPitch -= dy * 0.004;
            this.fpPitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.fpPitch));
          }
        });

        const _camUp = (e) => { if (e.pointerId === camPtr) camPtr = null; };
        canvas.addEventListener('pointerup', _camUp);
        canvas.addEventListener('pointercancel', _camUp);
      }
    }

    events.on('enter_firstperson', (data) => {
      this.mode = 'firstperson';
      this.fpYaw = data && data.facingYaw !== undefined ? data.facingYaw : Math.PI;
      this.fpPitch = 0;
      if (!isTouchDevice) document.body.requestPointerLock();
      events.emit('camera_mode_changed', { mode: 'firstperson' });
    });
    events.on('exit_firstperson', () => {
      this.mode = 'orbit';
      if (document.pointerLockElement) document.exitPointerLock();
      events.emit('camera_mode_changed', { mode: 'orbit' });
    });
  }

  update(delta, world) {
    const playerEntity = world.queryFirst(TransformComp, PlayerComp);
    if (!playerEntity) return;

    const transform = playerEntity.get(TransformComp);

    if (this.mode === 'firstperson') {
      world.fpMode = true;
      world.fpYaw = this.fpYaw;

      const meshComp = playerEntity.get(MeshComp);
      if (meshComp && meshComp.mesh) meshComp.mesh.visible = false;

      this.camera.position.set(transform.x, transform.y + 1.65, transform.z);
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.y = this.fpYaw;
      this.camera.rotation.x = this.fpPitch;
    } else {
      world.fpMode = false;
      world.cameraYaw = this.yaw;

      const meshComp = playerEntity.get(MeshComp);
      if (meshComp && meshComp.mesh) meshComp.mesh.visible = true;

      // Orbit camera position
      const px = transform.x + this.distance * Math.sin(this.yaw) * Math.cos(this.pitch);
      const py = transform.y + this.distance * Math.sin(this.pitch) + 1.5;
      const pz = transform.z + this.distance * Math.cos(this.yaw) * Math.cos(this.pitch);

      this.camera.position.set(px, py, pz);
      this._lookTarget.set(transform.x, transform.y + 1.5, transform.z);
      this.camera.lookAt(this._lookTarget);
    }
  }
}

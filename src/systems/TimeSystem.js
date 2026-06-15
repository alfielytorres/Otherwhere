import { System } from '../core/ECS.js';
import { events } from '../core/EventBus.js';
import { DAYS_OF_WEEK, MONTHS } from '../data/GameData.js';
import * as THREE from 'three';

export class TimeSystem extends System {
  constructor(scene, ambientLight, sunLight) {
    super();
    this.scene = scene;
    this.ambientLight = ambientLight;
    this.sunLight = sunLight;

    // Start at 8:00 AM on Day 1
    this.gameHours = 8;
    this.gameMinutes = 0;
    this.dayNumber = 1;
    this.dayOfWeek = 1; // 1 = Lunes
    this.monthIndex = 0; // Enero

    // 1 real second = 1 game minute
    // So 60 real seconds = 1 game hour
    this.realSecondsPerGameMinute = 1;
    this._accumulator = 0;
    this._lastHour = -1;
  }

  update(delta, world) {
    this._accumulator += delta;

    while (this._accumulator >= this.realSecondsPerGameMinute) {
      this._accumulator -= this.realSecondsPerGameMinute;
      this.gameMinutes += 1;

      if (this.gameMinutes >= 60) {
        this.gameMinutes = 0;
        this.gameHours += 1;

        if (this.gameHours >= 24) {
          this.gameHours = 0;
          this.dayNumber += 1;
          this.dayOfWeek = (this.dayOfWeek + 1) % 7;
          events.emit('new_day', { dayNumber: this.dayNumber });
        }

        // Emit time change every hour
        events.emit('time_change', {
          hours: this.gameHours,
          minutes: this.gameMinutes,
          dayNumber: this.dayNumber,
          dayOfWeek: this.dayOfWeek
        });

        // Update lighting based on time
        this._updateLighting();
      }
    }
  }

  _updateLighting() {
    const h = this.gameHours;

    if (h >= 6 && h < 8) {
      // Sunrise - warm pink/orange
      if (this.ambientLight) {
        this.ambientLight.color.setHex(0xFFCBA4);
        this.ambientLight.intensity = 0.5;
      }
      if (this.sunLight) {
        this.sunLight.color.setHex(0xFF9966);
        this.sunLight.intensity = 0.7;
        this.sunLight.position.set(80, 30, 50);
      }
      if (this.scene) this.scene.background = new THREE.Color(0xFFAA88);
      if (this.scene && this.scene.fog) this.scene.fog.color.setHex(0xFFAA88);
    } else if (h >= 8 && h < 17) {
      // Day - bright and tropical
      if (this.ambientLight) {
        this.ambientLight.color.setHex(0xFFF5E0);
        this.ambientLight.intensity = 0.7;
      }
      if (this.sunLight) {
        this.sunLight.color.setHex(0xFFE082);
        this.sunLight.intensity = 1.2;
        this.sunLight.position.set(50, 100, 50);
      }
      if (this.scene) this.scene.background = new THREE.Color(0x87CEEB);
      if (this.scene && this.scene.fog) this.scene.fog.color.setHex(0x87CEEB);
    } else if (h >= 17 && h < 19) {
      // Sunset - golden hour
      if (this.ambientLight) {
        this.ambientLight.color.setHex(0xFFAA55);
        this.ambientLight.intensity = 0.5;
      }
      if (this.sunLight) {
        this.sunLight.color.setHex(0xFF7722);
        this.sunLight.intensity = 0.6;
        this.sunLight.position.set(-80, 20, 50);
      }
      if (this.scene) this.scene.background = new THREE.Color(0xFF8844);
      if (this.scene && this.scene.fog) this.scene.fog.color.setHex(0xFF8844);
    } else {
      // Night - dark blue
      if (this.ambientLight) {
        this.ambientLight.color.setHex(0x223355);
        this.ambientLight.intensity = 0.3;
      }
      if (this.sunLight) {
        this.sunLight.color.setHex(0x334488);
        this.sunLight.intensity = 0.1;
        this.sunLight.position.set(50, 100, 50);
      }
      if (this.scene) this.scene.background = new THREE.Color(0x0A0A2E);
      if (this.scene && this.scene.fog) this.scene.fog.color.setHex(0x0A0A2E);
    }
  }

  getTimeString() {
    const h = String(this.gameHours).padStart(2, '0');
    const m = String(this.gameMinutes).padStart(2, '0');
    return `${h}:${m}`;
  }

  getDayString() {
    const day = DAYS_OF_WEEK[this.dayOfWeek] || 'Lunes';
    const month = MONTHS[this.monthIndex] || 'Enero';
    return `${day}, Ika-${this.dayNumber} ng ${month}`;
  }

  get hours() {
    return this.gameHours;
  }
}

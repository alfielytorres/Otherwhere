import { events } from '../core/EventBus.js';

export const touchJoystick = { dx: 0, dz: 0 };

export const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

export function initTouchControls() {
  if (!isTouchDevice) return;

  const style = document.createElement('style');
  style.textContent = `
    #hud-controls { display: none !important; }
    #hud-fp-indicator { display: none !important; }
    #hud-player-panel {
      bottom: auto !important;
      top: 8px !important;
      left: 8px !important;
      padding: 8px 12px !important;
      min-width: 170px !important;
    }
    #hud-interaction-prompt {
      bottom: 200px !important;
    }
    #touch-joystick-zone {
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 120px;
      height: 120px;
      z-index: 200;
      touch-action: none;
    }
    #touch-joystick-base {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: rgba(255,255,255,0.07);
      border: 2px solid rgba(255,255,255,0.22);
    }
    #touch-joystick-thumb {
      position: absolute;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: rgba(252,209,22,0.72);
      border: 2px solid rgba(252,209,22,0.95);
      top: 37px;
      left: 37px;
      pointer-events: none;
    }
    #touch-interact-btn {
      position: fixed;
      bottom: 80px;
      right: 30px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(0,0,0,0.65);
      border: 2px solid rgba(252,209,22,0.45);
      color: rgba(252,209,22,0.5);
      font-family: 'Poppins', sans-serif;
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
      touch-action: none;
      user-select: none;
      pointer-events: auto;
      transition: border-color 0.2s, color 0.2s, background 0.15s;
    }
    #touch-interact-btn.active-prompt {
      border-color: #FCD116;
      color: #FCD116;
      background: rgba(252,209,22,0.15);
    }
    #touch-interact-btn:active {
      background: rgba(252,209,22,0.3);
    }
    #touch-exit-btn {
      position: fixed;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(206,17,38,0.85);
      border: 1px solid #FCD116;
      border-radius: 20px;
      padding: 9px 24px;
      color: white;
      font-family: 'Poppins', sans-serif;
      font-size: 13px;
      font-weight: 600;
      z-index: 200;
      touch-action: none;
      user-select: none;
      pointer-events: auto;
      display: none;
      white-space: nowrap;
      backdrop-filter: blur(4px);
    }
  `;
  document.head.appendChild(style);

  const joystickZone = document.createElement('div');
  joystickZone.id = 'touch-joystick-zone';
  const joystickBase = document.createElement('div');
  joystickBase.id = 'touch-joystick-base';
  const joystickThumb = document.createElement('div');
  joystickThumb.id = 'touch-joystick-thumb';
  joystickBase.appendChild(joystickThumb);
  joystickZone.appendChild(joystickBase);
  document.body.appendChild(joystickZone);

  const interactBtn = document.createElement('div');
  interactBtn.id = 'touch-interact-btn';
  interactBtn.textContent = 'E';
  document.body.appendChild(interactBtn);

  const exitBtn = document.createElement('div');
  exitBtn.id = 'touch-exit-btn';
  exitBtn.textContent = '← Lumabas';
  document.body.appendChild(exitBtn);

  _setupJoystick(joystickZone, joystickThumb);
  _setupButtons(interactBtn, exitBtn);

  events.on('interaction_prompt', (data) => {
    if (data.show) {
      interactBtn.classList.add('active-prompt');
    } else {
      interactBtn.classList.remove('active-prompt');
    }
  });

  events.on('camera_mode_changed', (data) => {
    exitBtn.style.display = data.mode === 'firstperson' ? 'block' : 'none';
  });
}

function _setupJoystick(joystickZone, joystickThumb) {
  const RADIUS = 37;
  let touchId = null;
  let centerX = 0;
  let centerY = 0;

  joystickZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (touchId !== null) return;
    const touch = e.changedTouches[0];
    touchId = touch.identifier;
    const rect = joystickZone.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
    _applyJoystick(touch.clientX, touch.clientY, centerX, centerY, RADIUS, joystickThumb);
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    for (const touch of e.changedTouches) {
      if (touch.identifier === touchId) {
        e.preventDefault();
        _applyJoystick(touch.clientX, touch.clientY, centerX, centerY, RADIUS, joystickThumb);
        break;
      }
    }
  }, { passive: false });

  const _release = (e) => {
    for (const touch of e.changedTouches) {
      if (touch.identifier === touchId) {
        touchId = null;
        touchJoystick.dx = 0;
        touchJoystick.dz = 0;
        joystickThumb.style.left = '37px';
        joystickThumb.style.top = '37px';
        break;
      }
    }
  };
  window.addEventListener('touchend', _release);
  window.addEventListener('touchcancel', _release);
}

function _applyJoystick(cx, cy, centerX, centerY, radius, thumb) {
  let ox = cx - centerX;
  let oy = cy - centerY;
  const dist = Math.sqrt(ox * ox + oy * oy);
  if (dist > radius) {
    ox = (ox / dist) * radius;
    oy = (oy / dist) * radius;
  }
  touchJoystick.dx = ox / radius;
  touchJoystick.dz = oy / radius;
  thumb.style.left = `${37 + ox}px`;
  thumb.style.top = `${37 + oy}px`;
}

function _setupButtons(interactBtn, exitBtn) {
  interactBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', bubbles: true }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE', bubbles: true })), 80);
  }, { passive: false });

  exitBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }));
  }, { passive: false });
}

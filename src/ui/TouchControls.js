import { events } from '../core/EventBus.js';

export const touchJoystick = { dx: 0, dz: 0 };

export const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

export function initTouchControls() {
  if (!isTouchDevice) return;

  // Inject overrides and control styles
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
      bottom: 195px !important;
    }

    /* --- Joystick --- */
    #tc-joy-zone {
      position: fixed;
      bottom: 22px;
      left: 22px;
      width: 128px;
      height: 128px;
      z-index: 300;
      touch-action: none;
      user-select: none;
    }
    #tc-joy-base {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
      border: 2px solid rgba(255,255,255,0.2);
    }
    #tc-joy-thumb {
      position: absolute;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(252,209,22,0.75);
      border: 2px solid rgba(252,209,22,1);
      /* center: (128-52)/2 = 38 */
      top: 38px;
      left: 38px;
      pointer-events: none;
      transition: transform 0.05s;
    }

    /* --- Interact button --- */
    #tc-interact {
      position: fixed;
      bottom: 82px;
      right: 28px;
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: rgba(0,0,0,0.6);
      border: 2px solid rgba(252,209,22,0.35);
      color: rgba(252,209,22,0.4);
      font-family: 'Poppins', sans-serif;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 300;
      touch-action: none;
      user-select: none;
      transition: border-color 0.2s, color 0.2s, background 0.15s;
    }
    #tc-interact.lit {
      border-color: #FCD116;
      color: #FCD116;
      background: rgba(252,209,22,0.12);
      box-shadow: 0 0 16px rgba(252,209,22,0.3);
    }
    #tc-interact:active { background: rgba(252,209,22,0.25); }

    /* --- Exit / ESC button --- */
    #tc-exit {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(206,17,38,0.85);
      border: 1px solid #FCD116;
      border-radius: 20px;
      padding: 9px 26px;
      color: #fff;
      font-family: 'Poppins', sans-serif;
      font-size: 13px;
      font-weight: 600;
      z-index: 300;
      touch-action: none;
      user-select: none;
      display: none;
      white-space: nowrap;
      backdrop-filter: blur(4px);
    }
  `;
  document.head.appendChild(style);

  // --- DOM elements ---
  const joyZone = _el('div', 'tc-joy-zone');
  const joyBase = _el('div', 'tc-joy-base');
  const joyThumb = _el('div', 'tc-joy-thumb');
  joyBase.appendChild(joyThumb);
  joyZone.appendChild(joyBase);
  document.body.appendChild(joyZone);

  const interactBtn = _el('div', 'tc-interact');
  interactBtn.textContent = 'E';
  document.body.appendChild(interactBtn);

  const exitBtn = _el('div', 'tc-exit');
  exitBtn.textContent = '← Lumabas';
  document.body.appendChild(exitBtn);

  // --- Joystick (Pointer Events + setPointerCapture) ---
  const RADIUS = 38; // half of (128-52) = 38
  let joyPtr = null;
  let joyOX = 0, joyOY = 0; // center of zone

  joyZone.addEventListener('pointerdown', (e) => {
    if (joyPtr !== null) return;
    e.preventDefault();
    joyPtr = e.pointerId;
    joyZone.setPointerCapture(e.pointerId);
    const r = joyZone.getBoundingClientRect();
    joyOX = r.left + r.width / 2;
    joyOY = r.top + r.height / 2;
    _moveJoy(e.clientX, e.clientY, joyOX, joyOY, RADIUS, joyThumb);
  });

  joyZone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== joyPtr) return;
    e.preventDefault();
    _moveJoy(e.clientX, e.clientY, joyOX, joyOY, RADIUS, joyThumb);
  });

  const _joyUp = (e) => {
    if (e.pointerId !== joyPtr) return;
    joyPtr = null;
    touchJoystick.dx = 0;
    touchJoystick.dz = 0;
    joyThumb.style.left = '38px';
    joyThumb.style.top = '38px';
  };
  joyZone.addEventListener('pointerup', _joyUp);
  joyZone.addEventListener('pointercancel', _joyUp);

  // --- Interact button ---
  interactBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', bubbles: true }));
    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE', bubbles: true })), 80);
  });

  // --- Exit button ---
  exitBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }));
  });

  // --- Event subscriptions ---
  events.on('interaction_prompt', (data) => {
    interactBtn.classList.toggle('lit', !!data.show);
  });

  events.on('camera_mode_changed', (data) => {
    exitBtn.style.display = data.mode === 'firstperson' ? 'block' : 'none';
  });
}

function _moveJoy(cx, cy, ox, oy, radius, thumb) {
  let dx = cx - ox;
  let dy = cy - oy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > radius) {
    dx = (dx / dist) * radius;
    dy = (dy / dist) * radius;
  }
  touchJoystick.dx = dx / radius;
  touchJoystick.dz = dy / radius;
  thumb.style.left = `${38 + dx}px`;
  thumb.style.top = `${38 + dy}px`;
}

function _el(tag, id) {
  const el = document.createElement(tag);
  el.id = id;
  return el;
}

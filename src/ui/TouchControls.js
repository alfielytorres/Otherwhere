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
      background: rgba(6,10,26,0.35);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1.5px solid rgba(255,255,255,0.1);
      box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    #tc-joy-thumb {
      position: absolute;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: radial-gradient(circle at 40% 35%, rgba(255,220,60,0.85), rgba(252,150,10,0.7));
      border: 1.5px solid rgba(252,209,22,0.8);
      /* center: (128-52)/2 = 38 */
      top: 38px;
      left: 38px;
      pointer-events: none;
      transition: transform 0.05s;
      box-shadow: 0 2px 12px rgba(252,150,10,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
    }

    /* --- Interact button --- */
    #tc-interact {
      position: fixed;
      bottom: 82px;
      right: 28px;
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: rgba(6,10,26,0.45);
      backdrop-filter: blur(16px) saturate(150%);
      -webkit-backdrop-filter: blur(16px) saturate(150%);
      border: 1.5px solid rgba(252,209,22,0.22);
      color: rgba(252,209,22,0.35);
      font-family: 'Poppins', sans-serif;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 300;
      touch-action: none;
      user-select: none;
      transition: border-color 0.2s, color 0.2s, background 0.15s, box-shadow 0.2s;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    #tc-interact.lit {
      border-color: rgba(252,209,22,0.7);
      color: #FCD116;
      background: rgba(252,209,22,0.1);
      box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 16px rgba(252,180,22,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
    }
    #tc-interact:active {
      background: rgba(252,209,22,0.18);
      transform: scale(0.95);
    }

    /* --- Exit / ESC button --- */
    #tc-exit {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(120,5,18,0.42);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid rgba(206,17,38,0.45);
      border-radius: 30px;
      padding: 9px 26px;
      color: rgba(255,255,255,0.9);
      font-family: 'Poppins', sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      z-index: 300;
      touch-action: none;
      user-select: none;
      display: none;
      white-space: nowrap;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
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

  events.on('enter_building', () => { exitBtn.style.display = 'block'; });
  events.on('exit_building', () => { exitBtn.style.display = 'none'; });
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

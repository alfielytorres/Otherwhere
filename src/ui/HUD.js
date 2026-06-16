// HUD - DOM-based UI overlay

function _relLevel(rel) {
  if (rel >= 80) return { label: 'Mahal na Kaibigan', color: '#ff69b4' };
  if (rel >= 60) return { label: 'Malapit na Kaibigan', color: '#9C27B0' };
  if (rel >= 40) return { label: 'Kaibigan', color: '#4CAF50' };
  if (rel >= 20) return { label: 'Kilala', color: '#2196F3' };
  return { label: 'Estranghero', color: '#9E9E9E' };
}

const NEEDS_CONFIG_DISPLAY = [
  { key: 'gutom', label: 'Gutom', emoji: '🍚', color: '#4CAF50' },
  { key: 'lakas', label: 'Lakas', emoji: '⚡', color: '#FFC107' },
  { key: 'lipunan', label: 'Lipunan', emoji: '👥', color: '#2196F3' },
  { key: 'kasiyahan', label: 'Kasiyahan', emoji: '😄', color: '#E91E63' },
  { key: 'kalinisan', label: 'Kalinisan', emoji: '🚿', color: '#00BCD4' },
  { key: 'karera', label: 'Karera', emoji: '💼', color: '#FF9800' }
];

let hudContainer = null;
let playerNameEl = null;
let moneyEl = null;
let needBars = {};
let timeEl = null;
let interactionPromptEl = null;
let activityBarEl = null;
let activityLabelEl = null;
let moodEl = null;
let notificationEl = null;

export function initHUD(eventsInstance) {
  const overlay = document.getElementById('hud-overlay');
  if (!overlay) return;
  overlay.classList.add('visible');

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #hud-player-panel {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(0,0,0,0.75);
      border: 1px solid rgba(252,209,22,0.4);
      border-radius: 12px;
      padding: 14px 18px;
      color: white;
      font-family: 'Poppins', sans-serif;
      min-width: 220px;
      pointer-events: none;
      backdrop-filter: blur(4px);
    }
    #hud-player-name {
      font-size: 14px;
      font-weight: 700;
      color: #FCD116;
      margin-bottom: 2px;
    }
    #hud-money {
      font-size: 13px;
      color: #4CAF50;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .need-row {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      gap: 6px;
    }
    .need-emoji {
      font-size: 12px;
      width: 16px;
    }
    .need-label {
      font-size: 10px;
      width: 62px;
      color: rgba(255,255,255,0.8);
    }
    .need-bar-bg {
      flex: 1;
      height: 8px;
      background: rgba(255,255,255,0.15);
      border-radius: 4px;
      overflow: hidden;
    }
    .need-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    .need-value {
      font-size: 10px;
      color: rgba(255,255,255,0.6);
      width: 28px;
      text-align: right;
    }
    #hud-mood {
      font-size: 18px;
      text-align: center;
      margin-top: 8px;
    }
    #hud-time-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0,0,0,0.75);
      border: 1px solid rgba(135,206,235,0.3);
      border-radius: 10px;
      padding: 10px 16px;
      color: white;
      font-family: 'Poppins', sans-serif;
      text-align: right;
      pointer-events: none;
      backdrop-filter: blur(4px);
    }
    #hud-time {
      font-size: 22px;
      font-weight: 700;
      color: #FCD116;
    }
    #hud-day {
      font-size: 11px;
      color: rgba(255,255,255,0.7);
      margin-top: 2px;
    }
    #hud-interaction-prompt {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      border: 1px solid #FCD116;
      border-radius: 8px;
      padding: 10px 20px;
      color: #FCD116;
      font-family: 'Poppins', sans-serif;
      font-size: 13px;
      text-align: center;
      display: none;
      pointer-events: none;
      backdrop-filter: blur(4px);
      animation: promptPulse 1.5s ease-in-out infinite;
    }
    @keyframes promptPulse {
      0%, 100% { opacity: 0.9; }
      50% { opacity: 1; border-color: #FF9800; }
    }
    #hud-activity-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0,0,0,0.75);
      border: 1px solid rgba(252,209,22,0.4);
      border-radius: 10px;
      padding: 12px 16px;
      color: white;
      font-family: 'Poppins', sans-serif;
      min-width: 180px;
      display: none;
      pointer-events: none;
    }
    #hud-activity-label {
      font-size: 12px;
      color: #FCD116;
      margin-bottom: 6px;
    }
    #hud-activity-bar-bg {
      height: 8px;
      background: rgba(255,255,255,0.15);
      border-radius: 4px;
      overflow: hidden;
    }
    #hud-activity-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #FCD116, #FF9800);
      border-radius: 4px;
      transition: width 0.3s linear;
    }
    #hud-controls {
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(0,0,0,0.6);
      border-radius: 8px;
      padding: 8px 12px;
      color: rgba(255,255,255,0.6);
      font-family: 'Poppins', sans-serif;
      font-size: 10px;
      pointer-events: none;
      line-height: 1.6;
    }
    #hud-notification {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(206,17,38,0.9);
      border: 2px solid #FCD116;
      border-radius: 12px;
      padding: 16px 28px;
      color: white;
      font-family: 'Poppins', sans-serif;
      font-size: 15px;
      text-align: center;
      display: none;
      pointer-events: none;
      z-index: 500;
    }
  `;
  document.head.appendChild(style);

  // Player panel
  const playerPanel = document.createElement('div');
  playerPanel.id = 'hud-player-panel';

  playerNameEl = document.createElement('div');
  playerNameEl.id = 'hud-player-name';
  playerNameEl.textContent = 'Juan';
  playerPanel.appendChild(playerNameEl);

  moneyEl = document.createElement('div');
  moneyEl.id = 'hud-money';
  moneyEl.textContent = '₱50,000';
  playerPanel.appendChild(moneyEl);

  for (const nd of NEEDS_CONFIG_DISPLAY) {
    const row = document.createElement('div');
    row.className = 'need-row';

    const emoji = document.createElement('span');
    emoji.className = 'need-emoji';
    emoji.textContent = nd.emoji;
    row.appendChild(emoji);

    const label = document.createElement('span');
    label.className = 'need-label';
    label.textContent = nd.label;
    row.appendChild(label);

    const barBg = document.createElement('div');
    barBg.className = 'need-bar-bg';
    const barFill = document.createElement('div');
    barFill.className = 'need-bar-fill';
    barFill.style.backgroundColor = nd.color;
    barFill.style.width = '70%';
    barBg.appendChild(barFill);
    row.appendChild(barBg);

    const val = document.createElement('span');
    val.className = 'need-value';
    val.textContent = '70';
    row.appendChild(val);

    playerPanel.appendChild(row);
    needBars[nd.key] = { fill: barFill, val };
  }

  moodEl = document.createElement('div');
  moodEl.id = 'hud-mood';
  moodEl.textContent = '😊';
  playerPanel.appendChild(moodEl);

  document.body.appendChild(playerPanel);

  // Time panel
  const timePanel = document.createElement('div');
  timePanel.id = 'hud-time-panel';

  timeEl = document.createElement('div');
  timeEl.id = 'hud-time';
  timeEl.textContent = '08:00';
  timePanel.appendChild(timeEl);

  const dayEl = document.createElement('div');
  dayEl.id = 'hud-day';
  dayEl.textContent = 'Lunes, Ika-1 ng Enero, Taon 1';
  timePanel.appendChild(dayEl);

  document.body.appendChild(timePanel);

  // Interaction prompt
  interactionPromptEl = document.createElement('div');
  interactionPromptEl.id = 'hud-interaction-prompt';
  interactionPromptEl.textContent = 'Pindutin ang [E] para pumasok';
  document.body.appendChild(interactionPromptEl);

  // Activity panel
  const activityPanel = document.createElement('div');
  activityPanel.id = 'hud-activity-panel';

  activityLabelEl = document.createElement('div');
  activityLabelEl.id = 'hud-activity-label';
  activityLabelEl.textContent = 'Naglalaro...';
  activityPanel.appendChild(activityLabelEl);

  const actBarBg = document.createElement('div');
  actBarBg.id = 'hud-activity-bar-bg';
  activityBarEl = document.createElement('div');
  activityBarEl.id = 'hud-activity-bar-fill';
  activityBarEl.style.width = '0%';
  actBarBg.appendChild(activityBarEl);
  activityPanel.appendChild(actBarBg);

  document.body.appendChild(activityPanel);

  // Controls hint
  const controls = document.createElement('div');
  controls.id = 'hud-controls';
  controls.innerHTML = `WASD / ↑↓←→ Galaw<br>[E] Pumasok / Makipag-ugnayan<br>[ESC] Isara`;
  document.body.appendChild(controls);

  // Notification
  notificationEl = document.createElement('div');
  notificationEl.id = 'hud-notification';
  document.body.appendChild(notificationEl);

  // NPC dialogue bubble
  const dialogueBubble = document.createElement('div');
  dialogueBubble.id = 'hud-dialogue-bubble';
  dialogueBubble.style.cssText = `
    position:fixed;bottom:160px;left:50%;transform:translateX(-50%);
    background:rgba(5,10,20,0.93);border:1.5px solid rgba(252,209,22,0.55);
    border-radius:14px;padding:14px 20px;color:white;
    font-family:'Poppins',sans-serif;min-width:240px;max-width:360px;
    display:none;pointer-events:none;z-index:450;
    backdrop-filter:blur(8px);box-shadow:0 4px 24px rgba(0,0,0,0.6);
  `;
  document.body.appendChild(dialogueBubble);

  eventsInstance.on('show_dialogue', (data) => {
    const n = Math.min(5, Math.floor((data.relationship || 0) / 20));
    const hearts = '❤'.repeat(n) + '♡'.repeat(5 - n);
    const lvl = _relLevel(data.relationship || 0);
    dialogueBubble.innerHTML = `
      <div style="font-size:13px;font-weight:700;color:#FCD116;margin-bottom:3px;">${data.name}</div>
      <div style="font-size:11px;color:${lvl.color};margin-bottom:8px;">${hearts} ${lvl.label} (${data.relationship}/100)</div>
      <div style="font-size:13px;line-height:1.5;">"${data.text}"</div>
    `;
    dialogueBubble.style.display = 'block';
    clearTimeout(dialogueBubble._t);
    dialogueBubble._t = setTimeout(() => { dialogueBubble.style.display = 'none'; }, 3500);
  });

  // First-person exit indicator
  const fpIndicator = document.createElement('div');
  fpIndicator.id = 'hud-fp-indicator';
  fpIndicator.textContent = '[ESC] Lumabas  •  [E] Makipag-ugnayan';
  fpIndicator.style.cssText = `
    position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.7); border: 1px solid rgba(252,209,22,0.5);
    border-radius: 8px; padding: 8px 16px; color: #FCD116;
    font-family: 'Poppins', sans-serif; font-size: 12px;
    display: none; pointer-events: none; z-index: 600; backdrop-filter: blur(4px);
  `;
  document.body.appendChild(fpIndicator);

  // Event listeners
  eventsInstance.on('interaction_prompt', (data) => {
    if (interactionPromptEl) {
      if (data.show) {
        interactionPromptEl.style.display = 'block';
        // New label format from InteractionSystem; fall back to building name.
        interactionPromptEl.textContent = data.label
          || (data.building ? `[E] Pumasok sa ${data.building.name}` : '[E]');
      } else {
        interactionPromptEl.style.display = 'none';
      }
    }
  });

  eventsInstance.on('enter_building', (data) => {
    if (fpIndicator && data.building && !data.building.isOutdoor) {
      fpIndicator.style.display = 'block';
    }
  });
  eventsInstance.on('exit_building', () => {
    if (fpIndicator) fpIndicator.style.display = 'none';
  });

  eventsInstance.on('need_critical', (data) => {
    showNotification(`⚠️ ${data.playerName}'s ${data.need.toUpperCase()} ay napakababa na!`, 3000);
  });

  eventsInstance.on('activity_complete', (data) => {
    if (data.actData) {
      showNotification(`✅ Tapos na: ${data.actData.nameEn}!`, 2000);
    }
    const actPanel = document.getElementById('hud-activity-panel');
    if (actPanel) actPanel.style.display = 'none';
  });
}

function showNotification(msg, duration = 2000) {
  if (!notificationEl) return;
  notificationEl.textContent = msg;
  notificationEl.style.display = 'block';
  clearTimeout(notificationEl._timeout);
  notificationEl._timeout = setTimeout(() => {
    if (notificationEl) notificationEl.style.display = 'none';
  }, duration);
}

export function updateHUD(playerComp, needsComp, timeSystem, activityName = null) {
  if (!playerComp) return;

  if (playerNameEl) {
    playerNameEl.textContent = `👤 ${playerComp.name}`;
  }
  if (moneyEl) {
    moneyEl.textContent = `₱${playerComp.money.toLocaleString()}`;
  }

  if (needsComp) {
    let total = 0;
    for (const nd of NEEDS_CONFIG_DISPLAY) {
      const val = Math.round(needsComp[nd.key] || 0);
      total += val;
      if (needBars[nd.key]) {
        needBars[nd.key].fill.style.width = `${val}%`;
        needBars[nd.key].val.textContent = val;
        // Color warning
        if (val < 20) {
          needBars[nd.key].fill.style.backgroundColor = '#f44336';
        } else if (val < 40) {
          needBars[nd.key].fill.style.backgroundColor = '#FF9800';
        } else {
          needBars[nd.key].fill.style.backgroundColor = NEEDS_CONFIG_DISPLAY.find(n => n.key === nd.key)?.color || '#4CAF50';
        }
      }
    }
    const avg = total / NEEDS_CONFIG_DISPLAY.length;
    if (moodEl) {
      if (avg > 70) moodEl.textContent = '😄 Masaya!';
      else if (avg > 50) moodEl.textContent = '🙂 Sige na';
      else if (avg > 30) moodEl.textContent = '😐 Hindi masaya';
      else moodEl.textContent = '😢 Malungkot';
    }
  }

  if (timeSystem) {
    if (timeEl) timeEl.textContent = timeSystem.getTimeString();
    const dayEl = document.getElementById('hud-day');
    if (dayEl) dayEl.textContent = `${timeSystem.getDayString()}, Taon ${Math.ceil(timeSystem.dayNumber / 365)}`;
  }

  // Activity progress
  if (playerComp.activityTimer > 0 && playerComp.activityDuration > 0) {
    const actPanel = document.getElementById('hud-activity-panel');
    if (actPanel) actPanel.style.display = 'block';
    const progress = ((playerComp.activityDuration - playerComp.activityTimer) / playerComp.activityDuration) * 100;
    if (activityBarEl) activityBarEl.style.width = `${Math.min(100, progress)}%`;
    if (activityLabelEl && activityName) activityLabelEl.textContent = activityName;
  } else {
    const actPanel = document.getElementById('hud-activity-panel');
    if (actPanel) actPanel.style.display = 'none';
  }
}

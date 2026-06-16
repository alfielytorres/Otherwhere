// Activity Menu - Modal dialog for building interactions

import { ACTIVITIES } from '../data/GameData.js';

let overlay = null;
let isOpen = false;
let currentBuilding = null;

export function initActivityMenu(eventsInstance) {
  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #activity-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,8,0.6);
      backdrop-filter: blur(12px) saturate(120%);
      -webkit-backdrop-filter: blur(12px) saturate(120%);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 900;
      font-family: 'Poppins', sans-serif;
    }
    #activity-overlay.open {
      display: flex;
    }
    #activity-modal {
      background: rgba(6, 10, 28, 0.58);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid rgba(252,209,22,0.22);
      border-radius: 22px;
      padding: 28px;
      width: 90%;
      max-width: 560px;
      max-height: 85vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 40px rgba(252,180,22,0.06);
      color: white;
    }
    #activity-modal::-webkit-scrollbar {
      width: 6px;
    }
    #activity-modal::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.05);
    }
    #activity-modal::-webkit-scrollbar-thumb {
      background: rgba(252,209,22,0.4);
      border-radius: 3px;
    }
    #activity-close-btn {
      position: absolute;
      top: 14px;
      right: 16px;
      background: rgba(206,17,38,0.35);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(206,17,38,0.4);
      color: rgba(255,255,255,0.85);
      font-size: 16px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
      transition: background 0.2s, border-color 0.2s;
    }
    #activity-close-btn:hover {
      background: rgba(206,17,38,0.7);
      border-color: #CE1126;
    }
    #activity-building-name {
      font-size: 20px;
      font-weight: 700;
      color: #FCD116;
      margin-bottom: 4px;
    }
    #activity-building-name-en {
      font-size: 13px;
      color: rgba(255,255,255,0.5);
      margin-bottom: 20px;
      font-style: italic;
    }
    #activity-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (min-width: 480px) {
      #activity-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .activity-btn {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 14px 10px;
      cursor: pointer;
      color: white;
      text-align: center;
      transition: all 0.2s;
      font-family: 'Poppins', sans-serif;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .activity-btn:hover {
      background: rgba(252,209,22,0.1);
      border-color: rgba(252,209,22,0.4);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.4), 0 0 12px rgba(252,180,22,0.12);
    }
    .activity-btn:active {
      transform: translateY(0);
    }
    .activity-emoji {
      font-size: 24px;
      margin-bottom: 6px;
    }
    .activity-name {
      font-size: 12px;
      font-weight: 600;
      color: #FCD116;
      margin-bottom: 2px;
    }
    .activity-name-en {
      font-size: 10px;
      color: rgba(255,255,255,0.5);
      margin-bottom: 6px;
    }
    .activity-info {
      font-size: 10px;
      color: rgba(255,255,255,0.7);
    }
    .activity-cost {
      font-size: 11px;
      font-weight: 600;
      margin-top: 4px;
    }
    .activity-cost.free {
      color: #4CAF50;
    }
    .activity-cost.cost {
      color: #FF9800;
    }
    .activity-cost.earn {
      color: #FCD116;
    }
    .activity-desc {
      font-size: 9px;
      color: rgba(255,255,255,0.4);
      margin-top: 4px;
      line-height: 1.3;
    }
    .activity-duration {
      font-size: 9px;
      color: rgba(255,255,255,0.5);
    }
    #activity-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #FCD116, transparent);
      margin: 0 0 20px 0;
    }
    #activity-header-flag {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
    }
    .flag-stripe {
      height: 4px;
      flex: 1;
      border-radius: 2px;
    }
  `;
  document.head.appendChild(style);

  // Create overlay
  overlay = document.createElement('div');
  overlay.id = 'activity-overlay';

  const modal = document.createElement('div');
  modal.id = 'activity-modal';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.id = 'activity-close-btn';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeMenu);
  modal.appendChild(closeBtn);

  // Flag stripes (Philippine inspired)
  const flagHeader = document.createElement('div');
  flagHeader.id = 'activity-header-flag';
  const stripeColors = ['#0038A8', '#CE1126', '#FCD116'];
  for (const c of stripeColors) {
    const stripe = document.createElement('div');
    stripe.className = 'flag-stripe';
    stripe.style.backgroundColor = c;
    flagHeader.appendChild(stripe);
  }
  modal.appendChild(flagHeader);

  // Building name
  const bName = document.createElement('div');
  bName.id = 'activity-building-name';
  bName.textContent = 'Bahay Ko';
  modal.appendChild(bName);

  const bNameEn = document.createElement('div');
  bNameEn.id = 'activity-building-name-en';
  bNameEn.textContent = 'My Home';
  modal.appendChild(bNameEn);

  const divider = document.createElement('div');
  divider.id = 'activity-divider';
  modal.appendChild(divider);

  // Activity grid
  const grid = document.createElement('div');
  grid.id = 'activity-grid';
  modal.appendChild(grid);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // ESC key to close
  window.addEventListener('keydown', (e) => {
    // Capture ESC while the menu is open so it only closes the menu,
    // not exit the whole building (the player stays inside).
    if (e.code === 'Escape' && isOpen) {
      e.stopPropagation();
      closeMenu();
    }
  }, true);

  // Listen for zone activity requests (from interaction zones or outdoor buildings)
  eventsInstance.on('show_zone_activities', (data) => {
    openMenu(data.building, data.activityKeys, eventsInstance);
  });

  function closeMenu() {
    isOpen = false;
    overlay.classList.remove('open');
    // Outdoor "buildings" have no interior — closing means leaving them.
    if (currentBuilding && currentBuilding.isOutdoor) {
      eventsInstance.emit('exit_building', { building: currentBuilding });
    }
    currentBuilding = null;
  }
}

function openMenu(building, activityKeys, eventsInstance) {
  if (!overlay) return;
  isOpen = true;
  currentBuilding = building;

  const keys = activityKeys || (building && building.activities) || [];

  const bNameEl = document.getElementById('activity-building-name');
  const bNameEnEl = document.getElementById('activity-building-name-en');
  const grid = document.getElementById('activity-grid');

  if (bNameEl) bNameEl.textContent = building.name;
  if (bNameEnEl) bNameEnEl.textContent = building.nameEn;

  if (grid) {
    grid.innerHTML = '';

    for (const actKey of keys) {
      const actData = ACTIVITIES[actKey];
      if (!actData) continue;

      const btn = document.createElement('div');
      btn.className = 'activity-btn';

      const emoji = document.createElement('div');
      emoji.className = 'activity-emoji';
      emoji.textContent = actData.emoji;
      btn.appendChild(emoji);

      const name = document.createElement('div');
      name.className = 'activity-name';
      name.textContent = actData.name;
      btn.appendChild(name);

      const nameEn = document.createElement('div');
      nameEn.className = 'activity-name-en';
      nameEn.textContent = actData.nameEn;
      btn.appendChild(nameEn);

      const duration = document.createElement('div');
      duration.className = 'activity-duration';
      duration.textContent = `⏱ ${actData.duration}h`;
      btn.appendChild(duration);

      const costEl = document.createElement('div');
      costEl.className = 'activity-cost';
      if (actData.earnings && actData.earnings > 0) {
        costEl.classList.add('earn');
        costEl.textContent = `+₱${actData.earnings.toLocaleString()}`;
      } else if (actData.cost && actData.cost < 0) {
        costEl.classList.add('cost');
        costEl.textContent = `₱${Math.abs(actData.cost).toLocaleString()}`;
      } else {
        costEl.classList.add('free');
        costEl.textContent = 'LIBRE';
      }
      btn.appendChild(costEl);

      const desc = document.createElement('div');
      desc.className = 'activity-desc';
      desc.textContent = actData.description;
      btn.appendChild(desc);

      btn.addEventListener('click', () => {
        eventsInstance.emit('start_activity', {
          activityKey: actKey,
          actData,
          building
        });
        overlay.classList.remove('open');
        isOpen = false;
        // Outdoor spots have no interior, so picking an activity leaves them.
        // Indoor zones keep the player inside (exit only via ESC).
        if (building && building.isOutdoor) {
          eventsInstance.emit('exit_building', { building });
        }
        currentBuilding = null;
      });

      grid.appendChild(btn);
    }
  }

  overlay.classList.add('open');
}

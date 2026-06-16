// ReadyPlayerMe avatar creator overlay
// Returns a Promise that resolves with the GLB URL (or null if skipped)

export function showCharacterCreator() {
  return new Promise((resolve) => {
    // Overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9999;
      background:#06091a;
      display:flex;flex-direction:column;
      align-items:center;justify-content:flex-start;
      overflow:hidden;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      width:100%;padding:16px 24px;
      display:flex;align-items:center;justify-content:space-between;
      background:rgba(6,9,26,0.95);
      border-bottom:1px solid rgba(252,209,22,0.18);
      box-sizing:border-box;flex-shrink:0;
    `;
    const title = document.createElement('div');
    title.style.cssText = `
      font-family:'Cinzel',serif;font-size:18px;font-weight:700;
      color:#FCD116;letter-spacing:0.08em;
    `;
    title.textContent = 'OTHERWHERE — Gumawa ng Karakter Mo';
    header.appendChild(title);

    const skipBtn = document.createElement('button');
    skipBtn.textContent = 'Laktawan ›';
    skipBtn.style.cssText = `
      background:rgba(255,255,255,0.07);
      border:1px solid rgba(255,255,255,0.18);
      color:rgba(255,255,255,0.7);
      padding:8px 22px;border-radius:30px;cursor:pointer;
      font-family:'Poppins',sans-serif;font-size:13px;font-weight:500;
      transition:all 0.2s;
    `;
    skipBtn.onmouseenter = () => { skipBtn.style.background = 'rgba(255,255,255,0.14)'; };
    skipBtn.onmouseleave = () => { skipBtn.style.background = 'rgba(255,255,255,0.07)'; };
    skipBtn.onclick = () => { cleanup(); resolve(null); };
    header.appendChild(skipBtn);
    overlay.appendChild(header);

    // Hint
    const hint = document.createElement('div');
    hint.style.cssText = `
      font-family:'Poppins',sans-serif;font-size:12px;
      color:rgba(255,255,255,0.45);padding:10px 0 4px;
      letter-spacing:0.03em;flex-shrink:0;
    `;
    hint.textContent = 'I-customize ang iyong avatar, tapos i-click ang "Next" sa loob para i-save.';
    overlay.appendChild(hint);

    // RPM iframe
    const frame = document.createElement('iframe');
    frame.allow = 'camera *; microphone *';
    frame.src = 'https://demo.readyplayer.me/avatar?frameApi&clearColor=06091a';
    frame.style.cssText = `
      width:100%;flex:1;border:none;
      min-height:0;
    `;
    overlay.appendChild(frame);

    document.body.appendChild(overlay);

    function onMessage(e) {
      let data = e.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { return; }
      }
      if (!data) return;

      // RPM sends: { source:'readyplayerme', eventName:'v1.avatar.exported', data:{ url:'...' } }
      if (data.source === 'readyplayerme' && data.eventName === 'v1.avatar.exported') {
        const url = data.data?.url;
        if (url) {
          cleanup();
          resolve(url);
        }
      }
    }

    window.addEventListener('message', onMessage);

    function cleanup() {
      window.removeEventListener('message', onMessage);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
  });
}

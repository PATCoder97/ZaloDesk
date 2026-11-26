(async () => {
  const api = window.__zaloDeskV2;
  if (!api) throw Error('Run ZaloDesk first');
  const initial = api.settings, passed = [];
  const assert = (condition, message) => { if (!condition) throw Error(message); passed.push(message); };
  const icon = () => document.getElementById('zalodesk-sidebar-button');
  const close = () => { for (let i=0; i<4 && document.querySelector('#zalodesk-menu,#zalodesk-dialog'); i++) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); };
  const open = group => { close(); icon().click(); document.querySelector(`[data-group="${group}"]`).click(); };
  const set = (key, value) => { if (api.settings[key] !== value) { open(key === 'motion' ? 'settings' : 'privacy'); document.querySelector(`[data-config="${key}"]`).click(); } };
  const theme = id => { open('appearance'); document.querySelector('[data-group=appearance] .zd-sub .zmenu-item').click(); document.querySelector(`[data-theme="${id}"]`).click(); };
  const avatar = id => { open('privacy'); document.querySelector('[data-avatar-trigger]').click(); document.querySelector(`[data-avatar="${id}"]`).click(); close(); };
  const fixture = document.createElement('div'); fixture.style.cssText = 'position:fixed;left:-10000px;top:0'; fixture.className = 'chat-content';
  fixture.innerHTML = '<div class="chat-message"><div class="card--text">test</div></div><div class="header-title">test</div><div class="zavatar"><img alt="" /></div>';
  document.body.append(fixture);
  try {
    open('privacy');
    assert(document.querySelectorAll('#zalodesk-sidebar-button').length === 1, 'One sidebar icon');
    assert(icon().querySelector('.mmi-icon-wr .internal-icon'), 'Native icon structure');
    assert(document.querySelectorAll('#zalodesk-menu [data-group]').length === 4, 'Four groups');
    const r = document.querySelector('.zd-sub.open').getBoundingClientRect();
    assert(r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, 'Submenu within viewport');
    set('blur', true); assert(getComputedStyle(fixture.querySelector('.card--text')).filter.includes('blur'), 'Message blur applies');
    set('blur', false); assert(getComputedStyle(fixture.querySelector('.card--text')).filter === 'none', 'Message blur removed');
    set('names', true); assert(getComputedStyle(fixture.querySelector('.header-title')).filter.includes('blur'), 'Names hidden');
    avatar('default'); set('avatars', true); assert(getComputedStyle(fixture.querySelector('img')).opacity === '0', 'Avatar image hidden');
    const mask = getComputedStyle(fixture.querySelector('.zavatar'), '::after');
    assert(mask.borderRadius === '50%' && mask.backgroundImage.includes('https://zchat.vn/zalo-avatar/no-user.webp'), 'Avatar mask uses the requested image and circular shape');
    const singleImage = mask.backgroundImage;
    fixture.querySelector('.zavatar').classList.add('zavatar-multi');
    assert(getComputedStyle(fixture.querySelector('.zavatar'), '::after').backgroundImage === singleImage, 'Chosen image applies to group avatars too');
    set('typing', true); set('seen', true);
    assert(api.shouldBlock('https://chat.zalo.me/api/group/typing?x=1'), 'Group typing path blocked');
    assert(api.shouldBlock(new URL('https://chat.zalo.me/api/e2ee/pc/t/message/seen')), 'E2EE seen path blocked');
    assert(!api.shouldBlock('https://chat.zalo.me/api/message/sms') && !api.shouldBlock('https://chat.zalo.me/api/message/delivered'), 'Send and delivered paths untouched');
    let blocked = false; try { await fetch('http://127.0.0.1:8315/api/message/typing'); } catch (e) { blocked = e.name === 'AbortError'; }
    assert(blocked, 'Fetch request blocked before network');
    const xhr = new XMLHttpRequest(); xhr.open('POST', 'http://127.0.0.1:8315/api/message/seenv2');
    const aborted = new Promise(resolve => { xhr.onabort = () => resolve(true); setTimeout(() => resolve(false), 1000); }); xhr.send();
    assert(await aborted, 'XHR notifies callers of cancellation');
    let unrelatedBlocked = false;
    try { await fetch('data:text/plain,ok'); } catch (e) { unrelatedBlocked = e.name === 'AbortError'; }
    assert(!unrelatedBlocked, 'Unrelated fetch is not blocked by ZaloDesk (Zalo CSP may reject it)');
    set('typing', false); set('seen', false); assert(!api.shouldBlock('https://chat.zalo.me/api/message/seenv2'), 'Disabling blocking restores route');
    theme('sakura'); assert(document.querySelectorAll('#zalodesk-dialog [data-theme]').length === 6, 'Six theme previews');
    assert(getComputedStyle(fixture).backgroundColor === 'rgb(255, 240, 245)', 'Theme changes chat background');
    assert(JSON.parse(localStorage.getItem('zalodesk.settings.v2')).theme === 'sakura', 'Theme persisted');
    theme('default'); assert(!document.getElementById('zalodesk-theme').textContent, 'Default removes theme overrides');
    close(); icon().remove(); await new Promise(resolve => setTimeout(resolve, 500)); assert(!!icon(), 'Sidebar icon restored');
    close(); assert(!document.getElementById('zalodesk-menu') && !document.getElementById('zalodesk-dialog'), 'Escape closes overlays');
    return { passed };
  } finally {
    fixture.remove(); avatar(initial.avatar); for (const key of ['blur', 'names', 'avatars', 'typing', 'seen', 'motion']) set(key, initial[key]); theme(initial.theme); close();
  }
})();

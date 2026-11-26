(async () => {
  const api = window.__zaloDeskV2, initial = api.settings, passed = [];
  const assert = (condition, text) => { if (!condition) throw Error(text); passed.push(text); };
  const close = () => { for (let i=0; i<4 && document.querySelector('#zalodesk-menu,#zalodesk-dialog'); i++) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); };
  function open() {
    close(); document.getElementById('zalodesk-sidebar-button').click();
    document.querySelector('[data-group=privacy]').click(); document.querySelector('[data-avatar-trigger]').click();
  }
  try {
    open();
    assert(!document.getElementById('zalodesk-dialog'), 'Avatar selection opens no popup');
    assert(document.querySelector('.zd-avatar-menu').classList.contains('open'), 'Avatar submenu opens inline');
    const choices = [...document.querySelectorAll('[data-avatar]')];
    assert(choices.length === 6, 'Exactly six requested avatars');
    assert(choices[0].querySelector('img').src === 'https://zchat.vn/zalo-avatar/no-user.webp', 'Original default URL');
    assert(choices[5].querySelector('img').src.startsWith('https://media.istockphoto.com/id/2014684899/'), 'Original female avatar URL');
    const r = document.querySelector('.zd-avatar-menu').getBoundingClientRect();
    assert(r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, 'Nested submenu stays on screen');
    document.querySelector('[data-avatar=conan]').click();
    assert(api.settings.avatar === 'conan' && api.settings.avatars, 'One click selects Conan and enables replacement');
    assert(document.getElementById('zalodesk-visual').textContent.includes('https://zchat.vn/zalo-avatar/conan.jpg'), 'Conan image used for replacement');
    assert(document.querySelectorAll('.zd-avatar-choice[aria-checked=true]').length === 1, 'Exactly one selection mark');
    assert(JSON.parse(localStorage.getItem('zalodesk.settings.v2')).avatar === 'conan', 'Choice saved');
    const trigger = document.querySelector('[data-avatar-trigger]');
    document.querySelector('[data-avatar=conan]').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    assert(trigger.getAttribute('aria-expanded') === 'false' && document.activeElement === trigger, 'Left arrow returns to privacy menu');
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    assert(trigger.getAttribute('aria-expanded') === 'true', 'Right arrow opens avatar menu');
    const imageLoads = await Promise.all(choices.map(async el => {
      const img = el.querySelector('img');
      const loaded = await Promise.race([img.decode().then(() => true, () => false), new Promise(resolve => setTimeout(() => resolve(false), 2500))]);
      return { id: el.dataset.avatar, loaded };
    }));
    return { passed, imageLoads };
  } finally {
    open(); document.querySelector(`[data-avatar="${initial.avatar}"]`).click();
    if (api.settings.avatars !== initial.avatars) document.querySelector('[data-config=avatars]').click();
    close();
  }
})();

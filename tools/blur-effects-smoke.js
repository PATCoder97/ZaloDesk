(() => {
  const api = window.__zaloDeskV2, original = api.settings, passed = [];
  const assert = (ok, message) => { if (!ok) throw new Error(message); passed.push(message); };
  const close = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  const open = () => { close(); close(); document.getElementById('zalodesk-sidebar-button').click(); document.querySelector('[data-group=privacy]').click(); };
  const toggle = key => document.querySelector(`[data-config=${key}]`).click();
  const choose = value => { const select = document.querySelector('[data-config=blurEffect]'); select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })); };
  const fixture = document.createElement('div'); fixture.style.cssText = 'position:fixed;left:-2000px';
  fixture.innerHTML = '<div class="conv-item"><div class="conv-item-body">Private preview</div></div><div class="chat-message"><div class="message-action"><div class="card--text">Private message</div><div class="card-send-time">12:00</div></div></div>';
  document.body.append(fixture);
  try {
    if (api.settings.privacyPaused) document.dispatchEvent(new KeyboardEvent('keydown', {key:'P',ctrlKey:true,shiftKey:true,bubbles:true}));
    open(); for (const key of ['blur', 'blurList']) if (!api.settings[key]) toggle(key);
    for (const effect of ['soft', 'telegram', 'mosaic', 'lorem', 'solid']) {
      choose(effect);
      assert(api.settings.blurEffect === effect && JSON.parse(localStorage.getItem('zalodesk.settings.v2')).blurEffect === effect, effect + ' selected and saved');
      for (const selector of ['.conv-item-body', '.card--text']) {
        const filter = getComputedStyle(fixture.querySelector(selector)).filter;
        assert(effect === 'lorem' ? filter === 'none' : effect === 'soft' ? filter.includes('blur(') : filter.includes('zalodesk-' + effect), effect + ' covers ' + selector);
      }
      assert(getComputedStyle(fixture.querySelector('.card-send-time')).filter === 'none', effect + ' keeps time readable');
    }
    assert(document.querySelector('#zalodesk-mosaic feTile') && document.querySelector('#zalodesk-telegram feImage'), 'Both effect pipelines mounted');
    close(); open(); assert(document.querySelector('[data-config=blurEffect]').value === 'solid', 'Reopened menu remembers selection');
  } finally {
    choose(original.blurEffect);
    for (const key of ['blur', 'blurList']) if (api.settings[key] !== original[key]) toggle(key);
    if (api.settings.privacyPaused !== original.privacyPaused) document.dispatchEvent(new KeyboardEvent('keydown', {key:'P',ctrlKey:true,shiftKey:true,bubbles:true}));
    fixture.remove(); close(); close();
  }
  return { passed };
})();

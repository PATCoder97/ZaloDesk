(async () => {
  const api = window.__zaloDeskV2, original = api.settings.blurEffect;
  const close = () => { for (let i = 0; i < 5; i++) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); };
  close(); document.getElementById('zalodesk-sidebar-button').click(); document.querySelector('[data-group=privacy]').click();
  const select = document.querySelector('[data-config=blurEffect]');
  const choose = value => { select.value = value; select.dispatchEvent(new Event('change')); };
  try {
    choose('telegram');
    const image = document.querySelector('#zalodesk-telegram feImage');
    const initial = image.getAttribute('href');
    await new Promise(resolve => setTimeout(resolve, 220));
    const paused = document.hidden || !api.settings.motion || matchMedia('(prefers-reduced-motion: reduce)').matches;
    if ((image.getAttribute('href') === initial) !== paused) throw new Error('Particle animation does not match motion preference');
    if (document.querySelector('#zalodesk-mosaic feDisplacementMap') || document.querySelector('#zalodesk-mosaic feComposite')) throw new Error('Square cover still samples source pixels');
    return { passed: ['Particle motion respects motion preference', 'Square cover is independent of source pixels'] };
  } finally { choose(original); close(); }
})();

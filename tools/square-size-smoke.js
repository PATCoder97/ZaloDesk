(() => {
  const api = window.__zaloDeskV2, original = api.settings;
  const close = () => { for (let i = 0; i < 5; i++) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); };
  close(); document.getElementById('zalodesk-sidebar-button').click(); document.querySelector('[data-group=privacy]').click();
  const select = document.querySelector('[data-config=blurEffect]'), slider = document.querySelector('#zalodesk-menu input[type=range]');
  const choose = value => { select.value = value; select.dispatchEvent(new Event('change')); };
  const level = value => { slider.value = value; slider.dispatchEvent(new Event('input')); };
  const passed = [];
  try {
    choose('mosaic');
    for (const size of [2, 8, 20]) {
      level(size);
      const tile = document.querySelector('#zalodesk-mosaic feImage');
      if (Number(tile.getAttribute('width')) !== size * 8 || Number(tile.getAttribute('height')) !== size * 8) throw new Error('Incorrect tile size');
      if (!document.querySelector('[data-strength-value]').textContent.includes(`${size} × ${size}px`)) throw new Error('Incorrect size label');
      if (JSON.parse(localStorage.getItem('zalodesk.settings.v2')).blurLevel !== size) throw new Error('Size not saved');
      passed.push(`Slider updates square size to ${size}px and saves immediately`);
    }
  } finally { level(original.blurLevel); choose(original.blurEffect); close(); }
  return { passed };
})();

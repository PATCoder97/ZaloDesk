(() => {
  const passed = [], assert = (condition, message) => { if (!condition) throw Error(message); passed.push(message); };
  const escape = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  const close = () => { for (let i=0; i<4 && document.querySelector('#zalodesk-menu,#zalodesk-dialog'); i++) escape(); };
  const open = () => { close(); document.getElementById('zalodesk-sidebar-button').click(); };
  try {
    open();
    const menu = document.getElementById('zalodesk-menu'), mainStyle = getComputedStyle(menu);
    assert(menu.classList.contains('popover-v3') && mainStyle.borderRadius === '8px' && mainStyle.padding === '8px', 'Native popover class, radius and padding');
    const row = menu.querySelector('[data-group=privacy]'), rowStyle = getComputedStyle(row);
    assert(rowStyle.height === '36px' && rowStyle.marginTop === '4px' && rowStyle.borderRadius === '4px', 'Native menu row height, spacing and radius');
    row.click(); const sub = row.querySelector('.zd-sub'), subStyle = getComputedStyle(sub);
    assert(subStyle.borderRadius === '8px' && subStyle.boxShadow === mainStyle.boxShadow, 'All menu tiers share native shadow and radius');
    assert(subStyle.fontFamily === mainStyle.fontFamily && subStyle.color === mainStyle.color, 'All menu tiers inherit native font and color');
    const toggle = sub.querySelector('.zd-switch');
    assert(getComputedStyle(toggle).width === '30px' && getComputedStyle(toggle, '::after').width === '13px', 'Pill switch with visible thumb, independent of icon fonts');
    sub.querySelector('[data-avatar-trigger]').click();
    escape(); assert(!!document.getElementById('zalodesk-menu') && sub.classList.contains('open') && !sub.querySelector('.zd-avatar-menu').classList.contains('open'), 'Escape closes only deepest menu');
    escape(); assert(!!document.getElementById('zalodesk-menu') && !sub.classList.contains('open'), 'Escape returns to main menu');
    escape(); assert(!document.getElementById('zalodesk-menu'), 'Escape then closes main menu');
    open(); document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); assert(!document.getElementById('zalodesk-menu'), 'Outside pointer dismisses menu');
    open(); document.querySelector('[data-group=appearance]').click(); document.querySelector('[data-group=appearance] .zd-sub .zmenu-item').click();
    const dialog = document.getElementById('zalodesk-dialog'), sheet = dialog.querySelector('.zd-sheet');
    assert(dialog.classList.contains('zl-modal') && sheet.classList.contains('zl-modal__dialog'), 'Native modal structure');
    assert(getComputedStyle(sheet).borderRadius === '4px' && getComputedStyle(dialog.querySelector('header')).height === '48px', 'Native dialog radius and header height');
    assert(getComputedStyle(dialog.querySelector('h2')).fontSize === '16px', 'Native dialog title size');
    assert(getComputedStyle(dialog.querySelector('.zd-done')).height === '32px', 'Native medium action button');
    assert(dialog.contains(document.activeElement), 'Focus enters dialog');
    const controls = [...dialog.querySelectorAll('button')]; controls.at(-1).focus();
    controls.at(-1).dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })); assert(document.activeElement === controls[0], 'Focus cycles inside dialog');
    const r = sheet.getBoundingClientRect(); assert(r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, 'Dialog fits viewport');
    dialog.querySelector('.zd-done').click(); assert(!document.getElementById('zalodesk-dialog') && document.activeElement.id === 'zalodesk-sidebar-button', 'Done closes dialog and restores focus');
    return { passed };
  } finally { close(); }
})();

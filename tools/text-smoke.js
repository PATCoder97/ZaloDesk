(() => {
  const passed = [], assert = (ok, text) => { if (!ok) throw Error(text); passed.push(text); };
  const close = () => { for (let i=0; i<4 && document.querySelector('#zalodesk-menu,#zalodesk-dialog'); i++) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); };
  const open = () => { close(); document.getElementById('zalodesk-sidebar-button').click(); };
  try {
    open();
    const groups = [...document.querySelectorAll('[data-group] > .zd-label')].map(e => e.textContent);
    assert(JSON.stringify(groups) === JSON.stringify(['Riêng tư', 'Giao diện', 'Công cụ', 'Cài đặt']), 'All four group names retain Vietnamese accents');
    assert(window.__zaloDeskV2.signature === 'Riêng tư|Giao diện|Công cụ|Cài đặt', 'Runtime encoding signature matches UTF-8 source');
    const text = document.getElementById('zalodesk-menu').textContent;
    assert(!/[?\uFFFD]/.test(text), 'No question marks or replacement characters in menu text');
    assert(text.includes('Chặn “đang soạn tin”') && text.includes('Thay avatar hiển thị') && text.includes('Mặc định'), 'Nested menu accents and quotation marks preserved');
    document.querySelector('[data-group=appearance]').click(); document.querySelector('[data-group=appearance] .zd-sub .zmenu-item').click();
    const dialogText = document.getElementById('zalodesk-dialog').textContent;
    assert(dialogText.includes('Giao diện ZaloDesk') && dialogText.includes('Tự động lưu thay đổi') && !/[?\uFFFD]/.test(dialogText), 'Popup Vietnamese text preserved');
    return { passed };
  } finally { close(); }
})();

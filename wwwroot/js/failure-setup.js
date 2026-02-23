(() => {
  const textarea = document.getElementById('failure-poi-list');
  if (!textarea) {
    return;
  }

  const initialDefault = (textarea.dataset.default || textarea.value || '').trim();
  if (initialDefault.length > 0) {
    textarea.dataset.default = initialDefault;
    textarea.value = initialDefault;
  }

  const loadButton = document.querySelector('#panelD15 .fs-load');
  if (loadButton) {
    loadButton.addEventListener('click', () => {
      const defaultValue = (textarea.dataset.default || '').trim();
      if (defaultValue.length > 0) {
        textarea.value = defaultValue;
      }
    });
  }
})();

(() => {
  const textarea = document.getElementById('failure-poi-list');
  if (!textarea) {
    return;
  }
  const statusEl = document.querySelector('#panelD15 .fs-status');
  const setStatus = (message, isValid) => {
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message;
    statusEl.style.color = isValid ? '#15803d' : '#b91c1c';
  };

  const isValidFailureJson = (value) => {
    const raw = (value || '').trim();
    if (raw.length === 0) {
      return false;
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) || (parsed && typeof parsed === 'object');
    } catch {
      return false;
    }
  };

  const isValidList = (value) => {
    const raw = (value || '').trim();
    if (raw.length === 0) {
      return false;
    }
    if (!raw.endsWith(';')) {
      return false;
    }
    const parts = raw.split(';');
    const tokens = parts.slice(0, -1).map((item) => item.trim());
    if (tokens.length === 0) {
      return false;
    }
    return tokens.every((item) => item.length > 0);
  };

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

  const validateButton = document.querySelector('#panelD15 .fs-validate');
  if (validateButton) {
    validateButton.addEventListener('click', () => {
      const rawValue = textarea.value;
      if (isValidFailureJson(rawValue)) {
        setStatus('Valid failure JSON block.', true);
        return;
      }

      const isValid = isValidList(rawValue);
      setStatus(isValid ? 'Valid list (each item ends with ;)' : 'Invalid format: provide valid failure JSON or a semicolon-separated POI list.', isValid);
    });
  }

  const clearButton = document.querySelector('#panelD15 .fs-clear');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      textarea.value = '';
      setStatus('Cleared', false);
    });
  }
})();

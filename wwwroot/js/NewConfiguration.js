(() => {
  const hazardLabels = {
    1: 'Earthquake',
    2: 'Heat wave',
    4: 'Extreme precipitation',
  };

  const init = () => {
    const hazardSelect = document.getElementById('haztypeId');
    const descriptionInput = document.getElementById('configurationDescription');
    const editor = document.getElementById('configurationJson');
    const status = document.getElementById('newConfigStatus');
    const jsonStatus = document.getElementById('newConfigJsonStatus');
    const saveButton = document.getElementById('saveConfigurationButton');

    if (!hazardSelect || !descriptionInput || !editor || !status || !jsonStatus || !saveButton) {
      return;
    }

    document.body.classList.add('new-configuration-body');
    document.body.classList.add('has-bottom-bar');

    if (typeof window.showHomeDashboard !== 'function') {
      window.showHomeDashboard = (section, subSection) => {
        const params = new URLSearchParams();
        params.set('tab', 'tabB0-tab');
        if (section) {
          params.set('section', section);
        }
        if (subSection) {
          params.set('subSection', subSection);
        }
        window.location.href = section || subSection ? `/Index?${params.toString()}` : '/';
      };
    }

    if (typeof window.selectTab !== 'function') {
      window.__mcStandaloneNavigation = window.__mcStandaloneNavigation || {};
      window.selectTab = (tabId) => {
        window.__mcStandaloneNavigation.tab = tabId;
      };
    }

    if (typeof window.updateBreadcrumb !== 'function') {
      window.updateBreadcrumb = (section, subSection) => {
        const params = new URLSearchParams();
        params.set('tab', window.__mcStandaloneNavigation?.tab || 'tabB0-tab');
        if (section) {
          params.set('section', section);
        }
        if (subSection) {
          params.set('subSection', subSection);
        }
        window.location.href = `/Index?${params.toString()}`;
      };
    }

    const setStatus = (message, kind = 'info') => {
      status.textContent = message;
      status.className = `new-config-status alert mb-3 alert-${kind}`;
    };

    const ensurePopupStyles = () => {
      if (document.getElementById('new-config-popup-style')) {
        return;
      }

      const style = document.createElement('style');
      style.id = 'new-config-popup-style';
      style.textContent = `
.new-config-popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.new-config-popup {
  width: min(460px, 92vw);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.3);
  overflow: hidden;
}
.new-config-popup__header {
  padding: 16px 20px 10px;
}
.new-config-popup__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}
.new-config-popup__body {
  padding: 0 20px 20px;
  color: #334155;
  line-height: 1.55;
  white-space: pre-wrap;
}
.new-config-popup__actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 20px 20px;
}
.new-config-popup__button {
  min-width: 110px;
}
.new-config-popup--success .new-config-popup__title {
  color: #166534;
}
.new-config-popup--error .new-config-popup__title {
  color: #b91c1c;
}`;
      document.head.appendChild(style);
    };

    const showPopup = ({ title, message, kind = 'success' }) => {
      ensurePopupStyles();

      const backdrop = document.createElement('div');
      backdrop.className = 'new-config-popup-backdrop';

      const popup = document.createElement('div');
      popup.className = `new-config-popup new-config-popup--${kind}`;

      const header = document.createElement('div');
      header.className = 'new-config-popup__header';

      const heading = document.createElement('h2');
      heading.className = 'new-config-popup__title';
      heading.textContent = title;

      const body = document.createElement('div');
      body.className = 'new-config-popup__body';
      body.textContent = message;

      const actions = document.createElement('div');
      actions.className = 'new-config-popup__actions';

      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'btn btn-primary new-config-popup__button';
      closeButton.textContent = 'OK';

      header.appendChild(heading);
      actions.appendChild(closeButton);
      popup.append(header, body, actions);
      backdrop.appendChild(popup);
      document.body.appendChild(backdrop);

      const cleanup = () => {
        document.removeEventListener('keydown', onKeyDown);
        backdrop.remove();
      };

      const onKeyDown = (event) => {
        if (event.key === 'Escape' || event.key === 'Enter') {
          event.preventDefault();
          cleanup();
        }
      };

      closeButton.addEventListener('click', cleanup);
      backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) {
          cleanup();
        }
      });
      document.addEventListener('keydown', onKeyDown);
      closeButton.focus();
    };

    const toggleBusy = (busy) => {
      saveButton.disabled = busy;
      hazardSelect.disabled = busy;
      descriptionInput.readOnly = busy;
      if (editor._cmEditor) {
        editor._cmEditor.setOption('readOnly', busy);
      } else {
        editor.readOnly = busy;
      }
    };

    const prettyJson = (value) => JSON.stringify(value, null, 2);

    const getEditorValue = () => {
      if (editor._cmEditor) {
        return editor._cmEditor.getValue() ?? '';
      }
      return editor.value ?? '';
    };

    const parseJson = () => {
      const raw = getEditorValue().trim();
      if (!raw) {
        throw new Error('Please enter a configuration before saving.');
      }

      return JSON.parse(raw);
    };

    const getFriendlyLoadError = () => {
      return 'We could not load the default configuration for the selected hazard type. Please try again.';
    };

    const getFriendlySaveError = (reason) => {
      if (!reason) {
        return 'We could not save this configuration right now. Please check the information and try again.';
      }

      return `We could not save this configuration.\n\nReason: ${reason}`;
    };

    const getFriendlyReason = (rawMessage) => {
      if (!rawMessage) {
        return '';
      }

      const message = rawMessage.toString().trim();
      if (!message) {
        return '';
      }

      try {
        const parsed = JSON.parse(message);
        const candidate =
          parsed?.message ??
          parsed?.detail ??
          parsed?.error ??
          parsed?.title ??
          '';
        if (typeof candidate === 'string' && candidate.trim()) {
          return candidate.trim();
        }
      } catch {
        // Keep the original text when it is not JSON.
      }

      return message
        .replace(/^ws\d+\s+error[:\s-]*/i, '')
        .replace(/^error[:\s-]*/i, '')
        .trim();
    };

    const setJsonValidity = (isValid) => {
      const dot = jsonStatus.querySelector('.dep-status-dot');
      const text = jsonStatus.querySelector('.dep-status-text');
      if (!dot || !text) {
        return;
      }

      if (isValid) {
        dot.classList.add('dep-status-dot--valid');
        text.classList.add('dep-status-text--valid');
        text.classList.remove('dep-status-text--invalid');
        text.textContent = 'Valid JSON';
      } else {
        dot.classList.remove('dep-status-dot--valid');
        text.classList.remove('dep-status-text--valid');
        text.classList.add('dep-status-text--invalid');
        text.textContent = 'Syntax Error';
      }
    };

    const syncEditorStatus = () => {
      try {
        JSON.parse(getEditorValue());
        setJsonValidity(true);
      } catch {
        setJsonValidity(false);
      }
    };

    const setEditorValue = (value) => {
      const formatted = prettyJson(value);
      if (editor._cmEditor) {
        editor._cmEditor.setValue(formatted);
      } else {
        editor.value = formatted;
      }
      syncEditorStatus();
    };

    const extractPayload = (payload) => {
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return { description: '', json: payload };
      }

      const description =
        typeof payload.description === 'string' ? payload.description :
        typeof payload.config_description === 'string' ? payload.config_description :
        '';

      const candidateKeys = ['configuration', 'config', 'json', 'payload', 'vulnerability', 'default_configuration'];
      const configKey = candidateKeys.find((key) => payload[key] !== undefined);
      if (configKey) {
        return {
          description,
          json: payload[configKey]
        };
      }

      return {
        description,
        json: payload
      };
    };

    if (typeof CodeMirror !== 'undefined') {
      const codeEditor = CodeMirror.fromTextArea(editor, {
        mode: { name: 'javascript', json: true },
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 2,
        tabSize: 2,
        gutters: ['CodeMirror-lint-markers'],
        lint: true
      });
      editor._cmEditor = codeEditor;
      editor.style.display = 'none';
      codeEditor.on('change', syncEditorStatus);
      syncEditorStatus();
    }

    const currentHaztypeId = () => Number.parseInt(hazardSelect.value, 10);

    const loadConfiguration = async () => {
      const haztypeId = currentHaztypeId();
      const label = hazardLabels[haztypeId] ?? `Hazard ${haztypeId}`;

      toggleBusy(true);
      setStatus(`Loading default configuration for ${label}...`, 'info');

      try {
        const response = await fetch(`/api/ConfigVulnProxy/ws27?haztype_id=${encodeURIComponent(haztypeId)}`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
          cache: 'no-cache',
        });

        const responseText = await response.text();
        if (!response.ok) {
          throw new Error(responseText || `WS27 returned ${response.status}.`);
        }

        const payload = responseText ? JSON.parse(responseText) : {};
        const extracted = extractPayload(payload);
        descriptionInput.value = extracted.description;
        setEditorValue(extracted.json);
        setStatus(`Default configuration for ${label} loaded successfully.`, 'success');
      } catch (error) {
        console.error('[WS27] load error', error);
        setStatus(getFriendlyLoadError(), 'danger');
      } finally {
        toggleBusy(false);
      }
    };

    const saveConfiguration = async () => {
      const haztypeId = currentHaztypeId();
      const label = hazardLabels[haztypeId] ?? `Hazard ${haztypeId}`;
      const description = descriptionInput.value.trim();
      let parsedJson;

      try {
        parsedJson = parseJson();
      } catch (error) {
        setStatus(error.message || 'Please check the configuration and try again.', 'warning');
        editor.focus();
        return;
      }

      toggleBusy(true);
      setStatus(`Saving default configuration for ${label}...`, 'info');

      try {
        const response = await fetch('/api/ConfigVulnProxy/ws24', {
          method: 'PUT',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            haztype_id: haztypeId,
            description,
            vuln_data: parsedJson
          }),
        });

        const responseText = await response.text();
        if (!response.ok) {
          throw new Error(getFriendlyReason(responseText));
        }

        setEditorValue(parsedJson);
        setStatus(`Default configuration for ${label} saved successfully.`, 'success');
        showPopup({
          title: 'Operation completed',
          message: `The default configuration for ${label} was saved successfully.`,
          kind: 'success'
        });
      } catch (error) {
        console.error('[WS24] save error', error);
        const reason = typeof error?.message === 'string' ? error.message.trim() : '';
        const friendlyMessage = getFriendlySaveError(reason);
        setStatus(friendlyMessage, 'danger');
        showPopup({
          title: 'Operation not completed',
          message: friendlyMessage,
          kind: 'error'
        });
      } finally {
        toggleBusy(false);
      }
    };

    hazardSelect.addEventListener('change', loadConfiguration);
    saveButton.addEventListener('click', saveConfiguration);
    loadConfiguration();

    if (typeof setupFixedSidebarIconHandler === 'function') {
      setupFixedSidebarIconHandler();
    }

    if (typeof setupChatIconHandler === 'function') {
      setupChatIconHandler();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('pagehide', () => {
    document.body.classList.remove('new-configuration-body');
    document.body.classList.remove('has-bottom-bar');
  });
})();

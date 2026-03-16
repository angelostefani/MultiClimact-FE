document.addEventListener("DOMContentLoaded", function () {
    const getMapInstance = () => (typeof window !== "undefined" ? window.mapD14 : undefined);

    const resizeMapInstance = (mapInstance) => {
        if (!mapInstance) {
            return;
        }
        if (typeof mapInstance.invalidateSize === "function") {
            mapInstance.invalidateSize();
        } else if (typeof mapInstance.updateSize === "function") {
            mapInstance.updateSize();
        }
    };

    const getActiveEditor = () => {
        const layout = document.getElementById("panelD14-layout");
        if (!layout) {
            return null;
        }
        const editorArea = layout.querySelector(".dep-setup-editor");
        const activePane = editorArea ? editorArea.querySelector(".tab-pane.active") : null;
        const card = activePane ? activePane.querySelector(".dep-editor-card") : null;
        if (!card) {
            return null;
        }
        return { card };
    };

    const refreshEditorSizing = () => {
        const active = getActiveEditor();
        if (!active) {
            return;
        }
        const { card } = active;
        const header = card.querySelector(".dep-editor-header");
        const actions = card.querySelector(".dep-actions");
        const container = card.querySelector(".dep-json-editor-container");
        const textarea = card.querySelector(".dep-json-editor");
        if (!container) {
            return;
        }

        const headerH = header ? header.getBoundingClientRect().height : 0;
        const actionsH = actions ? actions.getBoundingClientRect().height : 0;
        const available = Math.max(160, Math.floor(card.clientHeight - headerH - actionsH));

        container.style.height = `${available}px`;
        container.style.maxHeight = `${available}px`;

        if (textarea && textarea._cmEditor) {
            textarea._cmEditor.setSize(null, `${available}px`);
            textarea._cmEditor.refresh();
        }
    };

    const pinScrollToLayout = () => {
        const layout = document.getElementById("panelD14-layout");
        if (!layout) {
            return;
        }
        const topOffset = layout.getBoundingClientRect().top + window.scrollY - 8;
        window.scrollTo({ top: topOffset });
    };

    const scheduleMapResize = (delayMs = 150) => {
        const mapInstance = getMapInstance();
        if (!mapInstance) {
            return;
        }
        setTimeout(() => resizeMapInstance(mapInstance), delayMs);
    };

    const layout = document.getElementById("panelD14-layout");
    if (layout) {
        scheduleMapResize();
        scheduleMapResize(500);
        refreshEditorSizing();
        if (typeof ResizeObserver !== "undefined") {
            const resizeObserver = new ResizeObserver(() => {
                scheduleMapResize();
                refreshEditorSizing();
            });
            resizeObserver.observe(layout);
        } else {
            window.addEventListener("resize", () => {
                scheduleMapResize();
                refreshEditorSizing();
            });
        }

        const depSubtabs = document.getElementById("depSubtabs");
        if (depSubtabs) {
            depSubtabs.addEventListener("shown.bs.tab", () => {
                scheduleMapResize();
                refreshEditorSizing();
                pinScrollToLayout();
            });
        }
    }

    const mainTab = document.getElementById("tabD14-tab");
    if (mainTab) {
        mainTab.addEventListener("shown.bs.tab", () => {
            scheduleMapResize();
            scheduleMapResize(500);
            refreshEditorSizing();
            pinScrollToLayout();
        });
    }

    if (typeof CodeMirror === "undefined") {
        return;
    }

    const setStatus = (statusEl, isValid) => {
        if (!statusEl) {
            return;
        }
        const dot = statusEl.querySelector(".dep-status-dot");
        const text = statusEl.querySelector(".dep-status-text");
        if (!dot || !text) {
            return;
        }
        if (isValid) {
            dot.classList.add("dep-status-dot--valid");
            text.classList.add("dep-status-text--valid");
            text.classList.remove("dep-status-text--invalid");
            text.textContent = "Valid JSON";
        } else {
            dot.classList.remove("dep-status-dot--valid");
            text.classList.remove("dep-status-text--valid");
            text.classList.add("dep-status-text--invalid");
            text.textContent = "Syntax Error";
        }
    };

    const validateJson = (value) => {
        if (!value || value.trim() === "") {
            return false;
        }
        try {
            JSON.parse(value);
            return true;
        } catch {
            return false;
        }
    };

    const scheduleStatusUpdate = (editor, statusEl) => {
        if (editor._statusTimer) {
            clearTimeout(editor._statusTimer);
        }
        editor._statusTimer = setTimeout(() => {
            const isValid = validateJson(editor.getValue());
            setStatus(statusEl, isValid);
        }, 150);
    };

    document.querySelectorAll("#panelD14 .dep-json-editor").forEach((textarea) => {
        const editor = CodeMirror.fromTextArea(textarea, {
            mode: { name: "javascript", json: true },
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 2,
            tabSize: 2,
            gutters: ["CodeMirror-lint-markers"],
            lint: true
        });

        textarea._cmEditor = editor;
        textarea.style.display = "none";

        const statusId = textarea.dataset.statusId;
        const statusEl = statusId ? document.getElementById(statusId) : null;

        editor.on("change", () => scheduleStatusUpdate(editor, statusEl));
        scheduleStatusUpdate(editor, statusEl);
        setTimeout(() => refreshEditorSizing(), 50);
    });

    document.querySelectorAll("#panelD14 .dep-load-example").forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest(".dep-editor-card");
            const textarea = card ? card.querySelector(".dep-json-editor") : null;
            const exampleId = button.dataset.exampleTarget;
            const exampleEl = exampleId ? document.getElementById(exampleId) : null;
            if (!textarea || !exampleEl) {
                return;
            }
            const editor = textarea._cmEditor;
            if (!editor) {
                return;
            }
            const exampleValue = exampleEl.textContent.trim();
            editor.setValue(exampleValue);
            editor.focus();
        });
    });

    document.querySelectorAll("#panelD14 .dep-clear").forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest(".dep-editor-card");
            const textarea = card ? card.querySelector(".dep-json-editor") : null;
            const editor = textarea ? textarea._cmEditor : null;
            if (editor) {
                editor.setValue("");
                editor.focus();
            }
        });
    });

    document.querySelectorAll("#panelD14 .dep-validate").forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest(".dep-editor-card");
            const textarea = card ? card.querySelector(".dep-json-editor") : null;
            const editor = textarea ? textarea._cmEditor : null;
            const statusId = textarea ? textarea.dataset.statusId : null;
            const statusEl = statusId ? document.getElementById(statusId) : null;
            if (editor) {
                const isValid = validateJson(editor.getValue());
                setStatus(statusEl, isValid);
                editor.focus();
            }
        });
    });
});

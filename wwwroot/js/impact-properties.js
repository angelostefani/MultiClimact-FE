document.addEventListener("DOMContentLoaded", function () {
    const layout = document.getElementById("panelD16-layout");
    if (!layout) {
        return;
    }

    const getMapInstance = () => (typeof window !== "undefined" ? window.mapD16 : undefined);

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

    const getActivePane = () => layout.querySelector(".impact-tab-content .tab-pane.active");

    const refreshEditorSizing = () => {
        const activePane = getActivePane();
        if (!activePane) {
            return;
        }
        const card = activePane.querySelector(".impact-editor-card");
        if (!card) {
            return;
        }
        if (card.classList.contains("impact-editor-card--auto")) {
            return;
        }
        const title = card.querySelector(".impact-editor-title");
        const actions = card.querySelector(".impact-actions");
        const container = card.querySelector(".impact-json-editor-container");
        const textarea = card.querySelector(".impact-json-editor");
        if (!container) {
            return;
        }

        const titleH = title ? title.getBoundingClientRect().height : 0;
        const actionsH = actions ? actions.getBoundingClientRect().height : 0;
        const available = Math.max(160, Math.floor(card.clientHeight - titleH - actionsH));

        container.style.height = `${available}px`;
        container.style.maxHeight = `${available}px`;

        if (textarea && textarea._cmEditor) {
            textarea._cmEditor.setSize(null, `${available}px`);
            textarea._cmEditor.refresh();
        }
    };

    const pinScrollToLayout = () => {
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

    const subTabs = document.getElementById("impactSubtabs");
    if (subTabs) {
        subTabs.addEventListener("shown.bs.tab", () => {
            scheduleMapResize();
            refreshEditorSizing();
            pinScrollToLayout();
        });
    }

    const mainTab = document.getElementById("tabD16-tab");
    if (mainTab) {
        mainTab.addEventListener("shown.bs.tab", () => {
            scheduleMapResize();
            scheduleMapResize(500);
            refreshEditorSizing();
            pinScrollToLayout();
        });
    }

    const setStatusMessage = (statusEl, message, isValid) => {
        if (!statusEl) {
            return;
        }
        const dot = statusEl.querySelector(".impact-status-dot");
        const text = statusEl.querySelector(".impact-status-text");
        if (!dot || !text) {
            return;
        }
        if (isValid) {
            dot.classList.add("impact-status-dot--valid");
            text.classList.add("impact-status-text--valid");
            text.classList.remove("impact-status-text--invalid");
        } else {
            dot.classList.remove("impact-status-dot--valid");
            text.classList.remove("impact-status-text--valid");
            text.classList.add("impact-status-text--invalid");
        }
        text.textContent = message;
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
            setStatusMessage(statusEl, isValid ? "Valid JSON" : "Syntax Error", isValid);
        }, 150);
    };

    if (typeof CodeMirror !== "undefined") {
        document.querySelectorAll("#panelD16 .impact-json-editor").forEach((textarea) => {
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
    }

    const getActiveStatus = (pane) => pane ? pane.querySelector(".impact-status") : null;

    const validateMonteCarlo = (pane) => {
        const inputs = pane ? Array.from(pane.querySelectorAll(".impact-input")) : [];
        const values = inputs.map((input) => input.value.trim());
        const isValid = values.every((value) => value !== "" && !Number.isNaN(Number(value)));
        const statusEl = getActiveStatus(pane);
        setStatusMessage(statusEl, isValid ? "Valid inputs" : "Missing or invalid values", isValid);
        return isValid;
    };

    document.querySelectorAll("#panelD16 .impact-clear").forEach((button) => {
        button.addEventListener("click", () => {
            const pane = getActivePane();
            const textarea = pane ? pane.querySelector(".impact-json-editor") : null;
            const editor = textarea ? textarea._cmEditor : null;
            if (editor) {
                editor.setValue("");
                editor.focus();
                const statusId = textarea.dataset.statusId;
                const statusEl = statusId ? document.getElementById(statusId) : null;
                setStatusMessage(statusEl, "Syntax Error", false);
                return;
            }

            const inputs = pane ? pane.querySelectorAll(".impact-input") : [];
            inputs.forEach((input) => {
                input.value = "";
            });
            const statusEl = getActiveStatus(pane);
            setStatusMessage(statusEl, "Cleared", false);
        });
    });

    document.querySelectorAll("#panelD16 .impact-validate").forEach((button) => {
        button.addEventListener("click", () => {
            const pane = getActivePane();
            const textarea = pane ? pane.querySelector(".impact-json-editor") : null;
            const editor = textarea ? textarea._cmEditor : null;
            if (editor) {
                const statusId = textarea.dataset.statusId;
                const statusEl = statusId ? document.getElementById(statusId) : null;
                const isValid = validateJson(editor.getValue());
                setStatusMessage(statusEl, isValid ? "Valid JSON" : "Syntax Error", isValid);
                editor.focus();
                return;
            }
            validateMonteCarlo(pane);
        });
    });

    document.querySelectorAll("#panelD16 .impact-save").forEach((button) => {
        button.addEventListener("click", () => {
            const pane = getActivePane();
            const textarea = pane ? pane.querySelector(".impact-json-editor") : null;
            const editor = textarea ? textarea._cmEditor : null;
            if (editor) {
                const payload = editor.getValue();
                console.log("[Impact Properties] Save JSON:", payload);
                const statusId = textarea.dataset.statusId;
                const statusEl = statusId ? document.getElementById(statusId) : null;
                const isValid = validateJson(payload);
                setStatusMessage(statusEl, isValid ? "Saved" : "Syntax Error", isValid);
                return;
            }

            const inputs = pane ? Array.from(pane.querySelectorAll(".impact-input")) : [];
            const payload = inputs.reduce((acc, input) => {
                acc[input.id] = input.value;
                return acc;
            }, {});
            console.log("[Impact Properties] Save Monte Carlo:", payload);
            const statusEl = getActiveStatus(pane);
            const isValid = validateMonteCarlo(pane);
            if (statusEl && isValid) {
                setStatusMessage(statusEl, "Saved", true);
            }
        });
    });
});

(() => {
    const panel = document.getElementById("panelD13");
    if (!panel) {
        return;
    }

    const latInput = document.getElementById("ra-latitude");
    const lonInput = document.getElementById("ra-longitude");
    const radiusInput = document.getElementById("ra-radius");
    const newBtn = document.getElementById("ra-new");
    const duplicateBtn = document.getElementById("ra-duplicate");

    const inputs = [latInput, lonInput, radiusInput].filter(Boolean);
    if (inputs.length === 0 || !newBtn || !duplicateBtn) {
        return;
    }

    const sectorCheckboxes = Array.from(panel.querySelectorAll(".ra-checkbox-grid input[type='checkbox']"));
    const readValues = () => ({
        latitude: latInput?.value ?? "",
        longitude: lonInput?.value ?? "",
        radius: radiusInput?.value ?? "",
        sectors: sectorCheckboxes.map(cb => cb.checked)
    });
    const initialValues = readValues();
    const initialPlaceholders = {
        latitude: latInput?.getAttribute("placeholder") ?? "",
        longitude: lonInput?.getAttribute("placeholder") ?? "",
        radius: radiusInput?.getAttribute("placeholder") ?? ""
    };

    const applyValues = (values) => {
        if (!values) {
            return;
        }
        if (latInput) {
            latInput.value = values.latitude ?? "";
        }
        if (lonInput) {
            lonInput.value = values.longitude ?? "";
        }
        if (radiusInput) {
            radiusInput.value = values.radius ?? "";
        }
        if (Array.isArray(values.sectors) && values.sectors.length === sectorCheckboxes.length) {
            sectorCheckboxes.forEach((cb, index) => {
                cb.checked = Boolean(values.sectors[index]);
            });
        }
    };

    newBtn.addEventListener("click", () => {
        inputs.forEach(input => {
            input.value = "";
        });
        if (latInput) {
            latInput.setAttribute("placeholder", "");
        }
        if (lonInput) {
            lonInput.setAttribute("placeholder", "");
        }
        if (radiusInput) {
            radiusInput.setAttribute("placeholder", "");
        }
        sectorCheckboxes.forEach(cb => {
            cb.checked = false;
            cb.disabled = false;
        });
        panel.dataset.scenarioMode = "new";
    });

    duplicateBtn.addEventListener("click", () => {
        applyValues(initialValues);
        if (latInput) {
            latInput.setAttribute("placeholder", initialPlaceholders.latitude);
        }
        if (lonInput) {
            lonInput.setAttribute("placeholder", initialPlaceholders.longitude);
        }
        if (radiusInput) {
            radiusInput.setAttribute("placeholder", initialPlaceholders.radius);
        }
        sectorCheckboxes.forEach(cb => {
            cb.disabled = false;
        });
        panel.dataset.scenarioMode = "edit";
    });
})();

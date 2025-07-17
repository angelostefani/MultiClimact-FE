// Funzione per gestire le icone della Fixed Sidebar (on the Right)
function setupFixedSidebarIconHandler() {
    const legendIconWrapper = document.querySelector('.legend-icon-wrapper');
    const centerPanel = document.getElementById('centerPanel');

    if (legendIconWrapper && centerPanel) {
        legendIconWrapper.addEventListener('click', () => {
            // Alterna lo stato "selected" sulla mappa
            legendIconWrapper.classList.toggle('selected');

            // Mostra o nasconde il pannello centrale
            centerPanel.style.display = (centerPanel.style.display === 'block') ? 'none' : 'block';

            // Se il pannello è visibile, carica le legende
            if (centerPanel.style.display === 'block') {
                loadLegends(activeTab);
            }
        });
    } else {
        console.warn('Map icon wrapper or centerPanel not found.');
    }
}

// Funzione per aprire il pannello della chat
function setupChatIconHandler() {
    const robotIconWrapper = document.querySelector('.robot-icon-wrapper');
    const chatPanel = document.getElementById('chatPanel');

    if (robotIconWrapper && chatPanel) {
        robotIconWrapper.addEventListener('click', () => {
            robotIconWrapper.classList.toggle('selected');
            chatPanel.style.display = (chatPanel.style.display === 'block') ? 'none' : 'block';
        });
    } else {
        console.warn('Robot icon wrapper or chatPanel not found.');
    }
}

// Funzione per caricare le legende nel pannello centrale
function loadLegends(activeTab) {
    let itemsPerRow;
    const legendContainer = document.getElementById('legendContainer');
    legendContainer.innerHTML = '';
    let legends = [];

    if (activeTab === 'tabC1-tab') {
        itemsPerRow = 1;
        legends = configWMSMatrixMapC1.layerMatrix.map(layer => {
            return { wmsUrl: layer[2], wmsLayer: layer[3], legendTitle: layer[4] };
        });
    } else if (activeTab === 'tabC2-tab') {
        itemsPerRow = 5;
        legends = configWMSMatrixMapC2.layerMatrix.map(layer => {
            return { wmsUrl: layer[2], wmsLayer: layer[3], legendTitle: layer[4] };
        });
    } else if (activeTab === 'tabC3-tab') {
        itemsPerRow = 4;
        legends = configWMSMatrixMapC3.layerMatrix.map(layer => {
            return { wmsUrl: layer[2], wmsLayer: layer[3], legendTitle: layer[4] };
        });
    } else if (activeTab === 'tabC4-tab') {
        itemsPerRow = 2;
        legends = configWMSMatrixMapC4.layerMatrix.map(layer => {
            return { wmsUrl: layer[2], wmsLayer: layer[3], legendTitle: layer[4] };
        });
    }

    legends.forEach((legend, index) => {
        addLegendToPanel(legendContainer, legend.wmsUrl, legend.wmsLayer, legend.legendTitle, index, itemsPerRow);
    });
}

// Funzione per aggiungere una leggenda al pannello centrale
function addLegendToPanel(container, wmsUrl, wmsLayer, legendTitle, legendNumber, itemsPerRow) {
    let url = new URL(wmsUrl);
    url.searchParams.set('REQUEST', 'GetLegendGraphic');
    url.searchParams.set('VERSION', '1.0.0');
    url.searchParams.set('FORMAT', 'image/png');
    url.searchParams.set('WIDTH', '20');
    url.searchParams.set('HEIGHT', '20');
    url.searchParams.set('LAYER', wmsLayer);

    let legendDiv = document.createElement('div');
    legendDiv.className = 'legend-control card shadow-sm';
    legendDiv.style.marginBottom = '8px';
    legendDiv.style.display = 'inline-block';
    legendDiv.style.width = '14%';
    legendDiv.style.padding = '6px';
    legendDiv.style.verticalAlign = 'top';
    legendDiv.style.borderRadius = '6px';
    legendDiv.style.backgroundColor = '#ffffff';

    let titleDiv = document.createElement('div');
    titleDiv.innerText = legendTitle;
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.marginBottom = '6px';
    titleDiv.style.textAlign = 'center';

    let legendImg = document.createElement('img');
    legendImg.src = url.href;
    legendImg.alt = 'Legend';
    legendImg.style.display = 'block';
    legendImg.style.margin = '0 auto';

    legendDiv.appendChild(titleDiv);
    legendDiv.appendChild(legendImg);
    container.appendChild(legendDiv);

    // Controllo per andare a capo ogni "itemsPerRow" elementi
    if ((legendNumber + 1) % itemsPerRow === 0) {
        container.appendChild(document.createElement('br'));
    }
}


// Funzione per chiudere il pannello centrale
function closeCenterPanel() {
    const centerPanel = document.getElementById('centerPanel');
    centerPanel.style.display = 'none';
}
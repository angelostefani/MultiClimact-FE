/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data di creazione: 02/01/2024
* Data di aggiornamento: 15/05/2024
* 
* Libreria JavaScript per le applicazioni GIS di ENEA.
* Framework utilizzati:
* - Bootstrap
* - JQuery
*/

// Variabile per tracciare la scheda attiva
let activeTab = 'tabB1-tab';

/**
 * Funzione per cambiare il layer della mappa di base.
 *
 * @param {string} baseMapName - Nome del nuovo layer della mappa di base.
 * @param {string} activeTab - ID della scheda attiva.
 */
function changeMap(baseMapName, activeTab) {
    const baseMapLayer = getBaseMapLayer(baseMapName);
    baseMapLayer.set('name', 'baseMap'); // Assegna un nome al nuovo layer della mappa di base

    const map = getMapFromActiveTab(activeTab);

    if (map) {
        // Rimuove il layer della mappa di base corrente e lo sostituisce con il nuovo
        map.getLayers().forEach((layer, index) => {
            if (layer.get('name') === 'baseMap') {
                map.getLayers().setAt(index, baseMapLayer);
            }
        });
    }
}

/**
 * Funzione che restituisce la mappa OpenLayers associata alla scheda attiva.
 *
 * @param {string} activeTab - ID della scheda attiva.
 *
 * @returns {ol.Map} La mappa OpenLayers corrispondente alla scheda attiva.
 */
function getMapFromActiveTab(activeTab) {
    const mapTabs = {
        'tabB1-tab': mapB1, 'tabB2-tab': mapB2, 'tabB3-tab': mapB3, 'tabB4-tab': mapB4, 
        'tabB5-tab': mapB5, 'tabB6-tab': mapB6, 'tabB7-tab': mapB7, 'tabB8-tab': mapB8,
        'tabB9-tab': mapB9, 'tabB10-tab': mapB10, 'tabB11-tab': mapB11, 'tabB12-tab': mapB12, 
        'tabB13-tab': mapB13, 'tabB14-tab': mapB14, 'tabB15-tab': mapB15, 'tabB16-tab': mapB16,
        'tabB17-tab': mapB17, 'tabB18-tab': mapB18, 
        'tabC1-tab': mapC1, 'tabC2-tab': mapC2, 'tabC3-tab': mapC3, 'tabC4-tab': mapC4, 
        'tabC5-tab': mapC5, 'tabC6-tab': mapC6, 'tabC7-tab': mapC7, 'tabC8-tab': mapC8, 
        'tabC9-tab': mapC9, 'tabC10-tab': mapC10, 'tabC11-tab': mapC11, 
        'tabD1-tab': mapD1, 'tabD2-tab': mapD2, 'tabD3-tab': mapD3, 'tabD4-tab': mapD4, 
        'tabD5-tab': mapD5, 'tabD6-tab': mapD6, 'tabD7-tab': mapD7, 'tabD8-tab': mapD8, 
        'tabD9-tab': mapD9, 'tabD10-tab': mapD10, 'tabD11-tab': mapD11, 'tabD12-tab': mapD12,
        'tabD13-tab': mapD13          
    };

    return mapTabs[activeTab] || mapA1;
}

/**
 * Funzione per aggiornare il breadcrumb e mostrare le schede corrispondenti.
 *
 * @param {string} sezione - La sezione selezionata.
 * @param {string} sottoSezione - La sotto-sezione selezionata.
 */
function updateBreadcrumb(sezione, sottoSezione) {
    // Aggiorna il breadcrumb con la sezione e la sotto-sezione fornite
    const breadcrumbHtml = `
        <li class="breadcrumb-item"><a href="#">Home</a></li>
        <li class="breadcrumb-item"><a href="#">${sezione}</a></li>
        <li class="breadcrumb-item active" aria-current="page">${sottoSezione}</li>
    `;
    $('#breadcrumb').html(breadcrumbHtml);

    // Mostra le schede corrispondenti se la sezione è "Analisi del Rischio"
    if (sezione === 'Analisi del Rischio') {
        const tabSelector = `#myTab a[href="#${sottoSezione.toLowerCase()}"]`;
        $(tabSelector).tab('show');
    }
}

/**
 * Funzione per inizializzare le schede dell'applicazione.
 * Nasconde tutte le schede e imposta la scheda attiva di default.
 */
function initTabs() {
    // Array di tutti gli ID delle schede
    const tabIds = [
        '#tabA1-tab',  
        '#tabB1-tab', '#tabB2-tab', '#tabB3-tab', '#tabB4-tab', 
        '#tabB5-tab', '#tabB6-tab', '#tabB7-tab', '#tabB8-tab', 
        '#tabB9-tab', '#tabB10-tab', '#tabB11-tab', '#tabB12-tab', 
        '#tabB13-tab', '#tabB14-tab', '#tabB15-tab', '#tabB16-tab', 
        '#tabB17-tab', '#tabB18-tab',
        '#tabC1-tab', '#tabC2-tab', '#tabC3-tab', '#tabC4-tab', 
        '#tabC5-tab', '#tabC6-tab', '#tabC7-tab', '#tabC8-tab', 
        '#tabC9-tab', '#tabC10-tab', '#tabC11-tab',
        '#tabD1-tab', '#tabD2-tab', '#tabD3-tab', '#tabD4-tab', 
        '#tabD5-tab', '#tabD6-tab', '#tabD7-tab', '#tabD8-tab',
        '#tabD9-tab', '#tabD10-tab', '#tabD11-tab', '#tabD12-tab', 
        '#tabD13-tab', 
        '#tabE1-tab', '#tabE2-tab', '#tabE3-tab'
    ];

    // Nascondi tutte le schede e rimuovi le classi 'show active'
    tabIds.forEach(id => {
        $(id).removeClass('show active').addClass('visually-hidden');
    });

    // Imposta la scheda attiva di default
    activeTab = 'tabC1-tab';
}

/**
 * Funzione per inizializzare gli elementi del layout dell'applicazione.
 * Imposta la proprietà display degli elementi "mouseCoordinates" e "addressInput" su "block",
 * rendendoli visibili nell'applicazione.
 */
function initLayoutElements() {
    //document.getElementById("mouseCoordinates").style.display = "block";
    //document.getElementById("addressInput").style.display = "block";    
}

/**
 * Funzione per gestire l'interazione con le schede dell'interfaccia utente.
 * Imposta la variabile activeTab in base alla scheda cliccata.
 */
function tabManager() {
    // Definisce un array di ID delle schede per l'iterazione
    const tabIds = [
        'tabA1-tab', 
        'tabB1-tab', 'tabB2-tab', 'tabB3-tab', 'tabB4-tab', 
        'tabB5-tab', 'tabB6-tab', 'tabB7-tab', 'tabB8-tab', 
        'tabB9-tab', 'tabB10-tab', 'tabB11-tab', 'tabB12-tab', 
        'tabB13-tab', 'tabB14-tab', 'tabB15-tab', 'tabB16-tab', 
        'tabB17-tab', 'tabB18-tab',
        'tabC1-tab', 'tabC2-tab', 'tabC3-tab', 'tabC4-tab', 
        'tabC5-tab', 'tabC6-tab', 'tabC7-tab', 'tabC8-tab', 
        'tabC9-tab', 'tabC10-tab', 'tabC11-tab',
        'tabD1-tab', 'tabD2-tab', 'tabD3-tab', 'tabD4-tab', 
        'tabD5-tab', 'tabD6-tab', 'tabD7-tab', 'tabD8-tab',
        'tabD9-tab', 'tabD10-tab', 'tabD11-tab', 'tabD12-tab', 'tabD13-tab',
        'tabE1-tab', 'tabE2-tab', 'tabE3-tab'
    ];

    // Itera attraverso ogni ID di scheda
    tabIds.forEach(tabId => {
        // Aggiunge un listener per il click su ogni scheda
        $(`#${tabId}`).on('click', function () {
            // Imposta la scheda attiva
            activeTab = tabId;
            // Aggiorna l'interfaccia in base alla scheda selezionata
            selectTab(activeTab);
        });
    });
}

/**
 * Funzione per aggiornare le schede in base all'elemento selezionato nel menu a tendina.
 *
 * @param {string} selectedItem - L'ID della scheda selezionata.
 */
function selectTab(selectedItem) {
    // Nascondi tutte le schede
    $('#myTabContent').children('.tab-pane').removeClass('show active').addClass('fade');
    initTabs();
    initLayoutElements();

    // Mappa dei gruppi di schede
    const tabGroups = {
        // Gruppo A
        'tabA1-tab': {
            tabsToShow: ['tabA1-tab'],
            activeTab: 'tabA1-tab',
            activePanel: 'panelA1'
        },
        // Gruppo B1
        'tabB1-tab': {
            tabsToShow: ['tabB1-tab', 'tabB2-tab', 'tabB3-tab', 'tabB4-tab'],
            activeTab: 'tabB1-tab',
            activePanel: 'panelB1'
        },
        'tabB2-tab': {
            tabsToShow: ['tabB1-tab', 'tabB2-tab', 'tabB3-tab', 'tabB4-tab'],
            activeTab: 'tabB2-tab',
            activePanel: 'panelB2'
        },
        'tabB3-tab': {
            tabsToShow: ['tabB1-tab', 'tabB2-tab', 'tabB3-tab', 'tabB4-tab'],
            activeTab: 'tabB3-tab',
            activePanel: 'panelB3'
        },
        'tabB4-tab': {
            tabsToShow: ['tabB1-tab', 'tabB2-tab', 'tabB3-tab', 'tabB4-tab'],
            activeTab: 'tabB4-tab',
            activePanel: 'panelB4'
        },
        // Gruppo B2
        'tabB5-tab': {
            tabsToShow: ['tabB5-tab', 'tabB6-tab', 'tabB7-tab', 'tabB8-tab'],
            activeTab: 'tabB5-tab',
            activePanel: 'panelB5'
        },
        'tabB6-tab': {
            tabsToShow: ['tabB5-tab', 'tabB6-tab', 'tabB7-tab', 'tabB8-tab'],
            activeTab: 'tabB6-tab',
            activePanel: 'panelB6'
        },
        'tabB7-tab': {
            tabsToShow: ['tabB5-tab', 'tabB6-tab', 'tabB7-tab', 'tabB8-tab'],
            activeTab: 'tabB7-tab',
            activePanel: 'panelB7'
        },
        'tabB8-tab': {
            tabsToShow: ['tabB5-tab', 'tabB6-tab', 'tabB7-tab', 'tabB8-tab'],
            activeTab: 'tabB8-tab',
            activePanel: 'panelB8'
        },
        // Gruppo B3
        'tabB9-tab': {
            tabsToShow: ['tabB9-tab', 'tabB10-tab', 'tabB11-tab'],
            activeTab: 'tabB9-tab',
            activePanel: 'panelB9'
        },
        'tabB10-tab': {
            tabsToShow: ['tabB9-tab', 'tabB10-tab', 'tabB11-tab'],
            activeTab: 'tabB10-tab',
            activePanel: 'panelB10'
        },
        'tabB11-tab': {
            tabsToShow: ['tabB9-tab', 'tabB10-tab', 'tabB11-tab'],
            activeTab: 'tabB11-tab',
            activePanel: 'panelB11'
        },
        // Gruppo B4
        'tabB12-tab': {
            tabsToShow: ['tabB12-tab', 'tabB13-tab', 'tabB14-tab', 'tabB15-tab', 'tabB16-tab'],
            activeTab: 'tabB12-tab',
            activePanel: 'panelB12'
        },
        'tabB13-tab': {
            tabsToShow: ['tabB12-tab', 'tabB13-tab', 'tabB14-tab', 'tabB15-tab', 'tabB16-tab'],
            activeTab: 'tabB13-tab',
            activePanel: 'panelB13'
        },
        'tabB14-tab': {
            tabsToShow: ['tabB12-tab', 'tabB13-tab', 'tabB14-tab', 'tabB15-tab', 'tabB16-tab'],
            activeTab: 'tabB14-tab',
            activePanel: 'panelB14'
        },
        'tabB15-tab': {
            tabsToShow: ['tabB12-tab', 'tabB13-tab', 'tabB14-tab', 'tabB15-tab', 'tabB16-tab'],
            activeTab: 'tabB15-tab',
            activePanel: 'panelB15'
        },
        'tabB16-tab': {
            tabsToShow: ['tabB12-tab', 'tabB13-tab', 'tabB14-tab', 'tabB15-tab', 'tabB16-tab'],
            activeTab: 'tabB16-tab',
            activePanel: 'panelB16'
        },
        // Gruppo B5
        'tabB17-tab': {
            tabsToShow: ['tabB17-tab', 'tabB18-tab'],
            activeTab: 'tabB17-tab',
            activePanel: 'panelB17'
        },
        'tabB18-tab': {
            tabsToShow: ['tabB17-tab', 'tabB18-tab'],
            activeTab: 'tabB18-tab',
            activePanel: 'panelB18'
        },
        // Gruppo C1
        'tabC1-tab': {
            tabsToShow: ['tabC1-tab', 'tabC2-tab', 'tabC3-tab', 'tabC4-tab'],
            activeTab: 'tabC1-tab',
            activePanel: 'panelC1'
        },
        'tabC2-tab': {
            tabsToShow: ['tabC1-tab', 'tabC2-tab', 'tabC3-tab', 'tabC4-tab'],
            activeTab: 'tabC2-tab',
            activePanel: 'panelC2'
        },
        'tabC3-tab': {
            tabsToShow: ['tabC1-tab', 'tabC2-tab', 'tabC3-tab', 'tabC4-tab'],
            activeTab: 'tabC3-tab',
            activePanel: 'panelC3'
        },
        'tabC4-tab': {
            tabsToShow: ['tabC1-tab', 'tabC2-tab', 'tabC3-tab', 'tabC4-tab'],
            activeTab: 'tabC4-tab',
            activePanel: 'panelC4'
        },
        // Gruppo C2
        'tabC5-tab': {
            tabsToShow: ['tabC5-tab', 'tabC6-tab', 'tabC7-tab', 'tabC8-tab'],
            activeTab: 'tabC5-tab',
            activePanel: 'panelC5'
        },
        'tabC6-tab': {
            tabsToShow: ['tabC5-tab', 'tabC6-tab', 'tabC7-tab', 'tabC8-tab'],
            activeTab: 'tabC6-tab',
            activePanel: 'panelC6'
        },
        'tabC7-tab': {
            tabsToShow: ['tabC5-tab', 'tabC6-tab', 'tabC7-tab', 'tabC8-tab'],
            activeTab: 'tabC7-tab',
            activePanel: 'panelC7'
        },
        'tabC8-tab': {
            tabsToShow: ['tabC5-tab', 'tabC6-tab', 'tabC7-tab', 'tabC8-tab'],
            activeTab: 'tabC8-tab',
            activePanel: 'panelC8'
        },
        // Gruppo C3
        'tabC9-tab': {
            tabsToShow: ['tabC9-tab', 'tabC10-tab', 'tabC11-tab'],
            activeTab: 'tabC9-tab',
            activePanel: 'panelC9'
        },
        'tabC10-tab': {
            tabsToShow: ['tabC9-tab', 'tabC10-tab', 'tabC11-tab'],
            activeTab: 'tabC10-tab',
            activePanel: 'panelC10'
        },
        'tabC11-tab': {
            tabsToShow: ['tabC9-tab', 'tabC10-tab', 'tabC11-tab'],
            activeTab: 'tabC11-tab',
            activePanel: 'panelC11'
        },
        // Gruppo D1
        'tabD1-tab': {
            tabsToShow: ['tabD1-tab', 'tabD2-tab', 'tabD3-tab', 'tabD4-tab'],
            activeTab: 'tabD1-tab',
            activePanel: 'panelD1'
        },
        'tabD2-tab': {
            tabsToShow: ['tabD1-tab', 'tabD2-tab', 'tabD3-tab', 'tabD4-tab'],
            activeTab: 'tabD2-tab',
            activePanel: 'panelD2'
        },
        'tabD3-tab': {
            tabsToShow: ['tabD1-tab', 'tabD2-tab', 'tabD3-tab', 'tabD4-tab'],
            activeTab: 'tabD3-tab',
            activePanel: 'panelD3'
        },
        'tabD4-tab': {
            tabsToShow: ['tabD1-tab', 'tabD2-tab', 'tabD3-tab', 'tabD4-tab'],
            activeTab: 'tabD4-tab',
            activePanel: 'panelD4'
        },
        // Gruppo D2
        'tabD5-tab': {
            tabsToShow: ['tabD5-tab', 'tabD6-tab', 'tabD7-tab', 'tabD8-tab'],
            activeTab: 'tabD5-tab',
            activePanel: 'panelD5'
        },
        'tabD6-tab': {
            tabsToShow: ['tabD5-tab', 'tabD6-tab', 'tabD7-tab', 'tabD8-tab'],
            activeTab: 'tabD6-tab',
            activePanel: 'panelD6'
        },
        'tabD7-tab': {
            tabsToShow: ['tabD5-tab', 'tabD6-tab', 'tabD7-tab', 'tabD8-tab'],
            activeTab: 'tabD7-tab',
            activePanel: 'panelD7'
        },
        'tabD8-tab': {
            tabsToShow: ['tabD5-tab', 'tabD6-tab', 'tabD7-tab', 'tabD8-tab'],
            activeTab: 'tabD8-tab',
            activePanel: 'panelD8'
        },
        // Gruppo D3
        'tabD9-tab': {
            tabsToShow: ['tabD9-tab', 'tabD10-tab', 'tabD11-tab'],
            activeTab: 'tabD9-tab',
            activePanel: 'panelD9'
        },
        'tabD10-tab': {
            tabsToShow: ['tabD9-tab', 'tabD10-tab', 'tabD11-tab'],
            activeTab: 'tabD10-tab',
            activePanel: 'panelD10'
        },
        'tabD11-tab': {
            tabsToShow: ['tabD9-tab', 'tabD10-tab', 'tabD11-tab'],
            activeTab: 'tabD11-tab',
            activePanel: 'panelD11'
        },
        // Gruppo D4
        'tabD12-tab': {
            tabsToShow: ['tabD12-tab', 'tabD13-tab'],
            activeTab: 'tabD12-tab',
            activePanel: 'panelD12'
        },
        'tabD13-tab': {
            tabsToShow: ['tabD12-tab', 'tabD13-tab'],
            activeTab: 'tabD13-tab',
            activePanel: 'panelD13'
        },
        // Gruppo E
        'tabE1-tab': {
            tabsToShow: ['tabE1-tab', 'tabE2-tab', 'tabE3-tab'],
            activeTab: 'tabE1-tab',
            activePanel: 'panelE1'
        },
        'tabE2-tab': {
            tabsToShow: ['tabE1-tab', 'tabE2-tab', 'tabE3-tab'],
            activeTab: 'tabE2-tab',
            activePanel: 'panelE2'
        },
        'tabE3-tab': {
            tabsToShow: ['tabE1-tab', 'tabE2-tab', 'tabE3-tab'],
            activeTab: 'tabE3-tab',
            activePanel: 'panelE3'
        }
    };

    const group = tabGroups[selectedItem];

    if (group) {
        // Rendi visibili le schede del gruppo
        group.tabsToShow.forEach(tabId => {
            $(`#${tabId}`).removeClass('visually-hidden');
        });

        // Attiva la scheda e il pannello corrispondente
        $(`#${group.activeTab}`).addClass('show active');
        $(`#${group.activePanel}`).addClass('show active');

        disableVerticalScrollBar();
        activeTab = group.activeTab;
    }
}

/**
 * Funzione per abilitare la barra di scorrimento verticale.
 */
function enableVerticalScrollBar() {
    // Imposta overflow-y su 'scroll' per abilitare la barra di scorrimento
    document.body.style.overflowY = 'scroll';

    // Nasconde elementi specifici quando la barra di scorrimento è abilitata
    document.getElementById("mouseCoordinates").style.display = "none";
    document.getElementById("addressInput").style.display = "none";
}

/**
 * Funzione per disabilitare la barra di scorrimento verticale.
 */
function disableVerticalScrollBar() {
    // Imposta overflow-y su 'hidden' per disabilitare la barra di scorrimento
    document.body.style.overflowY = 'hidden';
}

/**
 * Funzione per gestire la selezione della mappa quando si fa clic su una voce del menu a discesa.
 *
 * @param {string} dropdownItemSelector - Selettore dell'elemento del menu a discesa.
 * @param {string} dropdownMenuSelector - Selettore del menu a discesa.
 */
function setupDropdownMenuHandler(dropdownItemSelector, dropdownMenuSelector) {
    $(dropdownItemSelector).on('click', function () {
        $(dropdownMenuSelector).removeClass('show');
    });
}



const filterValues = {};
const backdropFilterValues = {};

const FilterDescription = {
    "blur": "blur(px) Applies a Gaussian blur. Can be adjusted with a pixel value.",
    "brightness": "brightness(%) Adjusts the brightness of the element. 100% is normal. Values greater than 100% make it brighter, while values less than 100% make it darker.",
    "contrast": "contrast(%) Adjusts the contrast of the element. 100% is normal. Values greater than 100% increase contrast, while values less than 100% decrease contrast.",
    "drop-shadow": "drop-shadow(offsetX offsetY blurRadius color) Applies a drop shadow effect. Requires offsetX, offsetY, blurRadius, and color values.",
    "grayscale": "grayscale(%) Converts the element to grayscale. 0% is fully colored, while 100% is completely grayscale. Negative values are not allowed.",
    "hue-rotate": "hue-rotate(deg) Applies a hue rotation to the element. The angle is specified in degrees. 0deg is default(original color), 360deg is maximum.",
    "invert": "invert(%) Inverts the colors of the element. 0% is normal, while 100% is completely inverted. Negative values are not allowed.",
    "opacity": "opacity(%) Adjusts the opacity of the element. 100% is fully opaque, while 0% is fully transparent. Values greater than 100% or negative are not allowed.",
    "saturate": "saturate(%) Adjusts the saturation of the element. 100% is normal, values greater than 100% increase saturation, and values less than 100% decrease saturation. Negative values are not allowed.",
    "sepia": "sepia(%) Applies a sepia filter to the element. 0% is normal, while 100% is completely sepia. Negative values are not allowed."
}
const FilterDefaults = {
    "blur": "0px",
    "brightness": "100%",
    "contrast": "100%",
    "drop-shadow": "0 0 0 transparent",
    "grayscale": "0%",
    "hue-rotate": "0deg",
    "invert": "0%",
    "opacity": "100%",
    "saturate": "100%",
    "sepia": "0%"
}
let currentFilter = null;

const filterDescriptionName = document.getElementById('FilterName');
const filterDescriptionText = document.getElementById('FilterDescription');
const filterPreviewText = document.getElementById('FilterPreviewTextContainer');
const filterPreviewImage = document.getElementById('FilterPreviewImage');
const filterValueInput = document.getElementById('FilterValueInput');
const exportButton = document.getElementById('ExportButton');

const filterTargetCheckboxes = document.querySelectorAll('input[name="FilterTarget"]');
const filterModeRadioButtons = document.querySelectorAll('input[name="FilterMode"]');

let selectedTargets = ['FilterPreviewTextContainer', 'FilterPreviewImageContainer'];

function clearFilterSelection() {
    filterValueInput.value = '';
    filterValueInput.disabled = true;
    if (currentFilter) {
        const selectedBtn = document.getElementById(currentFilter);
        if (selectedBtn) selectedBtn.classList.remove('selected');
    }
    currentFilter = null;
    filterDescriptionName.textContent = 'Select a Filter';
    filterDescriptionText.textContent = 'Description of the selected filter will appear here. You can change the filter value using the input below and see the changes in real-time.';
    document.getElementById('MDNLink').href = `https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function`;
}

function changeTarget() {
    selectedTargets = Array.from(document.querySelectorAll('input[name="FilterTarget"]:checked')).map(input => input.value);
    clearFilterSelection();
    console.log('Selected targets:', selectedTargets);
}
function getTargetElements() {
    return selectedTargets.map(target => document.getElementById(target));
}

let backdropFilterMode = false;

function changeFilterMode() {
    backdropFilterMode = document.getElementById('FilterModeBackdrop').checked;
    console.log('Filter mode changed. Backdrop mode:', backdropFilterMode);
    clearFilterSelection();
    updateFilters();
}
function getFilterString(target, isBackdrop = false) {
    const values = isBackdrop ? backdropFilterValues[target] : filterValues[target];
    if (!values) return '';
    return Object.entries(values)
        .map(([filter, value]) => `${filter}(${value})`)
        .join(' ');
}

function updateFilters() {
    const isBackdrop = backdropFilterMode;
    getTargetElements().forEach(element => {
        const id = element.id;
        const filterStr = getFilterString(id, isBackdrop);
        if (isBackdrop) {
            element.style.backdropFilter = filterStr;
            document.getElementById(`AppliedBackdrop-${id}`).textContent = element.style.backdropFilter;
        } else {
            element.style.filter = filterStr;
            document.getElementById(`Applied-${id}`).textContent = element.style.filter;
        }
    });
}

function updateFilterValue() {
    if (!currentFilter) return;
    const value = filterValueInput.value || FilterDefaults[currentFilter];
    const isBackdrop = backdropFilterMode;
    getTargetElements().forEach(element => {
        const id = element.id;
        if (isBackdrop) {
            if (!backdropFilterValues[id]) backdropFilterValues[id] = {};
            backdropFilterValues[id][currentFilter] = value;
        } else {
            if (!filterValues[id]) filterValues[id] = {};
            filterValues[id][currentFilter] = value;
        }
    });
    updateFilters();
}

document.getElementById('FilterListView').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        if (currentFilter) document.getElementById(currentFilter).classList.remove('selected');
        e.target.classList.add('selected');
        currentFilter = e.target.id;
        const firstTarget = getTargetElements()[0].id;
        if (backdropFilterMode) {
            filterValueInput.value =
                (backdropFilterValues[firstTarget]?.[currentFilter]) || FilterDefaults[currentFilter];
        } else {
            filterValueInput.value =
                (filterValues[firstTarget]?.[currentFilter]) || FilterDefaults[currentFilter];
        }
        filterDescriptionName.textContent = currentFilter;
        filterDescriptionText.textContent = FilterDescription[currentFilter];
        console.log(`Selected filter: ${currentFilter}`);
        filterValueInput.disabled = false;
        document.getElementById('MDNLink').href = `https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function${currentFilter ? `/${currentFilter}` : ''}`;
    }
});

filterValueInput.addEventListener('input', () => {
    updateFilterValue();
});

filterTargetCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', changeTarget);
});

filterModeRadioButtons.forEach(radio => {
    radio.addEventListener('change', changeFilterMode);
});

// Overlay Drag Handler
const FilterPreviewOverlayContainer = document.getElementById('FilterPreviewOverlayContainer');
const FilterPreviewOverlay = document.getElementById('FilterPreviewOverlay');
function OverlayDragHandler(e) {
    e.preventDefault();
    const rect = FilterPreviewOverlay.getBoundingClientRect();
    let newX = e.clientX - rect.width / 2;
    let newY = e.clientY - rect.height / 2;

    const containerRect = FilterPreviewOverlayContainer.getBoundingClientRect();
    newX = Math.max(containerRect.left, Math.min(newX, containerRect.right - rect.width));
    newY = Math.max(containerRect.top, Math.min(newY, containerRect.bottom - rect.height));

    FilterPreviewOverlay.style.left = `${newX - containerRect.left}px`;
    FilterPreviewOverlay.style.top = `${newY - containerRect.top}px`;
}

var controlType = "mouse";
if (window.PointerEvent) {
    controlType = "pointer";
} else if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    controlType = "touch";
}
console.log(`Hello, ${controlType} user.`)
FilterPreviewOverlay.addEventListener(`${controlType}down`, (e) => {
    e.preventDefault();
    document.addEventListener(`${controlType}move`, OverlayDragHandler);
    document.addEventListener(`${controlType}up`, () => {
        document.removeEventListener(`${controlType}move`, OverlayDragHandler);
    });
})

function FeelingLucky() {
    const filters = Object.keys(FilterDefaults);
    const randomFilter = filters[Math.floor(Math.random() * filters.length)];
    let randomValue = Math.floor(Math.random() * 101) + (randomFilter === 'blur' ? 'px' : randomFilter === 'hue-rotate' ? 'deg' : '%');
    if (randomFilter == 'drop-shadow') {
        const offX = Math.floor(Math.random() * 21) - 10; // -10 to 10
        const offY = Math.floor(Math.random() * 21) - 10; // -10 to 10
        const blur = Math.floor(Math.random() * 11); // 0 to 10
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const a = Math.floor(Math.random() * 101) / 100; // 0 to 1
        randomValue = `${offX}px ${offY}px ${blur}px rgba(${r}, ${g}, ${b}, ${a})`
    }
    if (currentFilter) document.getElementById(currentFilter).classList.remove('selected');
    const randomBtn = document.getElementById(randomFilter);
    randomBtn.classList.add('selected');
    currentFilter = randomFilter;
    filterDescriptionName.textContent = currentFilter;
    filterDescriptionText.textContent = FilterDescription[currentFilter];
    filterValueInput.value = randomValue;
    filterValueInput.disabled = false;
    updateFilterValue();
    console.log(`Feeling Lucky! Selected filter: ${currentFilter} with value: ${randomValue}`);
}
document.getElementById('FeelingLuckyButton').addEventListener('click', FeelingLucky);

function addCopyListeners() {
    const AppliedFilterElements = document.getElementById('AppliedFilterList').getElementsByTagName('span');
    const AppliedBackdropFilterElements = document.getElementById('AppliedBackdropFilterList').getElementsByTagName('span');
    Array.from(AppliedFilterElements).forEach(span => {
        span.addEventListener('click', () => {
            console.log("Copy Filter");
            const text = span.getElementsByTagName('div')[0].textContent;
            if (!text) return;
            span.classList.add('copied');
            setTimeout(() => {
                span.classList.remove('copied');
            }, 10000);
            navigator.clipboard.writeText(`filter: ${text};`);
        })
    });
    Array.from(AppliedBackdropFilterElements).forEach(span => {
        span.addEventListener('click', () => {
            console.log("Copy Backdrop Filter");
            const text = span.getElementsByTagName('div')[0].textContent;
            if (!text) return;
            span.classList.add('copied');
            setTimeout(() => {
                span.classList.remove('copied');
            }, 10000);
            navigator.clipboard.writeText(`backdrop-filter: ${text};`);
        })
    });
}
addCopyListeners();

function addRightClickListeners() {
    // Right click on preview elements to edit HTML.
    const HTMLEdit = document.getElementById('HTMLEdit');
    const HTMLEditTextarea = document.getElementById('HTMLEditTextarea');
    const HTMLEditCloseButton = document.getElementById('HTMLEditCloseButton');
    const HTMLEditSaveButton = document.getElementById('HTMLEditSaveButton');
    var closeButtonEventListener, saveButtonEventListener;
    var targetElement
    [filterPreviewText, filterPreviewImage, FilterPreviewOverlay].forEach(element => {
        element.addEventListener('contextmenu', (e) => { // Right click
            e.preventDefault();
            HTMLEditTextarea.value = element.outerHTML;
            HTMLEdit.style.display = 'flex';
            targetElement = element;
        });
        let pressTimer;
        element.addEventListener('touchstart', (e) => { // Touch long press
            pressTimer = setTimeout(() => {
                HTMLEditTextarea.value = element.outerHTML;
                HTMLEdit.style.display = 'flex';
                targetElement = element;
            }, 800);
        });
        element.addEventListener('touchend', (e) => {
            clearTimeout(pressTimer);
        });
    });
    HTMLEditCloseButton.addEventListener('click', () => {
        HTMLEdit.style.display = 'none';
    });
    HTMLEditSaveButton.addEventListener('click', () => {
        if (HTMLEditTextarea.value.trim() === '') {
            alert('HTML cannot be empty.');
            return;
        }
        HTMLEdit.style.display = 'none';
        targetElement.outerHTML = HTMLEditTextarea.value;
    });
}
addRightClickListeners();

const filterResetButton = document.getElementById('FilterResetButton');
filterResetButton.addEventListener('click', () => {
    if (!confirm(`Are you sure you want to reset ${backdropFilterMode ? 'backdrop-filter' : 'filter'} values of selected elements?`)) {
        return;
    }
    if (selectedTargets.length == 0) {
        if (!confirm('No element is selected. Would you like to reset all filter and backdrop-filter values on all elements?')) {
            return;
        }
        if (backdropFilterMode) {
            Object.keys(backdropFilterValues).forEach(target => {
                delete backdropFilterValues[target];
            });
        } else {
            Object.keys(filterValues).forEach(target => {
                delete filterValues[target];
            });
        }
    } else {
        getTargetElements().forEach(element => {
            const id = element.id;
            if (backdropFilterMode) {
                delete backdropFilterValues[id];
            } else {
                delete filterValues[id];
            }
        });
    }
    clearFilterSelection();
    updateFilters();
    console.log(`Filters reset. filter: ${JSON.stringify(filterValues)}, backdrop-filter: ${JSON.stringify(backdropFilterValues)}`);
});

function showWelcomeGuide() {
    const welcomeGuide = document.getElementById('WelcomeGuide');
    var step = 0;
    const steps = [
       {"targetId": "", "text": "Welcome to the CSSFilterTool! I'll guide you through the main features of this playground."},
       {"targetId": "FilterTargetApplyTo", "text": "First, select the elements you want to apply filters to using these checkboxes."},
       {"targetId": "FilterTargetMode", "text": "Next, choose whether you want to apply 'filter' or 'backdrop-filter' using these radio buttons."},
       {"targetId": "FilterListView", "text": "Next, click a filter from this list of buttons to see its description and apply it to the selected elements."},
       {"targetId": "FilterTargetValue", "text": "Next, You can change the filter value using this text input. The changes will be applied to target elements in real-time."},
       {"targetId": "AppliedFilterList", "text": "You can see the currently applied filters and click to copy the CSS code to your clipboard."},
       {"targetId": "FilterPreviewOverlay", "text": "You can edit the previews' HTML by right-clicking (or long-pressing on touch devices) on the preview elements."},
       {"targetId": "", "text": "That's it for the tour! I hope you enjoy playing with filters."}
    ];
    function updateGuide() {
        const currentStep = steps[step];
        const targetElement = currentStep.targetId ? document.getElementById(currentStep.targetId) : null;
        const welcomeGuideText = document.getElementById('WelcomeGuideText');
        const welcomeGuideButton = document.getElementById('WelcomeGuideButton');
        welcomeGuideText.textContent = currentStep.text;
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            // position the box to the bottom of the target element
            welcomeGuide.style.left = `${rect.left + window.scrollX}px`;
            welcomeGuide.style.top = `${rect.bottom + window.scrollY + 10}px`;
            welcomeGuide.style.transform = 'translate(0, 0)';
            welcomeGuide.style.display = 'flex';
        } else {
            welcomeGuide.style.left = `50%`;
            welcomeGuide.style.top = `50%`;
            welcomeGuide.style.transform = 'translate(-50%, -50%)';
            welcomeGuide.style.display = 'flex';
        }
        if (step === steps.length - 1) {
            welcomeGuideButton.textContent = 'Finish';
        } else {
            welcomeGuideButton.textContent = 'Next';
        }
    }
    document.getElementById('WelcomeGuideButton').addEventListener('click', () => {
        step += 1;
        document.getElementById('WelcomeCloseButton').style.display = 'none';
        if (step >= steps.length) {
            welcomeGuide.style.display = 'none';
        } else {
            updateGuide();
        }
    });
    document.getElementById('WelcomeCloseButton').addEventListener('click', () => {
        welcomeGuide.style.display = 'none';
    });
    updateGuide();
}
window.addEventListener('load', () => {
    showWelcomeGuide();
});
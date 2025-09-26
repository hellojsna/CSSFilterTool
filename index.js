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
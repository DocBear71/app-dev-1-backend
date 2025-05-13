// planets.js

// DOM Elements
const planetForm = document.getElementById('planet-form');
const submitBtn = document.getElementById('submit-btn');
const planetNameInput = document.getElementById('planet-name');
const planetOrderInput = document.getElementById('planet-order');
const planetRingsInput = document.getElementById('planet-rings');
const atmosphereInputs = document.querySelectorAll('input[name="atmosphere"]');
const tempMinInput = document.getElementById('temp-min');
const tempMaxInput = document.getElementById('temp-max');
const tempMeanInput = document.getElementById('temp-mean');
const planetList = document.getElementById('planet-list');
const clearBtn = document.getElementById('clear');
const filter = document.getElementById('filter');

// API URL
const apiURL = 'https://eds-nodejs25.vercel.app/api/planets/';

// Helper Functions
function createButton(textColor = 'black', iconName = '', ...classes) {
    const button = document.createElement('button');
    button.className = `btn-link text-${textColor}`;
    classes.forEach(c => button.classList.add(c));
    if (iconName !== '') {
        const icon = createIcon(iconName);
        button.appendChild(icon);
    }
    return button;
}

function createIcon(iconName) {
    const icon = document.createElement('i');
    icon.className = `fa-solid fa-${iconName}`;
    return icon;
}

function createPlanetElement(planet) {
    const listItem = document.createElement('li');
    listItem.setAttribute('data-id', planet._id);

    // Create header with planet name and action buttons
    const headerDiv = document.createElement('div');
    headerDiv.className = 'planet-header';

    // Planet name
    const nameElem = document.createElement('h3');
    nameElem.className = 'planet-name';
    nameElem.textContent = planet.name;
    headerDiv.appendChild(nameElem);

    // Action buttons container
    const actionsSpan = document.createElement('span');
    actionsSpan.className = 'planet-actions';

    // Edit button
    const editButton = createButton('blue', 'pen', 'edit-item');
    actionsSpan.appendChild(editButton);

    // Delete button
    const deleteButton = createButton('red', 'trash', 'delete-item');
    actionsSpan.appendChild(deleteButton);

    headerDiv.appendChild(actionsSpan);
    listItem.appendChild(headerDiv);

    // Planet info container
    const infoDiv = document.createElement('div');
    infoDiv.className = 'planet-info';

    // Order from sun
    const orderDiv = document.createElement('div');
    orderDiv.className = 'planet-info-item';

    const orderIconSpan = document.createElement('span');
    orderIconSpan.className = 'planet-info-icon';
    orderIconSpan.innerHTML = '<i class="fa-solid fa-circle-dot"></i>';
    orderDiv.appendChild(orderIconSpan);

    const orderLabelSpan = document.createElement('span');
    orderLabelSpan.className = 'planet-info-label';
    orderLabelSpan.textContent = 'Order from Sun:';
    orderDiv.appendChild(orderLabelSpan);

    const orderValueSpan = document.createElement('span');
    orderValueSpan.className = 'planet-info-value';
    const orderText = numberToOrdinalText(planet.orderFromSun);
    orderValueSpan.textContent = orderText;
    orderDiv.appendChild(orderValueSpan);

    infoDiv.appendChild(orderDiv);

    // Has rings
    const ringsDiv = document.createElement('div');
    ringsDiv.className = 'planet-info-item';

    const ringsIconSpan = document.createElement('span');
    ringsIconSpan.className = 'planet-info-icon';
    ringsIconSpan.innerHTML = '<i class="fa-solid fa-ring"></i>';
    ringsDiv.appendChild(ringsIconSpan);

    const ringsLabelSpan = document.createElement('span');
    ringsLabelSpan.className = 'planet-info-label';
    ringsLabelSpan.textContent = 'Has Rings:';
    ringsDiv.appendChild(ringsLabelSpan);

    const ringsValueSpan = document.createElement('span');
    ringsValueSpan.className = 'planet-info-value';
    ringsValueSpan.textContent = planet.hasRings ? 'Yes' : 'No';
    ringsDiv.appendChild(ringsValueSpan);

    infoDiv.appendChild(ringsDiv);

    // Atmosphere
    const atmDiv = document.createElement('div');
    atmDiv.className = 'planet-info-item';

    const atmIconSpan = document.createElement('span');
    atmIconSpan.className = 'planet-info-icon';
    atmIconSpan.innerHTML = '<i class="fa-solid fa-wind"></i>';
    atmDiv.appendChild(atmIconSpan);

    const atmLabelSpan = document.createElement('span');
    atmLabelSpan.className = 'planet-info-label';
    atmLabelSpan.textContent = 'Atmosphere:';
    atmDiv.appendChild(atmLabelSpan);

    const atmValueSpan = document.createElement('span');
    atmValueSpan.className = 'planet-info-value';
    if (planet.mainAtmosphere && planet.mainAtmosphere.length > 0) {
        atmValueSpan.textContent = planet.mainAtmosphere.join(', ');
    } else {
        atmValueSpan.textContent = 'None detected';
    }
    atmDiv.appendChild(atmValueSpan);

    infoDiv.appendChild(atmDiv);

    // Temperature box
    const tempBoxDiv = document.createElement('div');
    tempBoxDiv.className = 'planet-temp-box';

    const tempTitleDiv = document.createElement('div');
    tempTitleDiv.className = 'planet-temp-title';

    const tempIconSpan = document.createElement('span');
    tempIconSpan.className = 'planet-info-icon';
    tempIconSpan.innerHTML = '<i class="fa-solid fa-temperature-half"></i>';
    tempTitleDiv.appendChild(tempIconSpan);

    const tempTitle = document.createElement('span');
    tempTitle.textContent = 'Surface Temperature (°C)';
    tempTitleDiv.appendChild(tempTitle);

    tempBoxDiv.appendChild(tempTitleDiv);

    // Temperature grid
    const tempGridDiv = document.createElement('div');
    tempGridDiv.className = 'temp-grid';

    // Min temp
    const minTempDiv = document.createElement('div');
    minTempDiv.className = 'temp-item';

    const minTempLabel = document.createElement('div');
    minTempLabel.className = 'temp-label';
    minTempLabel.textContent = 'Min';
    minTempDiv.appendChild(minTempLabel);

    const minTempValue = document.createElement('div');
    minTempValue.className = 'temp-value';
    minTempValue.textContent = planet.surfaceTemperatureC && planet.surfaceTemperatureC.min !== undefined ?
        `${planet.surfaceTemperatureC.min}°` : 'N/A';
    minTempDiv.appendChild(minTempValue);

    tempGridDiv.appendChild(minTempDiv);

    // Mean temp
    const meanTempDiv = document.createElement('div');
    meanTempDiv.className = 'temp-item';

    const meanTempLabel = document.createElement('div');
    meanTempLabel.className = 'temp-label';
    meanTempLabel.textContent = 'Mean';
    meanTempDiv.appendChild(meanTempLabel);

    const meanTempValue = document.createElement('div');
    meanTempValue.className = 'temp-value';
    meanTempValue.textContent = planet.surfaceTemperatureC && planet.surfaceTemperatureC.mean !== undefined ?
        `${planet.surfaceTemperatureC.mean}°` : 'N/A';
    meanTempDiv.appendChild(meanTempValue);

    tempGridDiv.appendChild(meanTempDiv);

    // Max temp
    const maxTempDiv = document.createElement('div');
    maxTempDiv.className = 'temp-item';

    const maxTempLabel = document.createElement('div');
    maxTempLabel.className = 'temp-label';
    maxTempLabel.textContent = 'Max';
    maxTempDiv.appendChild(maxTempLabel);

    const maxTempValue = document.createElement('div');
    maxTempValue.className = 'temp-value';
    maxTempValue.textContent = planet.surfaceTemperatureC && planet.surfaceTemperatureC.max !== undefined ?
        `${planet.surfaceTemperatureC.max}°` : 'N/A';
    maxTempDiv.appendChild(maxTempValue);

    tempGridDiv.appendChild(maxTempDiv);

    tempBoxDiv.appendChild(tempGridDiv);
    infoDiv.appendChild(tempBoxDiv);

    listItem.appendChild(infoDiv);

    return listItem;
}

// CRUD Operations
async function fetchPlanets() {
    try {
        planetList.innerHTML = '<li class="loading">Loading planets...</li>';

        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error('Unexpected response format');
        }

        // Clear list
        planetList.innerHTML = '';

        // Display planets
        if (data.data.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-list';
            emptyItem.textContent = 'No planets found. Add one!';
            planetList.appendChild(emptyItem);
        } else {
            data.data.forEach(planet => {
                const planetElement = createPlanetElement(planet);
                planetList.appendChild(planetElement);
            });
        }
    } catch (error) {
        console.error('Error fetching planets:', error);
        planetList.innerHTML = `<li class="error">Error loading planets: ${error.message}</li>`;
    }
}

async function addPlanet(planet) {
    try {
        console.log('submitting planet: ', planet);
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(planet)
        });

        // Parse response as text first
        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Server response is not valid JSON: ${responseText}`);
        }

        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                throw new Error(`Validation failed: ${data.errors.join(', ')}`);
            } else if (response.status === 409 || (data.message && data.message.includes('duplicate'))) {
                throw new Error(`A planet with this order number already exists`);
            } else {
                throw new Error(data.message || `Server responded with status: ${response.status}`);
            }
        }

        if (!data.success) {
            throw new Error(data.message || 'Failed to add planet');
        }

        const planetElement = createPlanetElement(data.data);

        const emptyItem = planetList.querySelector('.empty-list');
        if (emptyItem) {
            planetList.innerHTML = '';
        }

        planetList.appendChild(planetElement);

        alert(`Planet ${data.data.name} added successfully!`);

        return true;
    } catch (error) {
        console.error('Error adding planet:', error);
        alert(`Failed to add planet: ${error.message}`);
        return false;
    }
}

async function updatePlanet(id, planet) {
    try {
        const response = await fetch(`${apiURL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(planet)
        });
        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Server response is not valid JSON: ${responseText}`);
        }

        if (!response.ok) {
            if (data.errors && Array.isArray(data.errors)) {
                throw new Error(`Validation failed: ${data.errors.join(', ')}`);
            } else if (response.status === 409 || (data.message && data.message.includes('duplicate'))) {
                throw new Error(`A planet with this order number already exists`);
            } else {
                throw new Error(data.message || `Server responded with status: ${response.status}`);
            }
        }
        if (!data.success) {
            throw new Error(data.message || 'Failed to update planet');
        }

        // Update the planet in the list
        const planetElement = document.querySelector(`li[data-id="${id}"]`);
        const updatedElement = createPlanetElement(data.data);

        if (planetElement) {
            planetList.replaceChild(updatedElement, planetElement);
        }

        return data.data;
    } catch (error) {
        console.error('Error updating planet:', error);
        alert(`Failed to update planet: ${error.message}`);
        return null;
    }
}

async function deletePlanet(id) {
    try {
        const response = await fetch(`${apiURL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to delete planet');
        }

        // Remove the planet from the list
        const planetElement = document.querySelector(`li[data-id="${id}"]`);
        if (planetElement) {
            planetElement.remove();
        }

        // Check if we need to show the "No planets found" message
        if (planetList.children.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-list';
            emptyItem.textContent = 'No planets found. Add one!';
            planetList.appendChild(emptyItem);
        }

        return true;
    } catch (error) {
        console.error('Error deleting planet:', error);
        alert(`Failed to delete planet: ${error.message}`);
        return false;
    }
}

async function deleteAllPlanets() {
    try {
        const response = await fetch(apiURL, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to delete all planets');
        }

        // Clear the planet list
        planetList.innerHTML = '';

        // Show the "No planets found" message
        const emptyItem = document.createElement('li');
        emptyItem.className = 'empty-list';
        emptyItem.textContent = 'No planets found. Add one!';
        planetList.appendChild(emptyItem);

        return true;
    } catch (error) {
        console.error('Error deleting all planets:', error);
        alert(`Failed to delete all planets: ${error.message}`);
        return false;
    }
}

// Form Handling
function getSelectedAtmosphereElements() {
    const selected = [];
    atmosphereInputs.forEach(input => {
        if (input.checked) {
            selected.push(input.value);
        }
    });
    return selected;
}

function resetForm() {
    planetForm.reset();
    submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Planet';
    submitBtn.style.backgroundColor = '#333';

    // Remove edit-mode class from all list items
    const editItems = document.querySelectorAll('li.edit-mode');
    editItems.forEach(item => item.classList.remove('edit-mode'));
}

async function validatePlanetData(planet, currentId = null) {
    const errors = [];

    // Name validation - required and not empty
    if (!planet.name || planet.name.trim() === '') {
        errors.push('Planet name is required');
    }

    // Order from Sun validation - must be a positive integer
    const orderValue = Number(planet.orderFromSun);
    if (isNaN(orderValue) || orderValue <= 0) {
        errors.push('Order from Sun must be a positive number');
    } else {
        // Check for duplicate order from sun
        try {
            // Fetch all planets to check for duplicates
            const response = await fetch(apiURL);
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                // Check if any other planet has the same orderFromSun value
                const duplicatePlanet = data.data.find(p =>
                    p.orderFromSun === orderValue && p._id !== currentId
                );

                if (duplicatePlanet) {
                    errors.push(`A planet with order ${orderValue} already exists (${duplicatePlanet.name})`);
                }
            }
        } catch (error) {
            console.error("Error checking for duplicate orderFromSun:", error);
            // Continue with submission - the server will catch duplicates if they exist
        }
    }

    // Temperature validation - if provided, min cannot be greater than max
    if (planet.surfaceTemperatureC) {
        const { min, max } = planet.surfaceTemperatureC;

        if (min !== null && max !== null) {
            const minVal = Number(min);
            const maxVal = Number(max);

            if (!isNaN(minVal) && !isNaN(maxVal) && minVal > maxVal) {
                errors.push('Minimum temperature cannot be greater than maximum temperature');
            }
        }
    }

    return errors;
}


function fillFormForEdit(planet) {
    // Set basic inputs
    planetNameInput.value = planet.name || '';
    planetOrderInput.value = planet.orderFromSun || '';
    planetRingsInput.checked = planet.hasRings || false;

    // Set atmosphere checkboxes
    atmosphereInputs.forEach(input => {
        input.checked = planet.mainAtmosphere && planet.mainAtmosphere.includes(input.value);
    });

    // Set temperature inputs
    if (planet.surfaceTemperatureC) {
        tempMinInput.value = planet.surfaceTemperatureC.min || '';
        tempMaxInput.value = planet.surfaceTemperatureC.max || '';
        tempMeanInput.value = planet.surfaceTemperatureC.mean || '';
    } else {
        tempMinInput.value = '';
        tempMaxInput.value = '';
        tempMeanInput.value = '';
    }

    // Change submit button to update
    submitBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Update Planet';
    submitBtn.style.backgroundColor = '#228B22';
}

function getPlanetFromForm() {
    const name = planetNameInput.value.trim();
    const orderFromSun = parseInt(planetOrderInput.value) || 0;
    const hasRings = planetRingsInput.checked;
    const mainAtmosphere = getSelectedAtmosphereElements();

    // Get temperature values
    const tempMin = parseFloat(tempMinInput.value);
    const tempMax = parseFloat(tempMaxInput.value);
    const tempMean = parseFloat(tempMeanInput.value);

    const temp = {
        min: (tempMinInput.value === '') ? null : (!isNaN(tempMin) ? tempMin : 0),
        max: (tempMaxInput.value === '') ? null : (!isNaN(tempMax) ? tempMax : 0),
        mean: (tempMeanInput.value === '') ? null : (!isNaN(tempMean) ? tempMean : 0)
    };

    // Create planet object
    const planet = {
        name,
        orderFromSun,
        hasRings,
        mainAtmosphere,
        surfaceTemperatureC: temp,
        discoveredDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    return planet;
}

function isEditMode() {
    return document.querySelector('li.edit-mode') !== null;
}

function getCurrentEditId() {
    const editItem = document.querySelector('li.edit-mode');
    return editItem ? editItem.getAttribute('data-id') : null;
}

function filterPlanets(searchTerm) {
    const planetItems = planetList.querySelectorAll('li:not(.empty-list):not(.error):not(.loading)');

    planetItems.forEach(item => {
        const planetName = item.querySelector('.planet-name').textContent.toLowerCase();
        if (planetName.includes(searchTerm.toLowerCase())) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Function to convert number to ordinal text
function numberToOrdinalText(num) {
    if (!num || isNaN(num)) return 'Unknown';

    // Convert to ordinal word
    const ordinalWords = [
        'first', 'second', 'third', 'fourth', 'fifth',
        'sixth', 'seventh', 'eighth', 'ninth', 'tenth'
    ];

    // Return the ordinal word if it's within our predefined list
    if (num >= 1 && num <= ordinalWords.length) {
        return ordinalWords[num - 1];
    }

    // Otherwise return the number with appropriate ordinal suffix
    const j = num % 10;
    const k = num % 100;

    if (j === 1 && k !== 11) {
        return num + "st";
    }
    if (j === 2 && k !== 12) {
        return num + "nd";
    }
    if (j === 3 && k !== 13) {
        return num + "rd";
    }
    return num + "th";
}

// Event Listeners
window.addEventListener('DOMContentLoaded', fetchPlanets);

planetForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Show loading indicator
    const originalButtonText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validating...';
    submitBtn.disabled = true;

    try {
        // Get planet data from form
        const planet = getPlanetFromForm();

        // Get current ID if in edit mode
        const currentId = isEditMode() ? getCurrentEditId() : null;

        // Validate planet data
        const validationErrors = await validatePlanetData(planet, currentId);

        if (validationErrors.length > 0) {
            alert('Please fix the following errors:\n' + validationErrors.join('\n'));
            return;
        }

        if (isEditMode()) {
            // Update existing planet
            if (currentId) {
                const success = await updatePlanet(currentId, planet);
                if (success) {
                    resetForm();
                }
            }
        } else {
            // Add new planet
            const success = await addPlanet(planet);
            if (success) {
                resetForm();
            }
        }
    } catch (error) {
        console.error("Error during form submission:", error);
        alert("An error occurred while processing your request. Please try again.");
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalButtonText;
        submitBtn.disabled = false;
    }
});

planetList.addEventListener('click', function(e) {
    // Handle edit button click
    if (e.target.classList.contains('fa-pen') ||
        (e.target.parentElement.classList.contains('edit-item') && e.target.classList.contains('btn-link'))) {

        const listItem = e.target.closest('li');
        if (listItem) {
            // Toggle edit mode for the item
            const isAlreadyInEditMode = listItem.classList.contains('edit-mode');

            // Remove edit-mode class from all items
            document.querySelectorAll('li.edit-mode').forEach(item => {
                if (item !== listItem) {
                    item.classList.remove('edit-mode');
                }
            });

            if (isAlreadyInEditMode) {
                // If already in edit mode, turn it off
                listItem.classList.remove('edit-mode');
                resetForm();
            } else {
                // Otherwise, turn on edit mode
                listItem.classList.add('edit-mode');

                // Get planet data from API
                const id = listItem.getAttribute('data-id');
                fetch(`${apiURL}/${id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            fillFormForEdit(data.data);

                            // Scroll to the form
                            planetForm.scrollIntoView({ behavior: 'smooth' });
                            planetNameInput.focus();
                        }
                    })
                    .catch(err => {
                        console.error('Error fetching planet for edit:', err);
                        alert('Failed to load planet data for editing');
                    });
            }
        }
    }

    // Handle delete button click
    if (e.target.classList.contains('fa-trash') ||
        (e.target.parentElement.classList.contains('delete-item') && e.target.classList.contains('btn-link'))) {

        const listItem = e.target.closest('li');
        if (listItem) {
            const id = listItem.getAttribute('data-id');
            const planetName = listItem.querySelector('.planet-name').textContent;

            if (confirm(`Are you sure you want to delete ${planetName}?`)) {
                deletePlanet(id);

                // If the deleted planet was in edit mode, reset the form
                if (listItem.classList.contains('edit-mode')) {
                    resetForm();
                }
            }
        }
    }
});

clearBtn.addEventListener('click', function() {
    // If in edit mode, just clear the form first
    if (isEditMode()) {
        resetForm();
        return;
    }

    // Ask for confirmation
    if (confirm('Are you sure you want to delete ALL planets?')) {
        deleteAllPlanets();
    }
});

filter.addEventListener('input', function(e) {
    filterPlanets(e.target.value);
});
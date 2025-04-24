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
const API_URL = 'http:eds-nodejs25.vercel.app/api/index';

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

    // Planet name
    const nameSpan = document.createElement('span');
    nameSpan.className = 'planet-name';
    nameSpan.textContent = planet.name;
    listItem.appendChild(nameSpan);

    // Order from sun
    const orderSpan = document.createElement('span');
    orderSpan.className = 'planet-order';
    orderSpan.textContent = planet.orderFromSun || '-';
    listItem.appendChild(orderSpan);

    // Has rings
    const ringsSpan = document.createElement('span');
    ringsSpan.className = 'planet-rings';
    ringsSpan.textContent = planet.hasRings ? 'Yes' : 'No';
    listItem.appendChild(ringsSpan);

    // Atmosphere
    const atmSpan = document.createElement('span');
    atmSpan.className = 'planet-atm';
    if (planet.mainAtmosphere && planet.mainAtmosphere.length > 0) {
        atmSpan.textContent = planet.mainAtmosphere.join(', ');
    } else {
        atmSpan.textContent = 'None detected';
    }
    listItem.appendChild(atmSpan);

    // Temperature
    const tempSpan = document.createElement('span');
    tempSpan.className = 'planet-temp';
    if (planet.surfaceTemperatureC) {
        tempSpan.textContent = `${planet.surfaceTemperatureC.min}° to ${planet.surfaceTemperatureC.max}°`;
    } else {
        tempSpan.textContent = 'Unknown';
    }
    listItem.appendChild(tempSpan);

    // Action buttons
    const actionsSpan = document.createElement('span');
    actionsSpan.className = 'planet-actions';

    // Edit button
    const editButton = createButton('blue', 'pen', 'edit-item');
    actionsSpan.appendChild(editButton);

    // Delete button
    const deleteButton = createButton('red', 'trash', 'delete-item');
    actionsSpan.appendChild(deleteButton);

    listItem.appendChild(actionsSpan);

    return listItem;
}

// CRUD Operations
async function fetchPlanets() {
    try {
        planetList.innerHTML = '<li class="loading">Loading planets...</li>';

        const response = await fetch(API_URL);

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
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(planet)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to add planet');
        }

        // Add the new planet to the list
        const planetElement = createPlanetElement(data.data);

        // Check if we have the "No planets found" message
        const emptyItem = planetList.querySelector('.empty-list');
        if (emptyItem) {
            planetList.innerHTML = '';
        }

        planetList.appendChild(planetElement);

        return data.data;
    } catch (error) {
        console.error('Error adding planet:', error);
        alert(`Failed to add planet: ${error.message}`);
        return null;
    }
}

async function updatePlanet(id, planet) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(planet)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();

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
        const response = await fetch(`${API_URL}/${id}`, {
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
        const response = await fetch(API_URL, {
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
    const tempMin = parseFloat(tempMinInput.value) || 0;
    const tempMax = parseFloat(tempMaxInput.value) || 0;
    const tempMean = parseFloat(tempMeanInput.value) || 0;

    // Create planet object
    const planet = {
        name,
        orderFromSun,
        hasRings,
        mainAtmosphere,
        surfaceTemperatureC: {
            min: tempMin,
            max: tempMax,
            mean: tempMean
        }
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

// Event Listeners
window.addEventListener('DOMContentLoaded', fetchPlanets);

planetForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get planet data from form
    const planet = getPlanetFromForm();

    // Check if name is provided
    if (!planet.name) {
        alert('Planet name is required');
        return;
    }

    if (isEditMode()) {
        // Update existing planet
        const id = getCurrentEditId();
        if (id) {
            const success = await updatePlanet(id, planet);
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
                fetch(`${API_URL}/${id}`)
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
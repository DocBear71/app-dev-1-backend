import './css/style.css';
import {logPlugin} from "@babel/preset-env/lib/debug";
const itemForm = document.getElementById('item-form');
const itemFormBtn = document.querySelector('#item-form button');
const itemInput = document.getElementById('item-input');
const itemList = document.getElementById('item-list');
const clearBtn = document.getElementById('clear');
const filter = document.getElementById('filter');

// Start create button functionality
function createButton(textColor = 'black', iconName = '', ...classes) {
    const button = document.createElement('button');
    button.className = `btn-link text-${textColor}`;
    classes.forEach(c => button.classList.add(c));
    if(iconName !== '') {
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

function createListItem(item) {
    let listItem = document.createElement('li');
    listItem.appendChild(document.createTextNode(item[0]));
    listItem.setAttribute('data-id', item[1]);
    const button = createButton('red', 'circle-xmark', 'remove-item');
    listItem.appendChild(button);
    itemList.appendChild(listItem);
}
// End create button functionality

// Start localStorage functionality
function getItemsFromStorage() {
    let listItemsArr = [];
    // fetch('http://localhost:5000/api/todos', {
    fetch('https://eds-nodejs25.vercel.app/api/todos', {
        method: 'GET'
    }).then(res => res.json())
        .then(json => {
            const todos = json.data;
            todos.forEach(todo => {
                const title = todo.title;
                const id = todo._id;
                listItemsArr.push([title, id]);
            })
        })
        .then(function() {
            // listItemsArr is a two-dimensional array
            // item is an array
            listItemsArr.forEach(item => {
                createListItem(item)});
            });

}

function storeListItem(itemName) {
    if(itemName !== "") {
        // fetch('http://localhost:5000/api/todos', {
        fetch('https://eds-nodejs25.vercel.app/api/todos', {
            method: 'POST',
            body: JSON.stringify({title: itemName}),
            headers: {'content-type': 'application/json; charset=UTF-8'}
        }).then(res => res.json())
            .then(json => {
                if (json.success) {
                    createListItem(itemName);
                }
            });
    }
}

function setUp() {
    itemList.innerHTML = '';
    getItemsFromStorage();

}

function clearStorage() {
    localStorage.removeItem('items');
}
// End localStorage functionality

// Start Update/Delete functionality
function updateItem(item) {
    // Step 1: place the item's text in the form's input field
    itemInput.value = item.textContent;
    // Step 2: Change the Add button to an Update button
    itemFormBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Update Item';
    itemFormBtn.style.backgroundColor = '#228B22';
    // Step 3: Change the style of all buttons except the one that was clicked
    itemList.querySelectorAll('li').forEach(i => i.classList.remove('edit-mode'));
    item.classList.add('edit-mode');
}

function inEditMode() {
    let editMode = false;
    const listItems = itemList.querySelectorAll('li');
    for (let i = 0; i < listItems.length; i++) {
        if(listItems[i].classList.contains('edit-mode')) {
            editMode = true;
            break;
        }
    }
    return editMode;
}

function updateListItem(itemName) {
    const listItems = itemList.querySelectorAll('li');
    for (let i = 0; i < listItems.length; i++) {
        let currentItem = listItems[i];
        if(currentItem.classList.contains('edit-mode')) {
            const id = currentItem.getAttribute('data-id');
            // todo: validate the id
            const toDo = {_id: id, title: itemName, userId: 1, completed: false};
            // fetch('Http://localhost:5000/api/todos/' + id, {
            fetch('https://eds-nodejs25.vercel.app/api/todos/' + id, {
                method: 'PUT',
                body: JSON.stringify(toDo),
                headers: {'content-type': 'application/json; charset=UTF-8'}
            }).then(res => res.json())
                .then (json => {
                    if (json.success) {
                        currentItem.textContent = "";
                        currentItem.appendChild(document.createTextNode(itemName));
                        const button = createButton('red', 'circle-xmark', 'remove-item');
                        currentItem.appendChild(button);
                        turnOffEdit(currentItem);
                    }
                });
                break;
        }
    }
}

function turnOffEdit(item) {
    // Step 1: remove the text in the form's input field
    itemInput.value = "";
    // Step 2: Change the Update button to an Add button
    itemFormBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Item';
    itemFormBtn.style.backgroundColor = '#333';
    // Step 3: Change the style of all buttons except the one that was clicked
    item.classList.remove('edit-mode');
}

function deleteItem(itemElement) {
    // Get the li element that contains the clicked X icon
    const listItem = itemElement.closest('li');
    const id = listItem.getAttribute('data-id');

    // Ask for confirmation
    const confirmDelete = confirm(`Are you sure you want to delete this item?`);

    if (confirmDelete) {
        console.log('Attempting to delete item with ID:', id);

        // Send DELETE request to the API
        fetch('https://eds-nodejs25.vercel.app/api/todos/' + id, {
            method: 'DELETE'
        })
            .then(res => {
                console.log('Delete response status:', res.status);

                if (res.ok) {
                    console.log('Delete request successful');
                    listItem.remove();
                    return res.json();
                } else {
                    return res.text().then(text => {
                        console.error('Error response body:', text);
                        throw new Error(`Server returned ${res.status}`);
                    });
                }
            })
            .then(data => {
                console.log('Delete response data:', data);
            })
            .catch(error => {
                console.error('Error deleting item:', error);
            });
    }
}

// End Update/Delete functionality

// Start Event Listeners
window.addEventListener('DOMContentLoaded', setUp);
itemForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let editMode = inEditMode();
    let inputItemValue = itemInput.value;
    if(inputItemValue !== '') {
        if (!editMode) {
            // Adding a new item
            storeListItem(inputItemValue);
            itemInput.value = '';
        } else {
            // Edit an existing item
            updateListItem(inputItemValue);
        }
    }
})

itemList.addEventListener('click', function (event) {
    if (event.target.tagName === 'LI') {
        // Code for edit mode remains the same
        if(event.target.classList.contains('edit-mode')) {
            turnOffEdit(event.target);
        } else {
            updateItem(event.target);
        }
    } else if(event.target.classList.contains('fa-circle-xmark')) {
        // Only delete when clicking the X icon
        deleteItem(event.target);
    } else if(event.target.parentElement.classList.contains('remove-item') &&
        event.target.classList.contains('btn-link')) {
        // This catches clicks on the button that contains the X icon
        const icon = event.target.querySelector('.fa-circle-xmark');
        if (icon) {
            deleteItem(event.target);
        }
    }
});

clearBtn.addEventListener('click', function(event) {
    let confirmClear = confirm('Are you sure you want to clear the list?');
    if (confirmClear) {
        itemList.innerHTML = '';
        clearStorage();
    }
});
// These events didn't work: change, keydown, keypress
filter.addEventListener('input', (event) => {
    let value = event.target.value;
    const listItemsArr = getItemsFromStorage();
    const filteredItems = listItemsArr.filter(item =>  item.toLowerCase().includes(value.toLowerCase()));
    itemList.innerHTML = '';
    filteredItems.forEach(item => {createListItem(item)});
});
// End Event Listeners

// ****************************************
// *      Start Code from February 27     *
// ****************************************
// listItems[0].style.backgroundColor = 'yellow';
// listItems[1].style.backgroundColor = 'orange';
// listItems.forEach((el) => el.style.color = 'red');
//
// const mainHeading = document.getElementById('main-heading');
// mainHeading.textContent = "Marc's Shopping List"
// mainHeading.style.color = 'yellow';
// mainHeading.style.backgroundColor = 'dodgerblue';
// mainHeading.style.padding = '0 20px';
// mainHeading.style.borderRadius = '20px';
// ****************************************
// *      End Code from February 27       *
// ****************************************


const todoForm = document.getElementById('new-todo-form')

todoForm.addEventListener('submit', function(event) {
    event.preventDefault()
    const newToDo = event.target.firstElementChild.value;
    let toDo;
    if (newToDo !== '') {
        toDo = {title: newToDo}

        fetch('https://eds-nodejs25.vercel.app/api/todos', {
            method: 'POST',
            body: JSON.stringify(toDo),
            headers: {'Content-Type': 'application/json; charset=UTF-8'}
        }).then(res => console.log(res.json()));

    }
});




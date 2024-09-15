const errorElement = document.getElementById('error')

async function fetchTodos() {
    try {
        const response = await fetch('../todos')

        if (response.redirected) {
            window.location.href = response.url
        }

        const data = await response.json()

        const todoItems = document.getElementById('todo-items')

        todoItems.innerHTML = ''

        if (data.length) {
            data.forEach((todo) => {
                const item = document.createElement('div')
                item.dataset.id = todo._id
                item.classList.add('todo-item')

                if (todo.completed) {
                    item.classList.add('completed')
                }

                const checkbox = document.createElement('input')
                checkbox.type = 'checkbox'
                checkbox.checked = todo.completed
                item.appendChild(checkbox)

                const text = document.createElement('p')
                text.innerHTML = `<span class="todo-title">${todo.title}</span> - <span class="todo-details">${todo.details}</span>`
                item.appendChild(text)

                todoItems.appendChild(item)
            })
        } else {
            todoItems.innerHTML = '<p>No todo items found!</p>'
        }

    } catch (error) {
        console.error(error)
    }
}

addEventListener("DOMContentLoaded", async () => {
    await fetchTodos()
})

document.getElementById('add-todo').addEventListener('submit', async (event) => {
    event.preventDefault()

    const title = document.getElementById('todo-title-input')
    const details = document.getElementById('todo-details-input')

    errorElement.innerHTML = ''

    try {
        const response = await fetch('../todos', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title.value,
                details: details.value
            })
        })

        if (response.redirected) {
            window.location.href = response.url
        }

        const data = await response.json()

        if (response.status !== 201) {
            throw new Error(`Creating todo failed - ${data.message}`)
        }

        title.value = ''
        details.value = ''

    } catch (error) {
        console.error(error)
        errorElement.innerHTML = error
    } finally {
        await fetchTodos()
    }
})

document.getElementById('todo-items').addEventListener('click', async (event) => {
    const item = event.target.parentNode
    console.log("clicked", event.target.type)

    if (event.target.type === 'checkbox') {
        const id = item.dataset.id

        try {
            const response = await fetch(`../todos/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completed: event.target.checked
                })
            })

            if (response.redirected) {
                window.location.href = response.url
            }
        } catch (error) {
            // TODO: Show error to the user
            console.log(error)
        } finally {
            await fetchTodos()
        }
    }
})

// TODO: Implement editing and deleting todos

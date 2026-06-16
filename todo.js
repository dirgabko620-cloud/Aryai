const TODOS_KEY = 'digitalmasadepan_todos';
let todos = [];

function loadTodos() {
    const saved = localStorage.getItem(TODOS_KEY);
    if (saved) {
        try { todos = JSON.parse(saved); } catch (_) { todos = []; }
    } else { todos = []; }
    renderTodos();
}

function saveTodos() {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
    renderTodos();
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    if (!todoList) return;
    if (todos.length === 0) {
        todoList.innerHTML = `<div class="todo-empty"><i class="fas fa-clipboard-list"></i>Belum ada tugas. Tambahkan tugas di atas!</div>`;
        return;
    }
    let html = '';
    todos.forEach((todo, index) => {
        const priorityClass = todo.priority || 'low';
        const priorityLabel = priorityClass.charAt(0).toUpperCase() + priorityClass.slice(1);
        const doneClass = todo.done ? 'done' : '';
        html += `
            <div class="todo-item" data-index="${index}">
              <div class="todo-info">
                <span class="todo-text ${doneClass}">${escapeHtml(todo.text)}</span>
                <span class="todo-priority ${priorityClass}">${priorityLabel}</span>
              </div>
              <div class="todo-actions">
                <button class="done-todo" data-index="${index}" title="Tandai selesai"><i class="fas ${todo.done ? 'fa-undo' : 'fa-check-circle'}"></i></button>
                <button class="delete-todo" data-index="${index}" title="Hapus"><i class="fas fa-trash-alt"></i></button>
              </div>
            </div>
          `;
    });
    todoList.innerHTML = html;

    todoList.querySelectorAll('.done-todo').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            toggleTodoDone(idx);
        });
    });
    todoList.querySelectorAll('.delete-todo').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            deleteTodo(idx);
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addTodo() {
    const todoInput = document.getElementById('todoInput');
    if (!todoInput) return;
    const text = todoInput.value.trim();
    if (!text) return;
    todos.push({ text, done: false, priority: 'low', createdAt: Date.now() });
    todoInput.value = '';
    saveTodos();
    runAIScheduler();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
}

function toggleTodoDone(index) {
    todos[index].done = !todos[index].done;
    saveTodos();
}

function runAIScheduler() {
    if (todos.length === 0) {
        const empty = document.querySelector('.todo-empty');
        if (empty) {
            empty.innerHTML = '<i class="fas fa-robot"></i> Tidak ada tugas untuk diatur prioritas. Tambahkan tugas dulu!';
        }
        return;
    }

    todos.forEach(todo => {
        const text = todo.text.toLowerCase();
        let priority = 'low';
        const highKeywords = ['urgent', 'penting', 'segera', 'deadline', 'darurat', 'besok', 'hari ini'];
        const mediumKeywords = ['minggu', 'butuh', 'perlu', 'nanti', 'persiapan'];

        if (highKeywords.some(kw => text.includes(kw))) priority = 'high';
        else if (mediumKeywords.some(kw => text.includes(kw))) priority = 'medium';
        else if (text.length > 30) priority = 'medium';
        else priority = 'low';

        if (todo.done) priority = 'low';
        todo.priority = priority;
    });

    todos.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        const aDone = a.done ? 1 : 0;
        const bDone = b.done ? 1 : 0;
        if (aDone !== bDone) return aDone - bDone;
        return order[a.priority] - order[b.priority];
    });

    saveTodos();

    const empty = document.querySelector('.todo-empty');
    if (empty) {
        empty.innerHTML = '<i class="fas fa-check-circle" style="color:var(--cyan);"></i> Prioritas diatur oleh AI! ✅';
        setTimeout(() => {
            if (todos.length === 0) {
                empty.innerHTML = '<i class="fas fa-clipboard-list"></i>Belum ada tugas. Tambahkan tugas di atas!';
            } else {
                renderTodos();
            }
        }, 1500);
    }
}
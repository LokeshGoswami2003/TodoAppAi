let todos = [];
let currentFilter = "all";

const todoInput = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const filterBtns = document.querySelectorAll(".filter-btn");
const todoCount = document.getElementById("todoCount");
const clearCompletedBtn = document.getElementById("clearCompleted");
const quoteContainer = document.getElementById("quoteContainer");
const refreshQuoteBtn = document.getElementById("refreshQuote");

// Use localStorage for persistence (will survive page refresh)
const STORAGE_KEY = "todos";

const storage = {
  get: function () {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to read todos from localStorage", e);
      return [];
    }
  },
  set: function (data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save todos to localStorage", e);
    }
  },
};

// Load todos from storage
function loadTodos() {
  todos = storage.get();
  renderTodos();
}

// Save todos to storage
function saveTodos() {
  storage.set(todos);
}

// Add new todo
function addTodo() {
  const text = todoInput.value.trim();
  if (text === "") return;

  const todo = {
    id: Date.now(),
    text: text,
    completed: false,
  };

  todos.push(todo);
  saveTodos();
  todoInput.value = "";
  renderTodos();
}

// Toggle todo completion
function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  renderTodos();
}

// Delete todo
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

// Clear completed todos
function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
}

// Render todos
function renderTodos() {
  const filteredTodos = todos.filter((todo) => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  if (filteredTodos.length === 0) {
    todoList.innerHTML = `
                    <div class="empty-state">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                        </svg>
                        <p>${
                          currentFilter === "completed"
                            ? "No completed tasks yet"
                            : "No tasks yet. Add one above!"
                        }</p>
                    </div>
                `;
  } else {
    todoList.innerHTML = filteredTodos
      .map(
        (todo) => `
                    <li class="todo-item ${todo.completed ? "completed" : ""}">
                        <input type="checkbox" ${
                          todo.completed ? "checked" : ""
                        } onchange="toggleTodo(${todo.id})" />
                        <span class="todo-text">${todo.text}</span>
                        <button class="delete-btn" onclick="deleteTodo(${
                          todo.id
                        })">Delete</button>
                    </li>
                `
      )
      .join("");
  }

  // Update stats
  const activeCount = todos.filter((todo) => !todo.completed).length;
  todoCount.textContent = `${activeCount} item${
    activeCount !== 1 ? "s" : ""
  } left`;

  // Show/hide clear completed button
  const hasCompleted = todos.some((todo) => todo.completed);
  clearCompletedBtn.style.display = hasCompleted ? "block" : "none";
}

// Event listeners
addBtn.addEventListener("click", addTodo);
todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTodo();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

clearCompletedBtn.addEventListener("click", clearCompleted);

// Fetch motivational quote

async function fetchQuote() {
  try {
    quoteContainer.innerHTML =
      '<p class="quote-loading">Loading inspiration...</p>';
    const response = await fetch(
      "https://api.api-ninjas.com/v2/randomquotes?categories=success,wisdom",
      {
        headers: {
          "X-Api-Key": "/Sr546W60xjHhJ0Cu8/QsQ==j3FQhq490Wyo1bmA",
        },
      }
    );
    const data = await response.json();

    quoteContainer.innerHTML = `
                    <p class="quote-text">"${data[0].quote}"</p>
                    <p class="quote-author">— ${data[0].author}</p>
                `;
  } catch (error) {
    quoteContainer.innerHTML =
      '<p class="quote-loading">Unable to load quote. Click to try again.</p>';
  }
}

refreshQuoteBtn.addEventListener("click", fetchQuote);

// Initialize
loadTodos();
fetchQuote();

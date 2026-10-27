
"use client";

import { useEffect, useState } from "react";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTodos() {
    try {
      setError("");
      const response = await fetch("/api/todos");
      if (!response.ok) throw new Error("Could not load todos");
      const data = await response.json();
      setTodos(data);
    } catch {
      setError("Todos load nahi ho sake. Server check karein.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function addTodo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || saving) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) throw new Error("Could not create todo");

      const newTodo = await response.json();
      setTodos((current) => [newTodo, ...current]);
      setTitle("");
    } catch {
      setError("Todo save nahi hua. Dobara try karein.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTodo(todo: Todo) {
    setError("");

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (!response.ok) throw new Error("Update failed");

      const updatedTodo = await response.json();
      setTodos((current) =>
        current.map((item) =>
          item.id === updatedTodo.id ? updatedTodo : item
        )
      );
    } catch {
      setError("Todo update nahi hua. Ho sakta hai API abhi ready na ho.");
    }
  }
   
  
async function saveEdit(id: number) {
  const trimmedTitle = editTitle.trim();

  if (!trimmedTitle) {
    setError("Todo title cannot be empty.");
    return;
  }

  try {
    setError("");

    const response = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmedTitle }),
    });

    if (!response.ok) throw new Error("Update failed");

    const updatedTodo = await response.json();

    setTodos((current) =>
      current.map((todo) => (todo.id === id ? updatedTodo : todo))
    );

    setEditingId(null);
    setEditTitle("");
  } catch {
    setError("Todo title update nahi hua. Dobara try karein.");
  }
}


  async function deleteTodo(id: number) {
    setError("");

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      setTodos((current) => current.filter((todo) => todo.id !== id));
    } catch {
      setError("Todo delete nahi hua. Ho sakta hai API abhi ready na ho.");
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length;

  return (
    <main className="todo-page">
      <section className="todo-card">
        <p className="eyebrow">YOUR DAILY WORKSPACE</p>
        <h1>My Todo List</h1>
        <p className="subtitle">One task at a time. You’ve got this.</p>

        <div className="progress-box">
          <div className="progress-label">
            <span>Your progress</span>
            <strong>{completedCount} / {todos.length} completed</strong>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${todos.length ? (completedCount / todos.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <form className="todo-form" onSubmit={addTodo}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What do you need to do?"
            aria-label="Todo title"
            maxLength={200}
          />
          <button type="submit" disabled={saving || !title.trim()}>
            {saving ? "Adding..." : "+ Add"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="list-heading">
          <h2>Your tasks</h2>
          <span>{todos.length} total</span>
        </div>

        {loading ? (
          <p className="empty-message">Loading your tasks...</p>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✓</span>
            <h3>All clear!</h3>
            <p>Add your first task above to get started.</p>
          </div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li className="todo-item" key={todo.id}>
                <label className="todo-label">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                  />
                  
{editingId === todo.id ? (
  <input
    value={editTitle}
    onChange={(event) => setEditTitle(event.target.value)}
    aria-label="Edit todo title"
    maxLength={200}
    autoFocus
  />
) : (
  <span className={todo.completed ? "todo-title completed" : "todo-title"}>
    {todo.title}
  </span>
)}

                </label>
                
{editingId === todo.id ? (
  <>
    <button
      type="button"
      onClick={() => saveEdit(todo.id)}
    >
      Save
    </button>

    <button
      type="button"
      onClick={() => {
        setEditingId(null);
        setEditTitle("");
        setError("");
      }}
    >
      Cancel
    </button>
  </>
) : (
  <button
    type="button"
    onClick={() => {
      setEditingId(todo.id);
      setEditTitle(todo.title);
      setError("");
    }}
  >
    Edit
  </button>
)}

<button
  className="delete-button"
  type="button"
  onClick={() => deleteTodo(todo.id)}
  aria-label={`Delete ${todo.title}`}
  title="Delete task"
>
  Delete
</button>

              </li>
            ))}
          </ul>
        )}

        <p className="footer-note">Your tasks are saved in your database.</p>
      </section>
    </main>
  );
}

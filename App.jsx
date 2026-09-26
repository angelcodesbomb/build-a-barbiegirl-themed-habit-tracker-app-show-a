import React, { useState, useEffect } from "react";
import { getAll, insert, update, reset } from "./lib/db.js";

// Simple helper to generate unique IDs
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

function HabitItem({ habit, onToggle }) {
  const handleChange = (e) => {
    onToggle(habit.id, e.target.checked);
  };

  return (
    <li style={styles.habitItem}>
      <label style={styles.habitLabel}>
        <input
          type="checkbox"
          checked={habit.doneToday}
          onChange={handleChange}
          aria-label={`Mark ${habit.name} as done for today`}
          style={styles.checkbox}
        />
        <span>{habit.name}</span>
      </label>
      <span style={styles.streak}>🔥 {habit.streak}</span>
    </li>
  );
}

export default function App() {
  const [habits, setHabits] = useState([]);
  const [newName, setNewName] = useState("");

  // Load habits from db (localStorage) on mount
  useEffect(() => {
    const stored = getAll();
    // Ensure each habit has a doneToday flag based on lastCompleted date
    const today = new Date().toDateString();
    const enriched = stored.map((h) => ({
      ...h,
      doneToday: h.lastCompleted === today,
    }));
    setHabits(enriched);
  }, []);

  const saveHabits = (updated) => {
    setHabits(updated);
    // Persist each habit individually using update/insert
    updated.forEach((h) => {
      const { id, name, streak, lastCompleted } = h;
      update(id, { id, name, streak, lastCompleted });
    });
  };

  const handleToggle = (id, checked) => {
    const today = new Date().toDateString();
    const updated = habits.map((h) => {
      if (h.id !== id) return h;
      if (checked && !h.doneToday) {
        // Mark as done today and increase streak
        return {
          ...h,
          streak: h.streak + 1,
          lastCompleted: today,
          doneToday: true,
        };
      } else if (!checked && h.doneToday) {
        // Unchecking: revert streak (optional safety)
        return {
          ...h,
          streak: Math.max(0, h.streak - 1),
          lastCompleted: "",
          doneToday: false,
        };
      }
      return h;
    });
    saveHabits(updated);
  };

  const handleAddHabit = () => {
    if (!newName.trim()) return;
    const today = new Date().toDateString();
    const newHabit = {
      id: generateId(),
      name: newName.trim(),
      streak: 0,
      lastCompleted: "",
      doneToday: false,
    };
    const updated = [...habits, newHabit];
    insert(newHabit.id, { id: newHabit.id, name: newHabit.name, streak: newHabit.streak, lastCompleted: newHabit.lastCompleted });
    setHabits(updated);
    setNewName("");
  };

  const handleResetAll = () => {
    reset();
    setHabits([]);
  };

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Barbiegirl Habit Tracker</h1>
      </header>
      <section style={styles.section}>
        <ul style={styles.list}>
          {habits.map((habit) => (
            <HabitItem key={habit.id} habit={habit} onToggle={handleToggle} />
          ))}
        </ul>
        <div style={styles.addContainer}>
          <input
            type="text"
            placeholder="New habit"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            aria-label="Habit name"
            style={styles.input}
          />
          <button onClick={handleAddHabit} aria-label="Add habit" style={styles.addButton}>
            + Add
          </button>
        </div>
        <button onClick={handleResetAll} aria-label="Reset all habits" style={styles.resetButton}>
          Reset All
        </button>
      </section>
    </main>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "1rem",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#fff8f0",
    color: "#333",
  },
  header: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.8rem",
    color: "#d63384",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  habitItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem",
    borderBottom: "1px solid #eee",
  },
  habitLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
  },
  checkbox: {
    width: "1rem",
    height: "1rem",
  },
  streak: {
    fontWeight: "bold",
    color: "#ff6f61",
  },
  addContainer: {
    display: "flex",
    gap: "0.5rem",
  },
  input: {
    flex: 1,
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  addButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#d63384",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  resetButton: {
    marginTop: "0.5rem",
    padding: "0.4rem 0.8rem",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    alignSelf: "flex-start",
  },
};
const STORAGE_KEY = "sprout_db";

const SEED_DATA = {
  habits: [
    { id: "h1", name: "Morning meditation", streak: 5 },
    { id: "h2", name: "Drink 8 glasses water", streak: 12 },
    { id: "h3", name: "Read 20 pages", streak: 3 },
    { id: "h4", name: "Evening walk", streak: 7 },
    { id: "h5", name: "Journal gratitude", streak: 10 },
    { id: "h6", name: "No sugar day", streak: 2 },
    { id: "h7", name: "Yoga session", streak: 4 },
    { id: "h8", name: "Learn guitar chords", streak: 1 },
    { id: "h9", name: "Call a friend", streak: 6 },
    { id: "h10", name: "Plan tomorrow", streak: 8 }
  ]
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadDb() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : deepClone(SEED_DATA);
}

function saveDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

let _db = loadDb();

export function getAll(table) {
  return deepClone(_db[table] ?? []);
}

export function getById(table, id) {
  const rec = (_db[table] ?? []).find(r => r.id === id);
  return rec ? deepClone(rec) : null;
}

export function insert(table, record) {
  if (!(_db[table])) _db[table] = [];
  const copy = deepClone(record);
  _db[table].push(copy);
  saveDb(_db);
  return copy;
}

export function update(table, id, patch) {
  const arr = _db[table] ?? [];
  const idx = arr.findIndex(r => r.id === id);
  if (idx === -1) return null;
  const updated = { ...arr[idx], ...patch };
  arr[idx] = updated;
  saveDb(_db);
  return deepClone(updated);
}

export function remove(table, id) {
  const arr = _db[table] ?? [];
  const idx = arr.findIndex(r => r.id === id);
  if (idx === -1) return false;
  arr.splice(idx, 1);
  saveDb(_db);
  return true;
}

export function reset() {
  _db = deepClone(SEED_DATA);
  saveDb(_db);
}

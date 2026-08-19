import { BrewLogEntry, Recipe, BeanInfo } from '../types';

const DB_NAME = 'hand_drip_coffee_db';
const DB_VERSION = 2;
const STORE_LOGS = 'brew_logs';
const STORE_RECIPES = 'custom_recipes';
const STORE_BEANS = 'custom_beans';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_LOGS)) {
        const logStore = db.createObjectStore(STORE_LOGS, { keyPath: 'id' });
        logStore.createIndex('timestamp', 'timestamp', { unique: false });
        logStore.createIndex('method', 'method', { unique: false });
        logStore.createIndex('recipeId', 'recipeId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_RECIPES)) {
        const recipeStore = db.createObjectStore(STORE_RECIPES, { keyPath: 'id' });
        recipeStore.createIndex('method', 'method', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_BEANS)) {
        db.createObjectStore(STORE_BEANS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// LocalStorage fallback in case IndexedDB is restricted in sandboxed iframe
const LOCAL_STORAGE_KEY_LOGS = 'hand_drip_brew_logs_backup';
const LOCAL_STORAGE_KEY_RECIPES = 'hand_drip_custom_recipes_backup';
const LOCAL_STORAGE_KEY_BEANS = 'hand_drip_custom_beans_backup';

function getLocalStorageLogs(): BrewLogEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStorageLogs(logs: BrewLogEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch {
    // ignore
  }
}

export async function getAllBrewLogs(): Promise<BrewLogEntry[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_LOGS, 'readonly');
      const store = tx.objectStore(STORE_LOGS);
      const request = store.getAll();

      request.onsuccess = () => {
        const logs: BrewLogEntry[] = request.result || [];
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        saveLocalStorageLogs(logs);
        resolve(logs);
      };

      request.onerror = () => {
        resolve(getLocalStorageLogs());
      };
    });
  } catch {
    return getLocalStorageLogs();
  }
}

export async function saveBrewLog(entry: BrewLogEntry): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_LOGS, 'readwrite');
      const store = tx.objectStore(STORE_LOGS);
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // fallback
    const logs = getLocalStorageLogs();
    const existingIdx = logs.findIndex(l => l.id === entry.id);
    if (existingIdx >= 0) {
      logs[existingIdx] = entry;
    } else {
      logs.unshift(entry);
    }
    saveLocalStorageLogs(logs);
  }
}

export async function updateBrewLog(entry: BrewLogEntry): Promise<void> {
  await saveBrewLog(entry);
}

export async function deleteBrewLog(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_LOGS, 'readwrite');
      const store = tx.objectStore(STORE_LOGS);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // fallback
  }
  const logs = getLocalStorageLogs().filter(l => l.id !== id);
  saveLocalStorageLogs(logs);
}

export async function getAllCustomRecipes(): Promise<Recipe[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_RECIPES, 'readonly');
      const store = tx.objectStore(STORE_RECIPES);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY_RECIPES);
          resolve(raw ? JSON.parse(raw) : []);
        } catch {
          resolve([]);
        }
      };
    });
  } catch {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_RECIPES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export async function saveCustomRecipe(recipe: Recipe): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_RECIPES, 'readwrite');
      const store = tx.objectStore(STORE_RECIPES);
      const request = store.put(recipe);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // fallback
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_RECIPES);
    const recipes: Recipe[] = raw ? JSON.parse(raw) : [];
    const idx = recipes.findIndex(r => r.id === recipe.id);
    if (idx >= 0) {
      recipes[idx] = recipe;
    } else {
      recipes.push(recipe);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_RECIPES, JSON.stringify(recipes));
  } catch {
    // ignore
  }
}

export async function deleteCustomRecipe(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_RECIPES, 'readwrite');
      const store = tx.objectStore(STORE_RECIPES);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // fallback
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_RECIPES);
    const recipes: Recipe[] = raw ? JSON.parse(raw) : [];
    const filtered = recipes.filter(r => r.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_RECIPES, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

// === User Custom Coffee Beans Storage ===
export async function getAllCustomBeans(): Promise<BeanInfo[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_BEANS, 'readonly');
      const store = tx.objectStore(STORE_BEANS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => {
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY_BEANS);
          resolve(raw ? JSON.parse(raw) : []);
        } catch {
          resolve([]);
        }
      };
    });
  } catch {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_BEANS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export async function saveCustomBean(bean: BeanInfo): Promise<void> {
  const beanWithId: BeanInfo = {
    ...bean,
    id: bean.id || `bean_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    isCustom: true,
  };

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_BEANS, 'readwrite');
      const store = tx.objectStore(STORE_BEANS);
      const request = store.put(beanWithId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // fallback
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_BEANS);
    const beans: BeanInfo[] = raw ? JSON.parse(raw) : [];
    const idx = beans.findIndex(b => b.id === beanWithId.id || (b.name === beanWithId.name && b.isCustom));
    if (idx >= 0) {
      beans[idx] = beanWithId;
    } else {
      beans.unshift(beanWithId);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_BEANS, JSON.stringify(beans));
  } catch {
    // ignore
  }
}

export async function deleteCustomBean(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_BEANS, 'readwrite');
      const store = tx.objectStore(STORE_BEANS);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // fallback
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_BEANS);
    const beans: BeanInfo[] = raw ? JSON.parse(raw) : [];
    const filtered = beans.filter(b => b.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_BEANS, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

/**
 * Export logs as JSON file download
 */
export function exportToJSON(logs: BrewLogEntry[]) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `coffee-brew-log-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export const exportLogsAsJSON = exportToJSON;

/**
 * Export logs as CSV file download
 */
export function exportToCSV(logs: BrewLogEntry[]) {
  const headers = [
    'Timestamp',
    'Method',
    'Recipe Name',
    'Bean Name',
    'Dose (g)',
    'Water (g)',
    'Ratio',
    'Grind',
    'Temp (°C)',
    'Rating',
    'Actual Scale (g)',
    'Deviation (g)',
    'Taste Descriptors',
    'Suggestion',
    'Notes'
  ];

  const escapeCSV = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = logs.map(entry => [
    escapeCSV(entry.timestamp),
    escapeCSV(entry.method),
    escapeCSV(entry.recipeName),
    escapeCSV(entry.beanName ?? ''),
    escapeCSV(entry.dose),
    escapeCSV(entry.water),
    escapeCSV(entry.ratio),
    escapeCSV(entry.grind),
    escapeCSV(entry.temp),
    escapeCSV(entry.rating),
    escapeCSV(entry.actualWeight ?? ''),
    escapeCSV(entry.deviation !== null && entry.deviation !== undefined ? `${entry.deviation > 0 ? '+' : ''}${entry.deviation}` : ''),
    escapeCSV(entry.descriptors ? entry.descriptors.join('; ') : ''),
    escapeCSV(entry.suggestion ?? ''),
    escapeCSV(entry.notes ?? '')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `coffee-brew-log-${dateStr}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}

export const exportLogsAsCSV = exportToCSV;

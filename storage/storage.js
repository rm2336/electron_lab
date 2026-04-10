// Storage provider — detects Electron vs browser at runtime.
// All methods are async so the interface is identical when a DB is added.
// To swap in a DB: only the IPC handler bodies in index.js need to change.

const Storage = (() => {
  const isElectron = () =>
    typeof window !== 'undefined' &&
    typeof window.electronAPI !== 'undefined';

  // ── Electron provider (IPC → main process → file/DB) ─────────────────────
  const electronProvider = {
    notes: {
      getAll: ()      => window.electronAPI.notes.getAll(),
      save:   (notes) => window.electronAPI.notes.save(notes),
    },
    mood: {
      getAll: ()      => window.electronAPI.mood.getAll(),
      save:   (entry) => window.electronAPI.mood.save(entry),
    },
  };

  // ── localStorage provider (GitHub Pages / browser fallback) ───────────────
  const localProvider = {
    notes: {
      getAll: () =>
        Promise.resolve(JSON.parse(localStorage.getItem('notes') || '[]')),
      save: (notes) => {
        localStorage.setItem('notes', JSON.stringify(notes));
        return Promise.resolve();
      },
    },
    mood: {
      getAll: () =>
        Promise.resolve(JSON.parse(localStorage.getItem('mood') || '[]')),
      save: (entry) => {
        const log = JSON.parse(localStorage.getItem('mood') || '[]');
        const idx = log.findIndex(e => e.date === entry.date);
        if (idx !== -1) {
          log[idx] = entry;
        } else {
          log.push(entry);
        }
        localStorage.setItem('mood', JSON.stringify(log));
        return Promise.resolve();
      },
    },
  };

  return isElectron() ? electronProvider : localProvider;
})();

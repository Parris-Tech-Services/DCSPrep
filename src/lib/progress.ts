import type { TrainingModule } from '../types/training';

export type QuizAttempt = {
  attemptAtIso: string;
  score: number; // 0-100
  answers: Record<string, number | boolean>;
};

export type ModuleProgress = {
  sectionsRead: Record<string, boolean>;
  flashcards: Record<string, 'known' | 'learning' | 'unseen'>;
  quizAttempts: QuizAttempt[];
};

export type UserProgress = {
  lastOpenedModuleId?: string;
  modules: Record<string, ModuleProgress>;
};

const STORAGE_KEY = 'dcsprep_user_progress_v1';
let preserveUnreadableSave = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Storage is an external boundary: retain valid entries from older or damaged saves.
export function parseProgress(value: unknown): UserProgress {
  if (!isRecord(value) || !isRecord(value.modules)) return { modules: {} };
  const modules: Record<string, ModuleProgress> = {};
  for (const [id, raw] of Object.entries(value.modules)) {
    if (!isRecord(raw)) continue;
    const sectionsRead = Object.fromEntries(Object.entries(isRecord(raw.sectionsRead) ? raw.sectionsRead : {}).filter(([, v]) => typeof v === 'boolean')) as Record<string, boolean>;
    const flashcards = Object.fromEntries(Object.entries(isRecord(raw.flashcards) ? raw.flashcards : {}).filter(([, v]) => v === 'known' || v === 'learning' || v === 'unseen')) as ModuleProgress['flashcards'];
    const quizAttempts = (Array.isArray(raw.quizAttempts) ? raw.quizAttempts : []).filter((attempt): attempt is QuizAttempt => isRecord(attempt) && typeof attempt.attemptAtIso === 'string' && typeof attempt.score === 'number' && Number.isFinite(attempt.score) && attempt.score >= 0 && attempt.score <= 100 && isRecord(attempt.answers) && Object.values(attempt.answers).every((v) => typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v))));
    Object.defineProperty(modules, id, { value: { sectionsRead, flashcards, quizAttempts }, enumerable: true, writable: true, configurable: true });
  }
  return { modules, ...(typeof value.lastOpenedModuleId === 'string' ? { lastOpenedModuleId: value.lastOpenedModuleId } : {}) };
}

export function getProgress(): UserProgress {
  if (typeof localStorage === 'undefined') return { modules: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { modules: {} };
    let value: unknown;
    try { value = JSON.parse(raw); } catch { value = null; }
    const progress = parseProgress(value);
    if (JSON.stringify(value) !== JSON.stringify(progress)) {
      // Keep the original once, before the UI can persist a repaired projection.
      try {
        if (!localStorage.getItem(STORAGE_KEY + '_recovery')) localStorage.setItem(STORAGE_KEY + '_recovery', raw);
      } catch {
        preserveUnreadableSave = true;
      }
    }
    return progress;
  } catch (err) {
    console.error('getProgress error', err);
    return { modules: {} };
  }
}

export function saveProgress(progress: UserProgress) {
  if (preserveUnreadableSave) {
    console.error('Progress could not be saved: the original damaged save could not be backed up.');
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('saveProgress error', err);
  }
}

export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('resetProgress error', err);
  }
}

export function ensureModuleProgress(progress: UserProgress, module: TrainingModule): UserProgress {
  if (Object.prototype.hasOwnProperty.call(progress.modules, module.id)) return progress;
  return {
    ...progress,
    modules: {
      ...progress.modules,
      [module.id]: {
        sectionsRead: Object.fromEntries(module.sections.map((s) => [s.id, false])),
        flashcards: Object.fromEntries(module.flashcards.map((f) => [f.id, 'unseen' as const])),
        quizAttempts: []
      }
    }
  };
}

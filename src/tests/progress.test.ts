import { describe, it, expect } from 'vitest';
import { parseProgress, ensureModuleProgress, getProgress } from '../lib/progress';
import { modules } from '../data/modules';

describe('saved learning progress', () => {
  it.each([null, [], 42, {}, {modules: null}])('opens safely for invalid storage %j', value => {
    expect(parseProgress(value)).toEqual({modules: {}});
  });
  it('retains valid learning while filtering damaged entries', () => {
    const value = parseProgress({modules:{foundations:{sectionsRead:{a:true,b:'yes'},flashcards:{a:'known',b:'bad'},quizAttempts:[null,{score:500},{attemptAtIso:'2026-10-23',score:75,answers:{q:1}}]}}});
    expect(value.modules.foundations).toEqual({sectionsRead:{a:true},flashcards:{a:'known'},quizAttempts:[{attemptAtIso:'2026-10-23',score:75,answers:{q:1}}]});
  });
  it('initialises a module without mutating prior React state', () => {
    const original = Object.freeze({modules:Object.freeze({})});
    const next = ensureModuleProgress(original, modules[0]);
    expect(Object.keys(original.modules)).toHaveLength(0);
    expect(next.modules[modules[0].id].quizAttempts).toEqual([]);
    expect(ensureModuleProgress(next,modules[0])).toBe(next);
  });
  it('can render without browser storage', () => expect(getProgress()).toEqual({modules:{}}));
});

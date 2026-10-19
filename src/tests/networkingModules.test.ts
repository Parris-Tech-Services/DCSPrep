import { describe, it, expect } from 'vitest';
import { allModules } from '../data/allModules';
import { networkingModules } from '../data/networkingModules';

describe('MSP networking modules', () => {
  it('adds all ten modules after the DCS modules', () => {
    expect(networkingModules.map((m) => m.id)).toEqual([
      'net-dhcp', 'net-dns', 'net-vlans', 'net-routing', 'net-nat-firewall',
      'net-ports', 'net-vpn', 'net-wifi', 'net-troubleshooting', 'net-ad-m365',
    ]);
    for (const m of networkingModules) expect(allModules).toContain(m);
  });

  it('gives every module real lessons, flashcards and a quiz with valid answers', () => {
    for (const m of networkingModules) {
      expect(m.sections.length).toBeGreaterThanOrEqual(8);
      expect(m.flashcards.length).toBeGreaterThanOrEqual(6);
      expect(m.quiz.length).toBeGreaterThanOrEqual(5);
      for (const q of m.quiz) {
        if (q.type === 'mcq') {
          expect(q.answerIndex).toBeGreaterThanOrEqual(0);
          expect(q.answerIndex).toBeLessThan(q.options.length);
          expect(q.explanation).toBeTruthy();
        }
      }
    }
  });

  it('keeps module, section, flashcard and quiz ids unique across the app', () => {
    const ids = allModules.flatMap((m) => [m.id, ...m.sections.map((s) => `${m.id}/${s.id}`), ...m.flashcards.map((f) => `fc/${f.id}`), ...m.quiz.map((q) => `q/${q.id}`)]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('shows tables as readable lists, since sections render as plain text', () => {
    for (const m of networkingModules) for (const s of m.sections) expect(s.bodyMarkdown).not.toMatch(/\|\s*-{3,}/);
  });
});

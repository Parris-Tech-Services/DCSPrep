"use client";
import React, { useEffect, useMemo, useState } from 'react';
import type { TrainingModule, Flashcard } from '../../types/training';
import { getProgress, saveProgress, ensureModuleProgress, UserProgress } from '../../lib/progress';
import { getModuleCompletion } from '../../lib/moduleMath';
import ModuleTabs from './ModuleTabs';
import SectionReader from './SectionReader';
import FlashcardDeck from '../flashcards/FlashcardDeck';
import QuizEngine from '../quiz/QuizEngine';

export default function ModuleDetail({ moduleData }: { moduleData: TrainingModule }) {
  // Server and first client render must agree. Browser storage is only read after hydration.
  const [progress, setProgress] = useState<UserProgress>({ modules: {} });
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setProgress(ensureModuleProgress(getProgress(), moduleData));
    setLoaded(true);
  }, [moduleData]);

  // Never overwrite a saved record with the empty server-side initial state.
  useEffect(() => { if (loaded) saveProgress(progress); }, [loaded, progress]);

  const moduleProg = progress.modules[moduleData.id] ?? { sectionsRead: {}, flashcards: {}, quizAttempts: [] };

  const [tab, setTab] = useState('Learn');

  const onMarkRead = (sectionId: string) => {
    setProgress((p) => {
      const copy = { ...p } as UserProgress;
      copy.modules = { ...(copy.modules || {}) };
      copy.modules[moduleData.id] = { ...(copy.modules[moduleData.id] || { sectionsRead: {}, flashcards: {}, quizAttempts: [] }) };
      copy.modules[moduleData.id].sectionsRead = { ...(copy.modules[moduleData.id].sectionsRead || {}) };
      copy.modules[moduleData.id].sectionsRead[sectionId] = true;
      copy.lastOpenedModuleId = moduleData.id;
      return copy;
    });
  };

  const onUpdateFlashcard = (id: string, status: 'known' | 'learning' | 'unseen') => {
    setProgress((p) => {
      const copy = { ...p } as UserProgress;
      copy.modules = { ...(copy.modules || {}) };
      const m = (copy.modules[moduleData.id] ||= { sectionsRead: {}, flashcards: {}, quizAttempts: [] });
      m.flashcards = { ...(m.flashcards || {}) };
      m.flashcards[id] = status;
      copy.lastOpenedModuleId = moduleData.id;
      return copy;
    });
  };

  const onSubmitAttempt = (attempt: { attemptAtIso: string; score: number; answers: Record<string, number | boolean> }) => {
    setProgress((p) => {
      const copy = { ...p } as UserProgress;
      copy.modules = { ...(copy.modules || {}) };
      const m = (copy.modules[moduleData.id] ||= { sectionsRead: {}, flashcards: {}, quizAttempts: [] });
      m.quizAttempts = [...(m.quizAttempts || []), attempt];
      copy.lastOpenedModuleId = moduleData.id;
      return copy;
    });
  };

  const completion = useMemo(() => getModuleCompletion(moduleData.id, progress, moduleData), [progress, moduleData]);

  const knownCount = Object.values(moduleProg.flashcards || {}).filter((s) => s === 'known').length;
  const totalFlash = moduleData.flashcards.length;

  if (!loaded) return <div role="status" className="p-4 text-slate-600">Loading saved module progress…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-3 mb-2">
        <div className="text-sm text-slate-500">
          <a href="/" className="underline mr-2">← Home</a>
          <a href="/modules" className="underline">Modules</a>
        </div>
      </div>
      <div className="md:col-span-3 space-y-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xl font-semibold">{moduleData.title}</div>
              <div className="text-xs text-slate-500 mt-1">{moduleData.description}</div>
            </div>
            <div className="text-sm text-slate-500">Completion: <span className="font-semibold">{completion}%</span></div>
          </div>

          <div className="mt-3">
            <ModuleTabs tabs={["Learn", "Flashcards", "Quiz", "Checklist"]} onChange={(t) => setTab(t)} />
          </div>

          <div className="mt-4">
            {tab === 'Learn' && (
              <div className="space-y-4">
                {moduleData.sections.map((s) => (
                  <SectionReader key={s.id} id={s.id} title={s.title} bodyMarkdown={s.bodyMarkdown} onMarkRead={onMarkRead} isRead={Boolean(moduleProg.sectionsRead?.[s.id])} />
                ))}
              </div>
            )}

            {tab === 'Flashcards' && (
              <div>
                <div className="mb-3 text-sm text-slate-500">Known {knownCount}/{totalFlash} — flip with Space or click</div>
                <FlashcardDeck cards={moduleData.flashcards as Flashcard[]} statuses={moduleProg.flashcards || {}} onUpdate={onUpdateFlashcard} />
              </div>
            )}

            {tab === 'Quiz' && (
              <div>
                <QuizEngine questions={moduleData.quiz} onSubmitAttempt={onSubmitAttempt} />
              </div>
            )}

            {tab === 'Checklist' && (
              <div className="bg-white p-4 rounded shadow-sm">
                <h4 className="font-semibold">Learning objectives</h4>
                <ul className="list-disc pl-5 mt-2 text-sm text-slate-700">
                  {moduleData.learningObjectives.map((o) => <li key={o}>{o}</li>)}
                </ul>

                <div className="mt-4">
                  <h5 className="font-semibold">Sections status</h5>
                  <ul className="text-sm mt-2 list-disc pl-5 text-slate-600">
                    {moduleData.sections.map((s) => (
                      <li key={s.id}>{s.title} — {moduleProg.sectionsRead?.[s.id] ? 'Read' : 'Not read'}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="md:col-span-1">
        <div className="bg-white p-4 rounded shadow-sm text-sm">
          <div className="font-semibold">Module progress</div>
          <div className="mt-2">Completion: <strong>{completion}%</strong></div>
          <div className="mt-2 text-xs text-slate-500">Flashcards engaged: {Object.values(moduleProg.flashcards || {}).filter((s) => s !== 'unseen').length}/{totalFlash}</div>
          <div className="mt-3 text-xs text-slate-500">Latest quiz: {moduleProg.quizAttempts.length ? moduleProg.quizAttempts[moduleProg.quizAttempts.length - 1].score + '%' : 'No attempt'}</div>
        </div>
      </aside>
    </div>
  );
}

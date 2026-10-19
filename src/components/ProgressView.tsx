"use client";
import React, { useEffect, useState } from 'react';
import { allModules as modules } from '../data/allModules';
import { getProgress } from '../lib/progress';
import { getModuleCompletion } from '../lib/moduleMath';

export default function ProgressView() {
  const [progress, setProgress] = useState(() => getProgress());

  useEffect(() => {
    const onStorage = () => setProgress(getProgress());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your progress</h2>

      {modules.map((m) => (
        <div key={m.id} className="bg-white p-4 rounded shadow-sm flex items-center justify-between">
          <div>
            <div className="font-semibold">{m.title}</div>
            <div className="text-sm text-slate-500">{m.description}</div>
          </div>
          <div className="w-1/3 text-right">
            <div className="text-sm text-slate-500">Completion</div>
            <div className="mt-2 w-full bg-slate-100 h-3 rounded overflow-hidden inline-block">
              <div style={{ width: `${getModuleCompletion(m.id, progress, m)}%` }} className="h-3 bg-indigo-600" />
            </div>
            <div className="text-xs text-slate-500 mt-1">Score: {progress.modules?.[m.id]?.quizAttempts?.length ? progress.modules[m.id].quizAttempts.slice(-1)[0].score + '%' : '—'}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

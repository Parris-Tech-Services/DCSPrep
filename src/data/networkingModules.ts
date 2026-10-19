import type { TrainingModule } from '../types/training';
import { markdownTablesToLists, networkingCurriculum, type NetModule } from './networking/networkingCurriculum';

// The ten MSP networking modules that follow subnetting. Content lives in
// ./networking/networkingCurriculum.ts (shared with the other learning
// apps); this file only adapts it to DCSPrep's TrainingModule shape.

function scenarioMarkdown(m: NetModule): string {
  const s = m.scenario;
  const lines = [
    `**Ticket:** ${s.ticket.summary}`,
    `**Requester:** ${s.ticket.requester}, ${s.ticket.client} (priority ${s.ticket.priority})`,
    '',
    'Symptoms:',
    ...s.ticket.symptoms.map((x) => `- ${x}`),
    '',
    'Recent changes:',
    ...s.ticket.recentChanges.map((x) => `- ${x}`),
    '',
  ];
  s.steps.forEach((step, i) => {
    const best = step.options.find((o) => o.correct)!;
    lines.push(`Step ${i + 1}: ${step.prompt}`);
    lines.push(`- Best action: ${best.text}`);
    lines.push(`- Why: ${best.feedback}`);
    for (const o of step.options.filter((o) => !o.correct)) lines.push(`- Not this: ${o.text} (${o.feedback})`);
    lines.push('');
  });
  lines.push(`**Resolution:** ${s.resolution}`, '', `**Example ticket note:** ${s.ticketNote}`);
  return lines.join('\n');
}

function toTrainingModule(m: NetModule): TrainingModule {
  return {
    id: m.id,
    title: `MSP Networking ${m.order}: ${m.title}`,
    description: `${m.summary} ${m.whyItMatters}`,
    learningObjectives: m.objectives,
    sections: [
      ...m.sections.map((s) => ({ id: `${m.id}-${s.id}`, title: s.title, bodyMarkdown: markdownTablesToLists(s.body) })),
      {
        id: `${m.id}-key-terms`,
        title: 'Key terms',
        bodyMarkdown: m.keyTerms.map((k) => `- **${k.term}**: ${k.definition}`).join('\n'),
      },
      {
        id: `${m.id}-commands`,
        title: 'Commands to know',
        bodyMarkdown: m.commands.map((c) => `- ${c.command}\n  ${c.purpose}`).join('\n'),
      },
      {
        id: `${m.id}-mistakes`,
        title: 'Common mistakes',
        bodyMarkdown: m.commonMistakes.map((x) => `- ${x}`).join('\n'),
      },
      { id: `${m.id}-scenario`, title: `Ticket walkthrough: ${m.scenario.title}`, bodyMarkdown: scenarioMarkdown(m) },
      {
        id: `${m.id}-sources`,
        title: 'Sources',
        bodyMarkdown: m.sources.map((s) => `- ${s.title}: ${s.url}`).join('\n'),
      },
    ],
    flashcards: m.flashcards.map((f) => ({ id: f.id, front: f.front, back: f.back })),
    quiz: m.quiz.map((q) => ({
      id: q.id,
      type: 'mcq' as const,
      question: q.question,
      options: q.options,
      answerIndex: q.answerIndex,
      explanation: q.explanation,
    })),
  };
}

export const networkingModules: TrainingModule[] = networkingCurriculum.map(toTrainingModule);

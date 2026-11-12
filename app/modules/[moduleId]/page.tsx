import React from 'react';
import { allModules as modules } from '../../../src/data/allModules';
import ModuleDetail from '../../../src/components/modules/ModuleDetail';

export default async function ModulePage(props: { params: Promise<{ moduleId: string }> }) {
  const params = await props.params;
  const moduleData = modules.find((m) => m.id === params.moduleId);
  if (!moduleData) return <div className="bg-white p-6 rounded shadow-sm">Module not found.</div>;

  return (
    <div>
      <ModuleDetail moduleData={moduleData} />
    </div>
  );
}

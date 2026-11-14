import { modules as dcsModules } from './modules';
import { outdoorEducationModules } from './outdoorEducationModules';
import { genesisModule } from './genesisModule';
import { networkingModules } from './networkingModules';

export const allModules = [...dcsModules, ...networkingModules, ...outdoorEducationModules, genesisModule];
export default allModules;

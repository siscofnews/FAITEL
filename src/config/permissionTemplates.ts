export type ModulePerms = {
  view?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
  manage?: boolean;
};

export type PermissionMatrix = {
  members?: ModulePerms;
  churches?: ModulePerms;
  finance?: ModulePerms;
  agenda?: ModulePerms;
  schedules?: ModulePerms;
  reports?: ModulePerms;
  comms?: ModulePerms;
  ead?: ModulePerms;
  admin?: ModulePerms;
};

export interface RoleProfileTemplate {
  name: string;
  level: number; // 1 global, 2 matriz, 2.1 sede/subsede, 3 operacional, 4 básico
  permissions: PermissionMatrix;
}

export const ROLE_TEMPLATES: RoleProfileTemplate[] = [
  {
    name: 'super_admin',
    level: 1,
    permissions: {
      members: { view: true, create: true, update: true, delete: true, manage: true },
      churches: { view: true, create: true, update: true, delete: true, manage: true },
      finance: { view: true, create: true, update: true, delete: true, manage: true },
      agenda: { view: true, create: true, update: true, delete: true, manage: true },
      schedules: { view: true, create: true, update: true, delete: true, manage: true },
      reports: { view: true, manage: true },
      comms: { view: true, create: true, update: true, delete: true },
      ead: { view: true, create: true, update: true, delete: true, manage: true },
      admin: { manage: true },
    },
  },
  {
    name: 'presidente_matriz',
    level: 2,
    permissions: {
      members: { view: true, create: true, update: true, delete: true },
      churches: { view: true, create: true, update: true, manage: true },
      finance: { view: true, manage: true },
      agenda: { view: true, create: true, update: true },
      schedules: { view: true, create: true, update: true },
      reports: { view: true, manage: true },
      comms: { view: true, create: true, update: true },
      ead: { view: true },
    },
  },
  {
    name: 'vice_presidente',
    level: 2,
    permissions: {
      members: { view: true, update: true },
      churches: { view: true, update: true },
      finance: { view: true },
      agenda: { view: true, create: true, update: true },
      schedules: { view: true, update: true },
      reports: { view: true },
      comms: { view: true, create: true },
    },
  },
  {
    name: 'secretario',
    level: 3,
    permissions: {
      members: { view: true, create: true, update: true },
      churches: { view: true },
      agenda: { view: true, create: true, update: true },
      schedules: { view: true },
      reports: { view: true },
      comms: { view: true, create: true },
    },
  },
  {
    name: 'primeiro_tesoureiro',
    level: 3,
    permissions: {
      finance: { view: true, create: true, update: true, manage: true },
      reports: { view: true, manage: true },
      churches: { view: true },
      members: { view: true },
    },
  },
  {
    name: 'segundo_tesoureiro',
    level: 3,
    permissions: {
      finance: { view: true, create: true, update: true },
      reports: { view: true },
      churches: { view: true },
    },
  },
  {
    name: 'coordenador',
    level: 2.1,
    permissions: {
      schedules: { view: true, create: true, update: true },
      agenda: { view: true, create: true, update: true },
      members: { view: true },
      churches: { view: true },
    },
  },
  {
    name: 'presidente_estadual',
    level: 2,
    permissions: {
      churches: { view: true, update: true },
      members: { view: true },
      finance: { view: true },
      reports: { view: true },
    },
  },
  {
    name: 'membro_basico',
    level: 4,
    permissions: {
      members: { view: true },
      agenda: { view: true },
      schedules: { view: true },
      ead: { view: true },
    },
  },
];

export function getTemplatesForLevel(level: 'matriz' | 'sede' | 'subsede' | 'congregacao' | 'celula') {
  if (level === 'matriz') return ROLE_TEMPLATES.filter(r => r.level === 2 || r.level === 3 || r.level === 4);
  if (level === 'sede' || level === 'subsede') return ROLE_TEMPLATES.filter(r => r.level === 2.1 || r.level === 3 || r.level === 4);
  if (level === 'congregacao' || level === 'celula') return ROLE_TEMPLATES.filter(r => r.level === 3 || r.level === 4);
  return ROLE_TEMPLATES;
}

export function permittedLocalRolesForLevel(level: 'matriz' | 'sede' | 'subsede' | 'congregacao' | 'celula') {
  const names = getTemplatesForLevel(level).map(t => t.name);
  const allowed: string[] = [];
  if (names.includes('secretario')) allowed.push('secretario');
  if (names.includes('primeiro_tesoureiro')) allowed.push('primeiro_tesoureiro');
  if (names.includes('segundo_tesoureiro')) allowed.push('segundo_tesoureiro');
  if (names.includes('coordenador')) allowed.push('coordenador');
  if (names.includes('vice_presidente') && (level === 'matriz' || level === 'sede' || level === 'subsede')) allowed.push('vice_presidente');
  if (names.includes('presidente_estadual') && level === 'matriz') allowed.push('presidente_estadual');
  if (level === 'celula') return allowed.filter(r => r !== 'primeiro_tesoureiro' && r !== 'segundo_tesoureiro');
  return allowed;
}


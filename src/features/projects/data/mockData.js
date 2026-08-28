export const DEFAULT_PROJECT_ROWS = [
  { id: 'proj-1', key: 'PA', name: 'Plataforma Analytics', status: 'Activo', issuesCount: 324, velocity: 45.2, cycleTime: '2.8 días', progress: 75, lastSync: 'Hace 2 horas', color: '#8b5cf6' },
  { id: 'proj-2', key: 'MC', name: 'MCHAV Core', status: 'Activo', issuesCount: 278, velocity: 38.7, cycleTime: '3.1 días', progress: 68, lastSync: 'Hace 1 hora', color: '#3b82f6' },
  { id: 'proj-3', key: 'WD', name: 'Web Dashboard', status: 'Activo', issuesCount: 196, velocity: 32.1, cycleTime: '2.5 días', progress: 82, lastSync: 'Hace 3 horas', color: '#f97316' },
  { id: 'proj-4', key: 'AG', name: 'API Gateway', status: 'Activo', issuesCount: 156, velocity: 28.9, cycleTime: '3.7 días', progress: 61, lastSync: 'Hace 30 min', color: '#10b981' },
  { id: 'proj-5', key: 'MA', name: 'Mobile App', status: 'Pausado', issuesCount: 98, velocity: 12.4, cycleTime: '4.2 días', progress: 35, lastSync: 'Hace 5 horas', color: '#a855f7' },
  { id: 'proj-6', key: 'INF', name: 'Infraestructura', status: 'Activo', issuesCount: 67, velocity: 8.6, cycleTime: '2.1 días', progress: 91, lastSync: 'Hace 1 hora', color: '#06b6d4' },
];

export const PROJECT_VELOCITY_MAP = {
  'proj-1': [
    { sprint: 'Sprint 12', SP: 42 }, { sprint: 'Sprint 13', SP: 55 }, { sprint: 'Sprint 14', SP: 50 }, { sprint: 'Sprint 15', SP: 68 }, { sprint: 'Sprint 16', SP: 72 }, { sprint: 'Sprint 17', SP: 65 }
  ],
  'proj-2': [
    { sprint: 'Sprint 12', SP: 35 }, { sprint: 'Sprint 13', SP: 48 }, { sprint: 'Sprint 14', SP: 42 }, { sprint: 'Sprint 15', SP: 52 }, { sprint: 'Sprint 16', SP: 58 }, { sprint: 'Sprint 17', SP: 54 }
  ],
  'proj-3': [
    { sprint: 'Sprint 12', SP: 48 }, { sprint: 'Sprint 13', SP: 52 }, { sprint: 'Sprint 14', SP: 45 }, { sprint: 'Sprint 15', SP: 38 }, { sprint: 'Sprint 16', SP: 50 }, { sprint: 'Sprint 17', SP: 46 }
  ],
  'proj-4': [
    { sprint: 'Sprint 12', SP: 28 }, { sprint: 'Sprint 13', SP: 40 }, { sprint: 'Sprint 14', SP: 35 }, { sprint: 'Sprint 15', SP: 32 }, { sprint: 'Sprint 16', SP: 42 }, { sprint: 'Sprint 17', SP: 38 }
  ],
  'proj-5': [
    { sprint: 'Sprint 12', SP: 15 }, { sprint: 'Sprint 13', SP: 18 }, { sprint: 'Sprint 14', SP: 12 }, { sprint: 'Sprint 15', SP: 10 }, { sprint: 'Sprint 16', SP: 14 }, { sprint: 'Sprint 17', SP: 12 }
  ],
  'proj-6': [
    { sprint: 'Sprint 12', SP: 10 }, { sprint: 'Sprint 13', SP: 12 }, { sprint: 'Sprint 14', SP: 8 }, { sprint: 'Sprint 15', SP: 9 }, { sprint: 'Sprint 16', SP: 11 }, { sprint: 'Sprint 17', SP: 9 }
  ]
};

export const GENERAL_VELOCITY_DATA = [
  { sprint: 'Sprint 12', PA: 42, MC: 35, WD: 48, AG: 28 },
  { sprint: 'Sprint 13', PA: 55, MC: 48, WD: 52, AG: 40 },
  { sprint: 'Sprint 14', PA: 50, MC: 42, WD: 45, AG: 35 },
  { sprint: 'Sprint 15', PA: 68, MC: 52, WD: 38, AG: 32 },
  { sprint: 'Sprint 16', PA: 72, MC: 58, WD: 50, AG: 42 },
  { sprint: 'Sprint 17', PA: 65, MC: 54, WD: 46, AG: 38 },
];

export const MOCK_BURNUP_DATA = [
  { fecha_real: '13 ago', alcance_total: 225, trabajo_completado: 0, ritmo_ideal: 0, tareas_completadas: 0 },
  { fecha_real: '16 ago', alcance_total: 225, trabajo_completado: 20, ritmo_ideal: 22.5, tareas_completadas: 5 },
  { fecha_real: '19 ago', alcance_total: 225, trabajo_completado: 40, ritmo_ideal: 45, tareas_completadas: 12 },
  { fecha_real: '22 ago', alcance_total: 225, trabajo_completado: 60, ritmo_ideal: 67.5, tareas_completadas: 20 },
  { fecha_real: '25 ago', alcance_total: 230, trabajo_completado: 85, ritmo_ideal: 90, tareas_completadas: 35 },
  { fecha_real: '28 ago', alcance_total: 235, trabajo_completado: 120, ritmo_ideal: 112.5, tareas_completadas: 55 },
  { fecha_real: '31 ago', alcance_total: 235, trabajo_completado: 155, ritmo_ideal: 135, tareas_completadas: 80 },
  { fecha_real: '3 sep', alcance_total: 240, trabajo_completado: 180, ritmo_ideal: 157.5, tareas_completadas: 110 },
  { fecha_real: '7 sep', alcance_total: 240, trabajo_completado: 210, ritmo_ideal: 180, tareas_completadas: 130 },
];

export const MOCK_CFD_DATA = [
  { fecha_real: '13 ago', por_hacer: 200, en_progreso: 15, en_revision: 10, completado: 0 },
  { fecha_real: '16 ago', por_hacer: 170, en_progreso: 25, en_revision: 10, completado: 20 },
  { fecha_real: '19 ago', por_hacer: 140, en_progreso: 30, en_revision: 15, completado: 40 },
  { fecha_real: '22 ago', por_hacer: 110, en_progreso: 35, en_revision: 20, completado: 60 },
  { fecha_real: '25 ago', por_hacer: 80, en_progreso: 40, en_revision: 25, completado: 85 },
  { fecha_real: '28 ago', por_hacer: 55, en_progreso: 35, en_revision: 25, completado: 120 },
  { fecha_real: '31 ago', por_hacer: 35, en_progreso: 30, en_revision: 15, completado: 155 },
  { fecha_real: '3 sep', por_hacer: 20, en_progreso: 25, en_revision: 15, completado: 180 },
  { fecha_real: '7 sep', por_hacer: 10, en_progreso: 12, en_revision: 8, completado: 210 }
]; 

export const MOCK_BURNUP_DATA_EXTENDED = [
  ...MOCK_BURNUP_DATA,
  { fecha_real: '10 sep', alcance_total: 240, trabajo_completado: 230, ritmo_ideal: 202.5, tareas_completadas: 138 },
  { fecha_real: '13 sep', alcance_total: 240, trabajo_completado: 240, ritmo_ideal: 225, tareas_completadas: 141 },
];

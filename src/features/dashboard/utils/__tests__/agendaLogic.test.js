import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  isTaskOverdue, 
  classifyAgendaTasks, 
  getNubiaAnalysis,
  addDays,
  getTodayStr,
  formatDateLocal,
  getTaskDate
} from '../agendaLogic';

describe('Agenda Logic & NUBIIA Business Rules', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-24T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });


  const sampleTasks = [
    {
      id: '10302',
      key: 'SCRUM-152',
      text: 'Actualización del Dashboard de Desarrollador',
      priority: 'Medium',
      sp: 5,
      status: 'POR HACER',
      rawStatus: 'En curso',
      created_at: '2026-08-21',
      resolved_at: null,
      dueDate: '2026-08-28' // Sprint activo finaliza 28/08/2026 (o 25/08/2026)
    },
    {
      id: '10303',
      key: 'SCRUM-153',
      text: 'Verificar implementación de IA',
      priority: 'Alta',
      sp: 3,
      status: 'POR HACER',
      rawStatus: 'En curso',
      created_at: '2026-08-21',
      resolved_at: null,
      dueDate: '2026-08-25'
    },
    {
      id: '10300',
      key: 'SCRUM-150',
      text: 'Crear usuarios reales en base de datos',
      priority: 'Media',
      sp: 2,
      status: 'FINALIZADO',
      rawStatus: 'Listo',
      created_at: '2026-08-20',
      resolved_at: '2026-08-23',
      dueDate: '2026-08-22' // Venció el 22 pero ya está FINALIZADO
    },
    {
      id: '10200',
      key: 'SCRUM-99',
      text: 'Bug crítico en autenticación',
      priority: 'Crítica',
      sp: 3,
      status: 'POR HACER',
      rawStatus: 'En curso',
      created_at: '2026-08-15',
      resolved_at: null,
      dueDate: null // Sin dueDate -> NUNCA atrasada
    }
  ];

  it('SCRUM-152 no debe aparecer como atrasada para el 24/08/2026', () => {
    const selectedDate = '2026-08-24';
    const task152 = sampleTasks.find(t => t.key === 'SCRUM-152');
    
    // Regla: dueDate (2026-08-28) > selectedDate (2026-08-24)
    expect(isTaskOverdue(task152, selectedDate)).toBe(false);
  });

  it('Tarea completada con dueDate vencida NO debe considerarse atrasada', () => {
    const selectedDate = '2026-08-24';
    const task150 = sampleTasks.find(t => t.key === 'SCRUM-150');
    
    // Regla: status === FINALIZADO -> NO atrasada
    expect(isTaskOverdue(task150, selectedDate)).toBe(false);
  });

  it('Tarea sin dueDate (null) NO debe considerarse atrasada', () => {
    const selectedDate = '2026-08-24';
    const task99 = sampleTasks.find(t => t.key === 'SCRUM-99');
    
    // Regla: dueDate === null -> NO atrasada
    expect(isTaskOverdue(task99, selectedDate)).toBe(false);
  });

  it('Tarea realmente vencida debe clasificarse como atrasada', () => {
    const selectedDate = '2026-08-24';
    const overdueTask = {
      id: '10199',
      key: 'SCRUM-90',
      text: 'Tarea vencida no completada',
      priority: 'Alta',
      sp: 5,
      status: 'POR HACER',
      dueDate: '2026-08-20' // Vencimiento anterior al 24/08
    };

    expect(isTaskOverdue(overdueTask, selectedDate)).toBe(true);
  });

  it('NUBIIA y Tareas Atrasadas son 100% consistentes para el 24/08/2026 con SCRUM-152', () => {
    const selectedDate = '2026-08-24';
    const classification = classifyAgendaTasks(sampleTasks, selectedDate);
    
    // No hay tareas atrasadas en sampleTasks para el 24/08/2026
    expect(classification.overdueTasks.length).toBe(0);

    const nubia = getNubiaAnalysis(classification, selectedDate, 'Proyecto Principal');

    // NUBIIA NUNCA debe decir que hay tareas atrasadas
    expect(nubia.message).not.toContain('atrasada');
    expect(nubia.message).not.toContain('Detecté 1 tarea');
    expect(nubia.message).not.toContain('Detecté');
  });

  it('NUBIIA recomienda la tarea próxima a vencer o de mayor prioridad orientada a la acción', () => {
    const selectedDate = '2026-08-24';
    const classification = classifyAgendaTasks(sampleTasks, selectedDate);
    const nubia = getNubiaAnalysis(classification, selectedDate, 'Proyecto Principal');

    // SCRUM-153 vence el 25/08 (mañana respecto a 24/08)
    expect(nubia.topTask).toBeDefined();
    expect(nubia.actionLabel).toBeDefined();
    expect(nubia.message.length).toBeGreaterThan(10);
  });

  it('NUBIIA detecta tarea atrasada real si existe en el listado', () => {
    const selectedDate = '2026-08-24';
    const tasksWithOverdue = [
      ...sampleTasks,
      {
        id: '10199',
        key: 'SCRUM-90',
        text: 'Ajuste de seguridad en endpoints',
        priority: 'Alta',
        sp: 5,
        status: 'POR HACER',
        dueDate: '2026-08-20'
      }
    ];

    const classification = classifyAgendaTasks(tasksWithOverdue, selectedDate);
    classification.todayStr = selectedDate;
    expect(classification.overdueTasks.length).toBe(1);

    const nubia = getNubiaAnalysis(classification, selectedDate, 'Proyecto Principal');
    expect(nubia.message).toContain('SCRUM-90');
    expect(nubia.message).toContain('superó su fecha de vencimiento');
    expect(nubia.actionLabel).toBe('Ver SCRUM-90');
  });

  it('getTodayStr and formatDateLocal work correctly', () => {
    const today = getTodayStr();
    expect(today).toBe('2026-08-24'); // mocked date
    
    const formatted = formatDateLocal('2026-08-24');
    expect(formatted).toContain('24');
    expect(formatted.toLowerCase()).toContain('ago');
  });

  it('addDays correctly adds days to a date string', () => {
    const result = addDays('2026-08-24', 2);
    expect(result).toBe('2026-08-26');
  });

  it('getNubiaAnalysis handles perfect score (all tasks completed)', () => {
    const selectedDate = '2026-08-24';
    const classification = classifyAgendaTasks([
      {
        id: '1', key: 'SCRUM-1', status: 'FINALIZADO', resolved_at: '2026-08-24', priority: 'Alta'
      }
    ], selectedDate);
    
    const nubia = getNubiaAnalysis(classification, selectedDate, 'Proyecto Principal');
    expect(nubia.message).toContain('¡Excelente trabajo!');
  });
  
  it('getNubiaAnalysis recommends a critical task', () => {
    const selectedDate = '2026-08-24';
    const classification = classifyAgendaTasks([
      {
        id: '2', key: 'SCRUM-2', status: 'POR HACER', dueDate: '2026-08-25', priority: 'Crítica', created_at: '2026-08-24'
      }
    ], selectedDate);
    
    const nubia = getNubiaAnalysis(classification, selectedDate, 'Proyecto Principal');
    expect(nubia.message).toContain('SCRUM-2');
  });
  it('getTaskDate returns custom taskDates if present', () => {
    expect(getTaskDate({ key: 'T-1' }, '2026-08-24', '2026-08-24', { 'T-1': '2026-08-25' })).toBe('2026-08-25');
  });

  it('getTaskDate logic for finalized and active tasks', () => {
    const today = '2026-08-24';
    // FINALIZADO con resolved_at
    expect(getTaskDate({ status: 'FINALIZADO', resolved_at: '2026-08-20' }, today, today)).toBe('2026-08-20');
    // FINALIZADO sin resolved_at pero con dueDate
    expect(getTaskDate({ status: 'FINALIZADO', dueDate: '2026-08-21' }, today, today)).toBe('2026-08-21');
    // FINALIZADO sin resolved ni due, pero con created
    expect(getTaskDate({ status: 'FINALIZADO', created_at: '2026-08-22' }, today, today)).toBe('2026-08-22');
    // FINALIZADO sin nada
    expect(getTaskDate({ status: 'FINALIZADO' }, today, today)).toBeNull();

    // Activa (no finalizada) si selected == today
    expect(getTaskDate({ status: 'POR HACER' }, today, today)).toBe(today);
    // Activa si selected != today y coincide dueDate
    expect(getTaskDate({ status: 'POR HACER', dueDate: '2026-08-25' }, '2026-08-25', today)).toBe('2026-08-25');
    // Activa si selected != today y coincide created_at
    expect(getTaskDate({ status: 'POR HACER', created_at: '2026-08-26' }, '2026-08-26', today)).toBe('2026-08-26');
    // Fallback a today si no hay coincidencia
    expect(getTaskDate({ status: 'POR HACER' }, '2026-08-27', today)).toBe(today);
  });

  it('classifyAgendaTasks handles taskDates overrides', () => {
    const tasks = [{ key: 'T-1' }, { key: 'T-2', status: 'FINALIZADO', created_at: '2026-08-24' }];
    const cls = classifyAgendaTasks(tasks, '2026-08-25', { 'T-1': '2026-08-25' });
    expect(cls.todayTasks.map(t => t.key)).toContain('T-1');
  });

  it('getNubiaAnalysis PAST branches', () => {
    const pastDate = '2026-08-23';
    // Total today = 0
    let cls = classifyAgendaTasks([], pastDate);
    cls.todayStr = '2026-08-24';
    let res = getNubiaAnalysis(cls, pastDate);
    expect(res.message).toContain('No hubo actividades registradas');

    // Pending = 0
    cls = classifyAgendaTasks([{ status: 'FINALIZADO', resolved_at: pastDate }], pastDate);
    cls.todayStr = '2026-08-24';
    res = getNubiaAnalysis(cls, pastDate);
    expect(res.message).toContain('Jornada impecable');

    // Pending > 0
    cls = classifyAgendaTasks([{ key: 'T-1', status: 'POR HACER', dueDate: pastDate }], pastDate);
    cls.todayStr = '2026-08-24';
    res = getNubiaAnalysis(cls, pastDate);
    expect(res.message).toContain('actividades sin concluir');
  });

  it('getNubiaAnalysis FUTURE branches', () => {
    const futureDate = '2026-08-25';
    // Total today = 0
    let cls = classifyAgendaTasks([], futureDate);
    cls.todayStr = '2026-08-24';
    let res = getNubiaAnalysis(cls, futureDate);
    expect(res.message).toContain('Aún no tienes tareas programadas');

    // Future with critical task
    cls = classifyAgendaTasks([{ key: 'T-1', status: 'POR HACER', dueDate: futureDate, priority: 'Crítica' }], futureDate);
    cls.todayStr = '2026-08-24';
    res = getNubiaAnalysis(cls, futureDate);
    expect(res.message).toContain('Prepárate para abordarla');

    // Future with normal task
    cls = classifyAgendaTasks([{ key: 'T-1', status: 'POR HACER', dueDate: futureDate, priority: 'Baja', sp: 5 }], futureDate);
    cls.todayStr = '2026-08-24';
    res = getNubiaAnalysis(cls, futureDate);
    expect(res.message).toContain('sugiero tener presente');
  });

  it('getNubiaAnalysis TODAY - Carga de trabajo alta y estándar', () => {
    const today = '2026-08-24';
    
    // Carga alta (SP > 12) sin dueDate cercano
    let cls = classifyAgendaTasks([{ key: 'T-1', status: 'POR HACER', dueDate: null, priority: 'Baja', sp: 15 }], today);
    let res = getNubiaAnalysis(cls, today);
    expect(res.message).toContain('Tu carga de trabajo de hoy es alta');

    // Estándar (SP < 12, qty < 4) sin dueDate cercano
    cls = classifyAgendaTasks([{ key: 'T-1', status: 'POR HACER', dueDate: null, priority: 'Baja', sp: 2 }], today);
    res = getNubiaAnalysis(cls, today);
    expect(res.message).toContain('¡Vas al día!');
    
    // Agenda libre
    cls = classifyAgendaTasks([], today);
    res = getNubiaAnalysis(cls, today);
    expect(res.message).toContain('Tu agenda está libre');
  });
});

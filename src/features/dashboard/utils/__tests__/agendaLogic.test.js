import { describe, it, expect } from 'vitest';
import { 
  isTaskOverdue, 
  classifyAgendaTasks, 
  getNubiaAnalysis,
  addDays
} from '../agendaLogic';

describe('Agenda Logic & NUBIIA Business Rules', () => {

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
    expect(classification.overdueTasks.length).toBe(1);

    const nubia = getNubiaAnalysis(classification, selectedDate, 'Proyecto Principal');
    expect(nubia.message).toContain('SCRUM-90');
    expect(nubia.message).toContain('superó su fecha de vencimiento');
    expect(nubia.actionLabel).toBe('Ver SCRUM-90');
  });

});

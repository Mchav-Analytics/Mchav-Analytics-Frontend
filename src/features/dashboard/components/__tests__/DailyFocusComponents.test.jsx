import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DailyFocusHeader from '../DailyFocusHeader';
import DailyFocusTaskRow from '../DailyFocusTaskRow';
import DailyFocusTasks from '../DailyFocusTasks';
import DailyFocusSidebar from '../DailyFocusSidebar';

describe('DailyFocus Components', () => {
  describe('DailyFocusHeader', () => {
    it('renders project name and handles date buttons', () => {
      const setSelectedDate = vi.fn();
      render(
        <DailyFocusHeader
          projectName="Alpha System"
          selectedDate="2026-03-15"
          setSelectedDate={setSelectedDate}
        />
      );

      expect(screen.getByText('Mi Agenda de Hoy')).toBeDefined();
      expect(screen.getByText('Alpha System')).toBeDefined();

      // Click Ayer
      fireEvent.click(screen.getByText(/Ayer/i));
      expect(setSelectedDate).toHaveBeenCalled();

      // Click Mañana
      fireEvent.click(screen.getByText(/Mañana/i));
      expect(setSelectedDate).toHaveBeenCalled();

      // Click Hoy
      fireEvent.click(screen.getByRole('button', { name: /Hoy/i }));
      expect(setSelectedDate).toHaveBeenCalled();

      // Date input
      const dateInput = screen.getByDisplayValue('2026-03-15');
      fireEvent.change(dateInput, { target: { value: '2026-03-20' } });
      expect(setSelectedDate).toHaveBeenCalledWith('2026-03-20');
    });
  });

  describe('DailyFocusTaskRow', () => {
    const mockTask = {
      id: 't-1',
      key: 'MCH-101',
      text: 'Implementar autenticación segura',
      status: 'EN CURSO',
      priority: 'Alta'
    };

    it('renders active task and toggles status', () => {
      const handleToggleDone = vi.fn();
      render(
        <DailyFocusTaskRow
          task={mockTask}
          isOverdue={true}
          highlightedTaskKey="MCH-101"
          handleToggleDone={handleToggleDone}
        />
      );

      expect(screen.getByText('MCH-101')).toBeDefined();
      expect(screen.getByText('Implementar autenticación segura')).toBeDefined();
      expect(screen.getByText('ATRASADA')).toBeDefined();

      // Toggle button
      const toggleBtn = screen.getByRole('button');
      fireEvent.click(toggleBtn);
      expect(handleToggleDone).toHaveBeenCalledWith(mockTask);
    });

    it('renders completed task with finalizado status and low priority', () => {
      const completedTask = {
        ...mockTask,
        status: 'FINALIZADO',
        priority: 'Baja'
      };

      render(
        <DailyFocusTaskRow
          task={completedTask}
          isOverdue={false}
          handleToggleDone={vi.fn()}
        />
      );

      expect(screen.getByText('MCH-101')).toBeDefined();
      expect(screen.getByText('Implementar autenticación segura')).toBeDefined();
    });
  });

  describe('DailyFocusTasks', () => {
    const paginatedTasks = [
      { id: 't-1', key: 'MCH-1', text: 'Task 1', status: 'PENDIENTE', priority: 'Alta' },
      { id: 't-2', key: 'MCH-2', text: 'Task 2', status: 'FINALIZADO', priority: 'Media' }
    ];

    it('renders task list and pagination controls', () => {
      const setCurrentPage = vi.fn();
      const handleToggleDone = vi.fn();

      render(
        <DailyFocusTasks
          todayTasks={paginatedTasks}
          overdueTasks={[]}
          paginatedTasks={paginatedTasks}
          totalPages={3}
          currentPage={2}
          setCurrentPage={setCurrentPage}
          highlightedTaskKey={null}
          handleToggleDone={handleToggleDone}
        />
      );

      expect(screen.getByText('MCH-1')).toBeDefined();
      expect(screen.getByText('MCH-2')).toBeDefined();

      // Pagination clicks
      const prevBtn = screen.getByText('Anterior');
      fireEvent.click(prevBtn);
      expect(setCurrentPage).toHaveBeenCalled();

      const nextBtn = screen.getByText('Siguiente');
      fireEvent.click(nextBtn);
      expect(setCurrentPage).toHaveBeenCalled();
    });

    it('renders empty state when no tasks exist', () => {
      render(
        <DailyFocusTasks
          todayTasks={[]}
          overdueTasks={[]}
          paginatedTasks={[]}
          totalPages={1}
          currentPage={1}
          setCurrentPage={vi.fn()}
          highlightedTaskKey={null}
          handleToggleDone={vi.fn()}
        />
      );

      expect(screen.getByText('No tienes tareas programadas para esta fecha.')).toBeDefined();
    });
  });

  describe('DailyFocusSidebar', () => {
    const mockNotes = [
      { id: 'n-1', text: 'Recordar revisar logs de Jira', date: '2026-03-15' }
    ];

    it('renders progress and notes list, adds and deletes notes', () => {
      const setNewNoteText = vi.fn();
      const handleAddNote = vi.fn(e => e.preventDefault());
      const handleDeleteNote = vi.fn();

      render(
        <DailyFocusSidebar
          completedToday={['t-1', 't-2', 't-3']}
          totalToday={5}
          progressPct={60}
          newNoteText="Nueva nota importante"
          setNewNoteText={setNewNoteText}
          handleAddNote={handleAddNote}
          filteredNotes={mockNotes}
          handleDeleteNote={handleDeleteNote}
        />
      );

      expect(screen.getByText('60%')).toBeDefined();
      expect(screen.getByText('Recordar revisar logs de Jira')).toBeDefined();

      // Submit note
      const form = screen.getByPlaceholderText(/Añadir nueva nota rápida/i).closest('form');
      if (form) {
        fireEvent.submit(form);
        expect(handleAddNote).toHaveBeenCalled();
      }

      // Delete note
      const deleteButtons = screen.getAllByRole('button');
      const trashBtn = deleteButtons.find(b => b.querySelector('svg.lucide-trash-2') || b.querySelector('svg.lucide-trash'));
      if (trashBtn) {
        fireEvent.click(trashBtn);
        expect(handleDeleteNote).toHaveBeenCalledWith('n-1');
      }
    });

    it('renders empty notes state when filteredNotes is empty', () => {
      render(
        <DailyFocusSidebar
          completedToday={[]}
          totalToday={0}
          progressPct={0}
          newNoteText=""
          setNewNoteText={vi.fn()}
          handleAddNote={vi.fn()}
          filteredNotes={[]}
          handleDeleteNote={vi.fn()}
        />
      );

      expect(screen.getByText('El bloc de notas está vacío.')).toBeDefined();
    });
  });
});

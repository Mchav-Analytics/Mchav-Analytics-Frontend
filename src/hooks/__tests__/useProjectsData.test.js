import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProjectsData } from '../useProjectsData';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('useProjectsData hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUsers = [
    { id: '1', nombre: 'Dev 1', rol: 'DEVELOPER', proyectos_asignados: ['PROJ-1'] },
    { id: '2', nombre: 'Dev 2', rol: 'DEVELOPER', proyectos_asignados: [] },
    { id: '3', nombre: 'Admin', rol: 'ADMIN', proyectos_asignados: [] }
  ];

  const mockProjects = [
    { id_proyecto: 'PROJ-1', nombre: 'Project 1' },
    { id_proyecto: 'PROJ-2', nombre: 'Project 2' }
  ];

  it('fetches users and projects on mount', async () => {
    api.get.mockImplementation(url => {
      if (url === '/api/v1/users') return Promise.resolve({ data: mockUsers });
      if (url === '/api/v1/projects') return Promise.resolve({ data: mockProjects });
      return Promise.resolve({ data: [] });
    });

    const { result } = renderHook(() => useProjectsData());

    // Wait for the promises to resolve
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(api.get).toHaveBeenCalledWith('/api/v1/users');
    expect(api.get).toHaveBeenCalledWith('/api/v1/projects');

    expect(result.current.dbUsers).toEqual(mockUsers);
    expect(result.current.dbProjects).toEqual(mockProjects);
    
    // Test derived state
    expect(result.current.developers).toHaveLength(2);
    expect(result.current.assignedDevs).toHaveLength(1);
    expect(result.current.unassignedDevs).toHaveLength(1);
  });

  it('handles fetch errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.get.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProjectsData());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalled();
    expect(result.current.dbUsers).toEqual([]);
    expect(result.current.dbProjects).toEqual([]);
  });

  it('handleAssignProject calls post and refreshes data', async () => {
    api.get.mockImplementation(url => {
      if (url === '/api/v1/users') return Promise.resolve({ data: mockUsers });
      if (url === '/api/v1/projects') return Promise.resolve({ data: mockProjects });
      return Promise.resolve({ data: [] });
    });
    api.post.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useProjectsData());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(api.get).toHaveBeenCalledTimes(2); // one for users, one for projects

    await act(async () => {
      await result.current.handleAssignProject('2', 'PROJ-1');
    });

    expect(api.post).toHaveBeenCalledWith('/api/v1/users/2/projects', { id_proyectos: ['PROJ-1'] });
    expect(api.get).toHaveBeenCalledTimes(4); // Refreshes both
    expect(result.current.assignProjectId).toEqual({ '2': '' });
  });

  it('handleAssignProject does nothing if projectId is missing', async () => {
    const { result } = renderHook(() => useProjectsData());

    await act(async () => {
      await result.current.handleAssignProject('2', null);
    });

    expect(api.post).not.toHaveBeenCalled();
  });

  it('handleAssignProject handles errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.post.mockRejectedValue(new Error('Post error'));

    const { result } = renderHook(() => useProjectsData());

    await act(async () => {
      await result.current.handleAssignProject('2', 'PROJ-1');
    });

    expect(consoleSpy).toHaveBeenCalled();
  });
});

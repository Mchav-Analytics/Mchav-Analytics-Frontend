import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

export const useProjectsData = () => {
  const [dbUsers, setDbUsers] = useState([]);
  const [dbProjects, setDbProjects] = useState([]);
  const [assignProjectId, setAssignProjectId] = useState({});

  const fetchUsersAndProjects = useCallback(async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        api.get('/api/v1/users'),
        api.get('/api/v1/projects')
      ]);
      setDbUsers(uRes.data || []);
      setDbProjects(pRes.data || []);
    } catch (e) {
      console.error("Error fetching devs and projects", e);
    }
  }, []);

  useEffect(() => {
    fetchUsersAndProjects();
  }, [fetchUsersAndProjects]);

  const developers = useMemo(() => {
    return dbUsers.filter(u => u.rol && (u.rol.toUpperCase().includes('DEV') || u.rol.toUpperCase().includes('DESARROLLADOR')));
  }, [dbUsers]);

  const assignedDevs = developers.filter(d => d.proyectos_asignados && d.proyectos_asignados.length > 0);
  const unassignedDevs = developers.filter(d => !d.proyectos_asignados || d.proyectos_asignados.length === 0);

  const handleAssignProject = async (userId, projectId) => {
    if (!projectId) return;
    try {
      await api.post(`/api/v1/users/${userId}/projects`, { id_proyectos: [projectId] });
      await fetchUsersAndProjects();
      setAssignProjectId(prev => ({...prev, [userId]: ''}));
    } catch (e) {
      console.error(e);
    }
  };

  return {
    dbUsers,
    dbProjects,
    developers,
    assignedDevs,
    unassignedDevs,
    assignProjectId,
    setAssignProjectId,
    handleAssignProject,
    refreshData: fetchUsersAndProjects
  };
};

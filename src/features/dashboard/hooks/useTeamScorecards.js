import { useState, useEffect } from 'react';
import { developerService } from '../../../services/api';

export function useTeamScorecards(selectedProjectId) {
  const [developers, setDevelopers] = useState([]);
  const [selectedDev, setSelectedDev] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [loadingDevs, setLoadingDevs] = useState(true);
  const [loadingCard, setLoadingCard] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    setLoadingDevs(true);
    developerService.getDevelopers(selectedProjectId)
      .then(devs => {
        setDevelopers(devs || []);
        if (devs && devs.length > 0) {
          setSelectedDev(prev => {
            if (prev && devs.some(d => (d.assignee_id || d.email) === (prev.assignee_id || prev.email))) {
              return prev;
            }
            return devs[0];
          });
        }
        setLoadingDevs(false);
      })
      .catch(err => {
        console.warn("Error al listar desarrolladores:", err);
        setLoadingDevs(false);
      });
  }, [selectedProjectId]);

  const targetDevId = selectedDev?.assignee_id || selectedDev?.email;
  useEffect(() => {
    if (!targetDevId) return;
    setLoadingCard(true);
    setCurrentPage(1);
    developerService.getDeveloperScorecard(targetDevId, selectedProjectId)
      .then(card => {
        setScorecard(card);
        setLoadingCard(false);
      })
      .catch(err => {
        console.warn("Error al cargar scorecard del desarrollador:", err);
        setLoadingCard(false);
      });
  }, [targetDevId, selectedProjectId]);

  const filteredDevs = developers.filter(d => 
    (d.nombre || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (d.email || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return {
    developers,
    selectedDev,
    setSelectedDev,
    scorecard,
    loadingDevs,
    loadingCard,
    searchFilter,
    setSearchFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredDevs
  };
}

import { useState, useEffect, useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '../../auth/context/AuthContext';
import api from '../../../services/api';

export function useReportsCenter(selectedProjectId) {
  const { token } = useAuth();
  
  // Tabs and general state
  const [activeTab, setActiveTab] = useState('generacion');
  
  // Form generation state
  const [reportType, setReportType] = useState('proyecto');
  const [reportParam, setReportParam] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  // History state
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [compareMonth, setCompareMonth] = useState('');
  const [compareYear, setCompareYear] = useState(new Date().getFullYear().toString());
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  
  // Database references
  const [dbProjects, setDbProjects] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  
  const reportRef = useRef(null);

  const months = [
    { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' }, { value: '03', label: 'Marzo' }, 
    { value: '04', label: 'Abril' }, { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Septiembre' }, 
    { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
  ];
  
  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return [y.toString(), (y-1).toString(), (y-2).toString(), (y-3).toString(), (y-4).toString()];
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const projRes = await api.get('/api/v1/projects');
            setDbProjects(projRes.data || []);
        } catch (e) { console.error("Error fetching projects", e); }
        
        try {
            const userRes = await api.get('/api/v1/users');
            setDbUsers(userRes.data || []);
        } catch (e) { console.error("Error fetching users", e); }
    };
    fetchData();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: "MCHAV_Reporte_Ejecutivo",
    onAfterPrint: () => alert("🦉 Búho IA: ¡He analizado tu reporte! La velocidad de este mes ha mejorado, pero debes tener cuidado con el aumento de bugs.")
  });

  const handleGenerateLiveReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportData({
          month: "Reporte en Vivo", pointsCompleted: 145, sprintHealth: 92, totalIssues: 42, blockedDays: 2
      });
    }, 1500);
  };

  const handleFetchHistory = async () => {
    if (!selectedMonth || !selectedProjectId) {
      setError("Faltan parámetros.");
      return;
    }
    setLoadingHistory(true);
    try {
        const url = `http://localhost:8000/api/v1/reports/historical?proyecto_id=${selectedProjectId}&month=${selectedYear}-${selectedMonth}`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` }});
        if (!res.ok) throw new Error('Error al reconstruir el historial.');
        setReportData(await res.json());
    } catch (err) { 
      console.error(err); 
      setError(err.message);
    } finally { 
      setLoadingHistory(false); 
    }
  };

  return {
    // State
    activeTab, setActiveTab,
    reportType, setReportType,
    reportParam, setReportParam,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate,
    isGenerating,
    reportData,
    selectedMonth, setSelectedMonth,
    selectedYear, setSelectedYear,
    compareMonth, setCompareMonth,
    compareYear, setCompareYear,
    loadingHistory,
    error,
    dbProjects,
    dbUsers,
    reportRef,
    
    // Constants
    months,
    years,
    
    // Actions
    handlePrint,
    handleGenerateLiveReport,
    handleFetchHistory
  };
}

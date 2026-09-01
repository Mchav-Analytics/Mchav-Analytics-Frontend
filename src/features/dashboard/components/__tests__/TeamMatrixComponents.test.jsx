import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TeamMatrixHeader from '../TeamMatrixHeader';
import TeamMatrixKpis from '../TeamMatrixKpis';
import TeamMatrixLeaderboard from '../TeamMatrixLeaderboard';
import TeamMatrixNav from '../TeamMatrixNav';

// Mock window.print
const originalPrint = window.print;
window.print = vi.fn();

// Mocks
vi.mock('../LiderNotificationBell', () => ({
  default: () => <div data-testid="mock-notification-bell">Bell</div>
}));

describe('TeamMatrixHeader Component', () => {
  it('renders correctly', () => {
    render(<TeamMatrixHeader />);
    
    expect(screen.getAllByText('Matriz de Rendimiento').length).toBeGreaterThan(0);
    expect(screen.getByText('Cuadrantes')).toBeInTheDocument();
    expect(screen.getByTestId('mock-notification-bell')).toBeInTheDocument();
  });
});

describe('TeamMatrixKpis Component', () => {
  const mockTeamSummary = {
    promedio_score_equipo: 85.5,
    team_avg_cycle_time: 4.2
  };
  
  const mockDevelopers = [
    { id: 1 }, { id: 2 }, { id: 3 }
  ];
  
  const mockConteo = {
    ESTRELLA: 1,
    METODICO: 2
  };

  it('renders correctly with provided values', () => {
    render(
      <TeamMatrixKpis 
        teamSummary={mockTeamSummary} 
        developers={mockDevelopers} 
        conteo={mockConteo} 
      />
    );
    
    expect(screen.getByText('85.5')).toBeInTheDocument(); // Promedio
    expect(screen.getByText('1')).toBeInTheDocument(); // Estrella
    expect(screen.getByText('2')).toBeInTheDocument(); // Metodico
    expect(screen.getByText('4.2')).toBeInTheDocument(); // Cycle Time
    
    // Total developers text
    expect(screen.getByText(/Promedio móvil sobre 3 desarrolladores./i)).toBeInTheDocument();
  });
  
  it('renders defaults when values are missing', () => {
    render(
      <TeamMatrixKpis 
        teamSummary={{}} 
        developers={[]} 
        conteo={{}} 
      />
    );
    
    expect(screen.getByText('80')).toBeInTheDocument(); // Default score
    expect(screen.getAllByText('0').length).toBeGreaterThan(0); // Several 0s
  });
});

describe('TeamMatrixLeaderboard Component', () => {
  const mockDevelopers = [
    {
      assignee_id: 'dev1',
      nombre: 'Andres Chavez',
      email: 'andres@example.com',
      rank_posicion: 1,
      cuadrante: { codigo: 'ESTRELLA', nombre: 'Estrella' },
      performance_score: 95,
      throughput_issues: 10,
      velocity_sp: 40,
      cycle_time_dias: 2.5,
      quality_pct: 98,
      explicacion_razones: ['Fast delivery', 'High quality']
    },
    {
      assignee_id: 'dev2',
      nombre: 'Luis Perez',
      email: 'luis@example.com',
      rank_posicion: 2,
      cuadrante: { codigo: 'METODICO', nombre: 'Metódico' },
      performance_score: 85,
      throughput_issues: 5,
      velocity_sp: 20,
      cycle_time_dias: 5.5,
      quality_pct: 95,
      explicacion_razones: ['Good quality']
    }
  ];

  const mockTeamSummary = {
    team_avg_cycle_time: 4.0
  };

  it('renders leaderboard correctly', () => {
    const onSelectDev = vi.fn();
    render(
      <TeamMatrixLeaderboard 
        developers={mockDevelopers} 
        teamSummary={mockTeamSummary}
        onSelectDevForScorecard={onSelectDev}
      />
    );
    
    expect(screen.getByText('Andres Chavez')).toBeInTheDocument();
    expect(screen.getByText('andres@example.com')).toBeInTheDocument();
    expect(screen.getByText('Estrella')).toBeInTheDocument();
    expect(screen.getByText('95 pts')).toBeInTheDocument();
    
    expect(screen.getByText('Luis Perez')).toBeInTheDocument();
    expect(screen.getByText('Metódico')).toBeInTheDocument();
    expect(screen.getByText('85 pts')).toBeInTheDocument();
    
    // Check explanations
    expect(screen.getByText('Fast delivery')).toBeInTheDocument();
    
    // Check actions
    const actionBtns = screen.getAllByText('Ver Scorecard');
    expect(actionBtns).toHaveLength(2);
    
    fireEvent.click(actionBtns[0]);
    expect(onSelectDev).toHaveBeenCalledWith('dev1');
  });
  
  it('renders gracefully with missing optional properties', () => {
    const devMissingProps = [
      {
        assignee_id: 'dev3',
        nombre: 'John Doe',
        email: 'john@example.com',
        rank_posicion: 3,
        performance_score: 75,
        throughput_issues: 8,
        velocity_sp: 30,
        cycle_time_dias: 3.5,
        quality_pct: 90
        // Missing cuadrante and explicacion_razones
      }
    ];
    
    render(
      <TeamMatrixLeaderboard 
        developers={devMissingProps} 
        teamSummary={mockTeamSummary}
      />
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Desconocido')).toBeInTheDocument();
  });
});

describe('TeamMatrixNav Component', () => {
  it('renders navigation buttons and info', () => {
    const onNavigateToHealth = vi.fn();
    const onSelectDevForScorecard = vi.fn();
    
    const topPerformer = {
      nombre: 'Andres',
      performance_score: 95
    };
    
    render(
      <TeamMatrixNav 
        selectedProjectId="TEST-99"
        onNavigateToHealth={onNavigateToHealth}
        onSelectDevForScorecard={onSelectDevForScorecard}
        topPerformer={topPerformer}
      />
    );
    
    expect(screen.getByText('Matriz 4 Cuadrantes')).toBeInTheDocument();
    expect(screen.getByText('Andres (95 pts)')).toBeInTheDocument();
    
    const scorecardBtn = screen.getByText('Scorecards Desarrolladores');
    fireEvent.click(scorecardBtn);
    expect(onSelectDevForScorecard).toHaveBeenCalledWith(null);
  });
});

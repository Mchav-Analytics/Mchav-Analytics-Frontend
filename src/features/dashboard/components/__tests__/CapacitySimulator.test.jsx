import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CapacitySimulator from '../CapacitySimulator';

const SimulatorWrapper = () => {
  const [devCount, setDevCount] = useState(5);
  const [sprintDays, setSprintDays] = useState(10);
  const [vacationDays, setVacationDays] = useState(0);
  const [sickDevsCount, setSickDevsCount] = useState(0);
  const [sickDays, setSickDays] = useState(0);
  const [avgDevVelocity, setAvgDevVelocity] = useState(10);

  return (
    <CapacitySimulator 
      devCount={devCount} setDevCount={setDevCount}
      sprintDays={sprintDays} setSprintDays={setSprintDays}
      vacationDays={vacationDays} setVacationDays={setVacationDays}
      sickDevsCount={sickDevsCount} setSickDevsCount={setSickDevsCount}
      sickDays={sickDays} setSickDays={setSickDays}
      avgDevVelocity={avgDevVelocity} setAvgDevVelocity={setAvgDevVelocity}
      onClose={vi.fn()}
    />
  );
};

describe('CapacitySimulator (Quality Tests)', () => {
  
  it('renders initial mathematical calculation without incapacities correctly', () => {
    render(<SimulatorWrapper />);
    expect(screen.getByText(/Disponibilidad Neta: 50 días-persona/i)).toBeInTheDocument();
    expect(screen.getByText(/de 50 días teóricos/i)).toBeInTheDocument();
    expect(screen.getAllByText(/50 SP/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/IMPACTO MANEJABLE/i)).toBeInTheDocument();
  });

  it('updates capacity and impact when a developer is sick for the whole sprint', async () => {
    const user = userEvent.setup();
    render(<SimulatorWrapper />);
    
    const sickScenarioBtn = screen.getByRole('button', { name: /1 dev baja médica/i });
    await user.click(sickScenarioBtn);
    
    expect(screen.getByText(/Disponibilidad Neta: 40 días-persona/i)).toBeInTheDocument();
    expect(screen.getByText(/IMPACTO MODERADO/i)).toBeInTheDocument();
    expect(screen.getByText(/-10 SP/i)).toBeInTheDocument();
  });

  it('allows manual input of variables and dynamically updates results', () => {
    render(<SimulatorWrapper />);
    
    const devInput = screen.getByRole('spinbutton', { name: /integrantes activos/i });
    const sickDevsInput = screen.getByRole('spinbutton', { name: /devs incapacitados/i });
    const sickDaysInput = screen.getByRole('spinbutton', { name: /días incapacidad \/ dev/i });
    
    fireEvent.change(devInput, { target: { value: '10' } });
    expect(screen.getByText(/Disponibilidad Neta: 100 días-persona/i)).toBeInTheDocument();

    fireEvent.change(sickDevsInput, { target: { value: '4' } });
    fireEvent.change(sickDaysInput, { target: { value: '5' } });
    
    expect(screen.getByText(/Disponibilidad Neta: 80 días-persona/i)).toBeInTheDocument();
    expect(screen.getByText(/IMPACTO MODERADO/i)).toBeInTheDocument();
  });

  it('shows critical impact when capacity drops drastically', () => {
    render(<SimulatorWrapper />);
    
    const sickDevsInput = screen.getByRole('spinbutton', { name: /devs incapacitados/i });
    const sickDaysInput = screen.getByRole('spinbutton', { name: /días incapacidad \/ dev/i });
    
    fireEvent.change(sickDevsInput, { target: { value: '3' } });
    fireEvent.change(sickDaysInput, { target: { value: '10' } });
    
    expect(screen.getByText(/IMPACTO CRÍTICO/i)).toBeInTheDocument();
    expect(screen.getByText(/Riesgo Severo/i)).toBeInTheDocument();
  });
});

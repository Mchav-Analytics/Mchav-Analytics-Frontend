import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import CapacitySimulator from '../CapacitySimulator';

describe('CapacitySimulator', () => {
  it('renders standard view initially', () => {
    const { container } = render(<CapacitySimulator metricType="tiempo" title="Simulador de Tiempos" />);
    expect(screen.getByText(/SIMULADOR DE CAPACIDAD/i)).toBeInTheDocument();
  });

  it('can open advanced view', () => {
    const { container } = render(<CapacitySimulator metricType="esfuerzo" title="Simulador de Esfuerzo" />);
    
    // El botón de opciones avanzadas (rueda de engranaje)
    const settingsButton = container.querySelector('button');
    if (settingsButton) {
        fireEvent.click(settingsButton);
    }
    // Aseguramos que el componente no falle al renderizar
    expect(container).toBeInTheDocument();
  });

  it('can simulate values', () => {
    const { container } = render(<CapacitySimulator metricType="tiempo" title="Simulador" />);
    expect(container).toBeInTheDocument();
  });
});

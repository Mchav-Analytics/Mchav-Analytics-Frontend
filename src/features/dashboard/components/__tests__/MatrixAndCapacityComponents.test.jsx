import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CapacityResults from '../CapacityResults';
import DevAlertsEmpty from '../DevAlertsEmpty';
import DevAlertsHeader from '../DevAlertsHeader';
import { MetricInfoTooltip } from '../MetricInfoTooltip';
import MatrixMethodologyGuide from '../MatrixMethodologyGuide';
import MatrixSettingsModal from '../MatrixSettingsModal';

describe('Matrix and Capacity Components', () => {
  describe('CapacityResults', () => {
    const mockResults = {
      theoreticalDays: 10,
      netDays: 8,
      standardCapacitySP: 40,
      adjustedCapacitySP: 32,
      spDiff: -8,
      spDiffPct: -20,
      impactPct: 25,
      impactBadgeText: 'Impacto Moderado',
      impactBadgeStyle: 'bg-amber-100 text-amber-800 border-amber-300',
      barColor: '#f59e0b',
      diagnosticText: 'La capacidad se reduce un 20% debido a días festivos.'
    };

    it('renders speedometer, metrics and diagnostic text', () => {
      render(<CapacityResults results={mockResults} />);
      expect(screen.getByText('MEDIDOR DE IMPACTO EN LA CAPACIDAD')).toBeDefined();
      expect(screen.getByText('Impacto Moderado')).toBeDefined();
      expect(screen.getByText('La capacidad se reduce un 20% debido a días festivos.')).toBeDefined();
    });
  });

  describe('DevAlertsEmpty and DevAlertsHeader', () => {
    it('renders DevAlertsEmpty with prompt', () => {
      render(<DevAlertsEmpty />);
      expect(screen.getByText('Selecciona un Proyecto')).toBeDefined();
    });

    it('renders DevAlertsHeader with project name and count', () => {
      render(<DevAlertsHeader projectName="Core API" alertsCount={3} />);
      expect(screen.getByText('Mis Bloqueos y Alertas')).toBeDefined();
      expect(screen.getByText('3 Alertas')).toBeDefined();
      expect(screen.getByText(/Centro de Actividad \/ Core API/i)).toBeDefined();
    });
  });

  describe('MetricInfoTooltip', () => {
    it('renders info tooltip with custom align and position', () => {
      render(<MetricInfoTooltip text="Métrica clave de rendimiento" align="right" position="top" />);
      expect(screen.getByText('Métrica clave de rendimiento')).toBeDefined();
    });
  });

  describe('MatrixMethodologyGuide', () => {
    it('returns null when closed', () => {
      const { container } = render(<MatrixMethodologyGuide isOpen={false} onClose={vi.fn()} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders modal and switches between all 3 tabs', () => {
      const onClose = vi.fn();
      render(<MatrixMethodologyGuide isOpen={true} onClose={onClose} />);

      expect(screen.getByText('Metodología y Especificación de Métricas')).toBeDefined();

      // Switch to QUADRANTS tab
      fireEvent.click(screen.getByText('Los 4 Cuadrantes Operativos'));
      expect(screen.getByText(/ESTRELLA \(Top Performance\)/i)).toBeDefined();

      // Switch to FORMULAS tab
      fireEvent.click(screen.getByText('Fórmulas Matemáticas'));
      expect(screen.getByText(/Performance Score Ponderado/i)).toBeDefined();

      // Close modal
      const closeBtn = screen.getByRole('button', { name: 'Entendido' });
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('MatrixSettingsModal', () => {
    it('returns null when closed', () => {
      const { container } = render(<MatrixSettingsModal isOpen={false} onClose={vi.fn()} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders settings modal, changes presets and saves configuration', () => {
      const onSaveConfig = vi.fn();
      const onClose = vi.fn();

      render(
        <MatrixSettingsModal
          isOpen={true}
          onClose={onClose}
          onSaveConfig={onSaveConfig}
        />
      );

      expect(screen.getByText('Configuración del Modelo de Desempeño')).toBeDefined();

      // Click strict quality preset
      fireEvent.click(screen.getByText('Enfoque en Calidad Estricta'));

      // Click save button
      const saveBtn = screen.getByText('Guardar Configuración Permanente');
      fireEvent.click(saveBtn);
      expect(onSaveConfig).toHaveBeenCalled();
    });
  });
});

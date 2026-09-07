import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InfoTooltip, EnrichedChartTooltip } from '../Tooltips';

describe('Tooltips Component', () => {
  describe('InfoTooltip', () => {
    it('shows text on hover and hides on mouse leave', () => {
      const { container } = render(<InfoTooltip text="Some helpful info" />);
      
      const iconContainer = container.querySelector('div.relative');
      
      // Initially not visible
      expect(screen.queryByText('Some helpful info')).not.toBeInTheDocument();
      
      // Hover
      act(() => {
        fireEvent.mouseEnter(iconContainer);
      });
      expect(screen.getByText('Some helpful info')).toBeInTheDocument();
      
      // Unhover
      act(() => {
        fireEvent.mouseLeave(iconContainer);
      });
      expect(screen.queryByText('Some helpful info')).not.toBeInTheDocument();
    });

    it('prevents click propagation', () => {
      const parentClick = vi.fn();
      const { container } = render(
        <div onClick={parentClick}>
          <InfoTooltip text="Info" />
        </div>
      );
      
      const tooltipContainer = container.querySelector('div.relative');
      fireEvent.click(tooltipContainer);
      
      expect(parentClick).not.toHaveBeenCalled();
    });
  });

  describe('EnrichedChartTooltip', () => {
    it('does not render if inactive', () => {
      const { container } = render(<EnrichedChartTooltip active={false} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders with payload correctly', () => {
      const payload = [
        { name: 'Metrica A', value: 10, color: '#ff0000' }
      ];
      render(<EnrichedChartTooltip active={true} payload={payload} label="Día 1" />);
      
      expect(screen.getByText('Información: Día 1')).toBeInTheDocument();
      expect(screen.getByText('Metrica A:')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('incidencias')).toBeInTheDocument(); // default unit
    });
  });
});

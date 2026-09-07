import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CustomFlowTooltip, STAGE_EXPLANATIONS } from '../SprintHealthShared';

describe('SprintHealthShared Tooltip Component', () => {
  it('does not render if inactive', () => {
    const { container } = render(<CustomFlowTooltip active={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly with valid data and known stage', () => {
    const payload = [{
      payload: { spanishStage: 'Desarrollo Activo', days: 5 }
    }];
    
    render(<CustomFlowTooltip active={true} payload={payload} isDark={false} />);
    
    // Debe mostrar la etapa
    expect(screen.getByText('Desarrollo Activo')).toBeInTheDocument();
    // Debe mostrar los días
    expect(screen.getByText('5 días')).toBeInTheDocument();
    // Debe mostrar el tipo
    expect(screen.getByText(STAGE_EXPLANATIONS['Desarrollo Activo'].type)).toBeInTheDocument();
    // Debe contener el icono y la descripción (o parte de ella)
    expect(screen.getByText(STAGE_EXPLANATIONS['Desarrollo Activo'].icon)).toBeInTheDocument();
    // No usamos exact match para la descripción porque tiene texto alrededor (💡 ¿Qué significa?)
    expect(screen.getByText((content, element) => content.includes('Tiempo real en que los desarrolladores'))).toBeInTheDocument();
  });

  it('renders correctly with fallback (unknown) stage', () => {
    const payload = [{
      payload: { stage: 'Unknown Stage', days: 2 }
    }];
    
    render(<CustomFlowTooltip active={true} payload={payload} isDark={true} />);
    
    expect(screen.getByText('Unknown Stage')).toBeInTheDocument();
    expect(screen.getByText('2 días')).toBeInTheDocument();
    expect(screen.getByText('Etapa del Sprint')).toBeInTheDocument();
  });
  
  it('applies dark mode classes when isDark is true', () => {
    const payload = [{
      payload: { stage: 'Test', days: 1 }
    }];
    
    const { container } = render(<CustomFlowTooltip active={true} payload={payload} isDark={true} />);
    const mainDiv = container.firstChild;
    
    // Revisa clases específicas de dark mode
    expect(mainDiv).toHaveClass('bg-slate-900/95');
    expect(mainDiv).toHaveClass('text-white');
  });

  it('applies light mode classes when isDark is false', () => {
    const payload = [{
      payload: { stage: 'Test', days: 1 }
    }];
    
    const { container } = render(<CustomFlowTooltip active={true} payload={payload} isDark={false} />);
    const mainDiv = container.firstChild;
    
    // Revisa clases específicas de light mode
    expect(mainDiv).toHaveClass('bg-white/95');
    expect(mainDiv).toHaveClass('text-slate-900');
  });
});

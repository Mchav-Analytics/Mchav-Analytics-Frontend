import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContextMenu from '../ContextMenu';
import { Trash2, Edit } from 'lucide-react';

describe('ContextMenu', () => {
  it('returns null when actions is empty or not provided', () => {
    const { container, rerender } = render(<ContextMenu actions={[]} />);
    expect(container.firstChild).toBeNull();

    rerender(<ContextMenu actions={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders menu button and toggles open state', () => {
    const editFn = vi.fn();
    const deleteFn = vi.fn();

    const actions = [
      { label: 'Editar', icon: Edit, onClick: editFn },
      { label: 'Eliminar', icon: Trash2, onClick: deleteFn, variant: 'danger' },
      { label: 'Oculto', hidden: true }
    ];

    render(<ContextMenu actions={actions} />);

    // Click trigger button
    const triggerBtn = screen.getByRole('button');
    fireEvent.click(triggerBtn);

    expect(screen.getByText('Editar')).toBeDefined();
    expect(screen.getByText('Eliminar')).toBeDefined();
    expect(screen.queryByText('Oculto')).toBeNull();

    // Click Editar action
    fireEvent.click(screen.getByText('Editar'));
    expect(editFn).toHaveBeenCalled();
    expect(screen.queryByText('Editar')).toBeNull(); // closes on action
  });

  it('closes on click outside', () => {
    const actions = [{ label: 'Action 1', onClick: vi.fn() }];
    render(<ContextMenu actions={actions} />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Action 1')).toBeDefined();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Action 1')).toBeNull();
  });
});

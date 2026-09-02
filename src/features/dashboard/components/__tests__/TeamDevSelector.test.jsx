import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TeamDevSelector from '../TeamDevSelector';

describe('TeamDevSelector Component', () => {
  const mockDevs = [
    { assignee_id: '1', nombre: 'Alice Smith', email: 'alice@test.com' },
    { assignee_id: '2', nombre: 'Bob Jones', email: 'bob@test.com' },
    { assignee_id: '3' } // sin nombre
  ];

  const defaultProps = {
    developers: mockDevs,
    filteredDevs: mockDevs,
    selectedDev: mockDevs[0],
    setSelectedDev: vi.fn(),
    searchFilter: '',
    setSearchFilter: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with developers list', () => {
    render(<TeamDevSelector {...defaultProps} />);
    
    expect(screen.getByText('Desarrolladores del Proyecto (3)')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('generates correct initials and fallbacks', () => {
    render(<TeamDevSelector {...defaultProps} />);
    
    // Initials for Alice Smith = AS
    expect(screen.getByText('AS')).toBeInTheDocument();
    
    // Initials for Bob Jones = BJ
    expect(screen.getByText('BJ')).toBeInTheDocument();

    // Fallback initials for missing name = D
    expect(screen.getByText('D')).toBeInTheDocument();
    
    // Fallback email
    expect(screen.getByText('dev@gmail.com')).toBeInTheDocument();
  });

  it('handles search input change', () => {
    render(<TeamDevSelector {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('Buscar desarrollador...');
    fireEvent.change(searchInput, { target: { value: 'Bob' } });
    
    expect(defaultProps.setSearchFilter).toHaveBeenCalledWith('Bob');
  });

  it('calls setSelectedDev on developer click', () => {
    render(<TeamDevSelector {...defaultProps} />);
    
    // Click on Bob Jones
    const bobBtn = screen.getByText('Bob Jones').closest('button');
    fireEvent.click(bobBtn);
    
    expect(defaultProps.setSelectedDev).toHaveBeenCalledWith(mockDevs[1]);
  });
});

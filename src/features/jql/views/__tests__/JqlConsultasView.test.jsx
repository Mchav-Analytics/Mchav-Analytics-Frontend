import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import JqlConsultasView from '../JqlConsultasView';

vi.mock('../../../../services/api', () => ({
  jqlService: {
    executeJql: vi.fn(() => Promise.resolve({ issues: [] }))
  }
}));

describe('JqlConsultasView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly without crashing', () => {
    render(<JqlConsultasView selectedProjectId="PROJ-01" />);
  });
});

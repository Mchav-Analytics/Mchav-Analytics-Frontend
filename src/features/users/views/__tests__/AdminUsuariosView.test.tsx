import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import AdminUsuariosView from '../AdminUsuariosView';

vi.mock('../../../services/api', () => ({
  userService: {
    getUsers: vi.fn(() => Promise.resolve([]))
  },
  authService: {}
}));

describe('AdminUsuariosView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly without crashing', () => {
    render(<AdminUsuariosView />);
  });
});

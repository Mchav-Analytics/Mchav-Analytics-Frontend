import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeveloperView from '../DeveloperView';

vi.mock('../../../dashboard/views/DeveloperView', () => ({
  default: () => <div data-testid="auth-dev-view">DeveloperView Re-export</div>
}));

describe('Auth DeveloperView re-export', () => {
  it('correctly imports and renders DeveloperView', () => {
    const { getByTestId } = render(<DeveloperView />);
    expect(getByTestId('auth-dev-view')).toBeDefined();
  });
});

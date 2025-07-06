import React from 'react';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert', () => {
  it('renders with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>This is a warning alert.</AlertDescription>
      </Alert>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('This is a warning alert.')).toBeInTheDocument();
  });
}); 
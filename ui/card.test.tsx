import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';

describe('Card', () => {
  it('renders with header, content, and footer', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Card content goes here.</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content goes here.')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
}); 
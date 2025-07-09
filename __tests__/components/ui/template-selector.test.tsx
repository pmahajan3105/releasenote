import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateSelector } from '@/components/ui/template-selector';

const mockTemplates = [
  {
    id: '1',
    name: 'Modern',
    description: 'A modern template',
    icon: '📝',
    tone: 'professional',
    targetAudience: 'developers',
    outputFormat: 'HTML',
    category: 'General',
    exampleOutput: 'Example for Modern',
  },
  {
    id: '2',
    name: 'Minimal',
    description: 'A minimal template',
    icon: '✏️',
    tone: 'casual',
    targetAudience: 'users',
    outputFormat: 'Markdown',
    category: 'General',
    exampleOutput: 'Example for Minimal',
  },
];

describe('TemplateSelector', () => {
  it('renders all templates', () => {
    render(
      <TemplateSelector
        templates={mockTemplates}
        selectedTemplateId={undefined}
        onTemplateSelect={jest.fn()}
      />
    );
    expect(screen.getByText('Modern')).toBeInTheDocument();
    expect(screen.getByText('Minimal')).toBeInTheDocument();
  });

  it('calls onTemplateSelect when a template is clicked', () => {
    const onSelect = jest.fn();
    render(
      <TemplateSelector
        templates={mockTemplates}
        selectedTemplateId={undefined}
        onTemplateSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByText('Modern'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('shows template as selected', () => {
    render(
      <TemplateSelector
        templates={mockTemplates}
        selectedTemplateId={'2'}
        onTemplateSelect={jest.fn()}
      />
    );
    const selected = screen.getByText('Minimal').closest('.ring-2');
    expect(selected).toBeTruthy();
  });

  it('expands and collapses template details', () => {
    render(
      <TemplateSelector
        templates={mockTemplates}
        selectedTemplateId={undefined}
        onTemplateSelect={jest.fn()}
      />
    );
    // Expand
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    expect(screen.getByText('Example Output:')).toBeInTheDocument();
    // Collapse
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    expect(screen.queryByText('Example Output:')).not.toBeInTheDocument();
  });
});

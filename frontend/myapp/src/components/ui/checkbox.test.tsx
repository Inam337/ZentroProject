import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './checkbox';

describe('Checkbox Component', () => {
  it('should render unchecked checkbox by default', () => {
    render(<Checkbox data-testid="checkbox" />);
    
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox when checked prop is true', () => {
    render(<Checkbox checked data-testid="checkbox" />);
    
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onCheckedChange when clicked', () => {
    const handleChange = jest.fn();
    render(<Checkbox onCheckedChange={handleChange} data-testid="checkbox" />);
    
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Checkbox disabled data-testid="checkbox" />);
    
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<Checkbox className="custom-class" data-testid="checkbox" />);
    
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveClass('custom-class');
  });
}); 
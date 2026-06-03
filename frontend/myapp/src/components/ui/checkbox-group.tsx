import React from 'react';
import { useIntl } from 'react-intl';

import { Checkbox } from '@/components/ui/checkbox';

export interface CheckboxOption {
  value: string;
  labelKey: string; // Translation key for the label
  id?: string; // Optional custom ID
}

export interface CheckboxGroupProps {
  options: CheckboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function CheckboxGroup({
  options,
  value,
  onChange,
  error,
  className = '',
  disabled = false,
}: CheckboxGroupProps) {
  const intl = useIntl();
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(v => v !== optionValue));
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-row gap-4 items-center flex-wrap">
        {options.map(option => (
          <div
            key={option.value}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Checkbox
              id={option.id || option.value}
              checked={value.includes(option.value)}
              onCheckedChange={checked => handleCheckboxChange(option.value, checked as boolean)}
              disabled={disabled}
            />
            <label
              htmlFor={option.id || option.value}
              className="text-sm font-normal cursor-pointer"
            >
              {intl.formatMessage({ id: option.labelKey })}
            </label>
          </div>
        ))}
      </div>
      {error && (
        <div className="text-red-500 text-xs mt-1">
          {error}
        </div>
      )}
    </div>
  );
}

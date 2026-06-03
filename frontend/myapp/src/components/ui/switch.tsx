import React from 'react';

interface CustomSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  dir?: 'rtl' | 'ltr';
}

export function CustomSwitch({
  checked,
  onChange,
  disabled = false,
  dir = 'ltr',
}: CustomSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      tabIndex={0}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? 'bg-primary' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        border-2 border-transparent focus:outline-none
         focus:ring-2 focus:ring-green-800 focus:ring-offset-2
      `}
      style={{ direction: dir }}
    >
      <span
        className={`
          inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform
          ${
    checked
      ? dir === 'rtl'
        ? '-translate-x-5'
        : 'translate-x-5'
      : 'translate-x-0'
    }
        `}
      />
    </button>
  );
}

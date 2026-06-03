'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DateRange, Range } from 'react-date-range';
import { format } from 'date-fns';

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { CommonIconNames, IconColors } from '@/components/icons/types';
import { CommonIcon } from '@/components/icons';
import { cn } from '@/libs/utils';
import { useIntl as useAppIntl } from '@/providers/react-intl-provider';
import { DirectionTypes } from '@/common/app-constants';

type DatePickerProps = {
  onDateSelect: (date: string) => void;
  initialDate?: Date;
  placeholder?: string;
  maxDate?: Date;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  onDateSelect,
  initialDate,
  maxDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const datePickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ICON_SIZE = 16;
  const { direction } = useAppIntl();
  const isRtl = direction === DirectionTypes.RTL;
  const handleSelect = (ranges: { selection: Range }) => {
    const pickedDate = ranges.selection.startDate;

    setSelectedDate(pickedDate);
    setOpen(false);
    // Emit value in YYYY-MM-DD to satisfy schema validation, keep display as DD/MM/YYYY
    onDateSelect(format(pickedDate, 'yyyy-MM-dd'));
  };

  // Sync internal state when initialDate prop changes (e.g., edit prepopulation or clearing)
  useEffect(() => {
    if (!initialDate) {
      // Clear the selected date when initialDate is undefined/null
      setSelectedDate(null);

      return;
    }

    // Check if selectedDate is null before calling toDateString()
    if (!selectedDate) {
      setSelectedDate(initialDate);

      return;
    }

    const a = selectedDate.toDateString();
    const b = initialDate.toDateString();

    if (a !== b) {
      setSelectedDate(initialDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDate?.getTime()]);

  const calculatePosition = () => {
    if (!inputRef.current) return 'bottom';

    const rect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 280; // Approximate height of the date picker dropdown
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // If there's not enough space below but enough above, show above
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      return 'top';
    }

    // Default to bottom
    return 'bottom';
  };

  const handleOpen = () => {
    const newPosition = calculatePosition();

    setPosition(newPosition);
    setOpen(!open);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Recalculate position when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (open) {
        const newPosition = calculatePosition();

        setPosition(newPosition);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  return (
    <div
      className="relative w-full"
      ref={datePickerRef}
    >
      <div className="relative">
        <input
          ref={inputRef}
          readOnly
          onClick={handleOpen}
          value={selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}
          placeholder="DD/MM/YYYY"
          className={cn(
            'flex h-9 w-full bg-white rounded-md border border-input py-2 text-sm',
            'ring-offset-background file:border-0 file:bg-transparent',
            'file:text-sm file:font-medium placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:bg-primary',
            'focus-visible:ring-offset-2 disabled:cursor-not-allowed',
            'disabled:opacity-50 cursor-pointer',
            isRtl ? 'pl-10 pr-3' : 'pl-3 pr-10',
          )}
        />
        <div className={cn(
          'absolute inset-y-0 flex items-center',
          isRtl ? 'left-3' : 'right-3',
        )}
        >
          <CommonIcon
            width={ICON_SIZE}
            height={ICON_SIZE}
            name={CommonIconNames.DATE_PICKER_ICON}
            fill={IconColors.GRAY_COLOR_ICON}
          />
        </div>
      </div>
      {open && (
        <div
          className={`absolute z-50 shadow-lg ${position === 'top'
            ? 'bottom-full mb-2'
            : 'top-full mt-2'
          }`}
        >
          <DateRange
            ranges={[{
              startDate: selectedDate || new Date(),
              endDate: selectedDate || new Date(),
              key: 'selection',
            }]}
            onChange={handleSelect}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            editableDateInputs={true}
            showDateDisplay={false}
            rangeColors={['#22c55e']} // Green color
            maxDate={maxDate || new Date()}
          />
        </div>
      )}
    </div>
  );
};

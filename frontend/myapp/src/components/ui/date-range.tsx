'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  DateRange as DateRangeComponent,
  RangeKeyDict,
} from 'react-date-range';
import { ChevronDown } from 'lucide-react'; // Use a chevron icon

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useReactIntl } from '@/providers/react-intl-provider';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface MyDateRangePickerProps {
  onDateRangeChange?: (from: string, to: string) => void;
  fromDate?: string;
  toDate?: string;
}

export function MyDateRangePicker({ onDateRangeChange, fromDate, toDate }: MyDateRangePickerProps) {
  const { formatMessage } = useReactIntl();
  const [date, setDate] = useState([
    {
      startDate: fromDate ? new Date(fromDate) : new Date(),
      endDate: toDate ? new Date(toDate) : new Date(),
      key: 'selection',
    },
  ]);
  const [open, setOpen] = useState(false);
  const [hasUserSelected, setHasUserSelected] = useState(false);
  const hasRange = date[0].startDate && date[0].endDate;
  const formattedRange
    = hasRange && hasUserSelected
      ? `${format(date[0].startDate, 'MMM dd, yyyy')} - ${format(
        date[0].endDate,
        'MMM dd, yyyy',
      )}`
      : formatMessage({ id: 'common.text.dateRange', defaultMessage: 'Date Range' });

  // Sync internal state when props change
  useEffect(() => {
    if (fromDate && toDate) {
      setDate([
        {
          startDate: new Date(fromDate),
          endDate: new Date(toDate),
          key: 'selection',
        },
      ]);
      setHasUserSelected(true);
    } else if (!fromDate && !toDate) {
      // Reset when both dates are cleared
      setDate([
        {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      ]);
      setHasUserSelected(false);
    }
  }, [fromDate, toDate]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal bg-white"
        >
          <span>{formattedRange}</span>
          <ChevronDown className="ml-2 h-5 w-5 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <DateRangeComponent
          editableDateInputs={true}
          onChange={(item: RangeKeyDict) => {
            const selection = item.selection;

            if (selection.startDate && selection.endDate) {
              setDate([
                selection as { startDate: Date; endDate: Date; key: string },
              ]);
              setHasUserSelected(true);

              // Call the callback if provided
              if (onDateRangeChange) {
                const fromDateStr = format(selection.startDate, 'yyyy-MM-dd');
                const toDateStr = format(selection.endDate, 'yyyy-MM-dd');

                onDateRangeChange(fromDateStr, toDateStr);
              }
            }
          }}
          moveRangeOnFirstSelection={false}
          ranges={date}
          rangeColors={['#059669']}
        />
      </PopoverContent>
    </Popover>
  );
}

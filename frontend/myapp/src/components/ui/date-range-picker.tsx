'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';

interface DateRangePickerProps {
  className?: string;
  dateRange: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  dateRange,
  onChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const handleMobileClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const handleMobileTouch = (e: React.TouchEvent) => {
    if (isMobile) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground',
              isMobile && 'select-none touch-manipulation',
            )}
            onClick={handleMobileClick}
            onTouchStart={handleMobileTouch}
            style={isMobile
              ? {
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                  touchAction: 'manipulation',
                }
              : undefined}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from
              ? (
                  dateRange.to
                    ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')}
                          {' '}
                          -
                          {' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      )
                    : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                )
              : (
                  <span>Date Range</span>
                )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
        >
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(range) => {
              onChange(range);
              if (range?.to) {
                setIsOpen(false);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

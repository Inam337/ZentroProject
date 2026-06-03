'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';

import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimePickerProps {
  time?: string;
  onTimeChange?: (time: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({
  time,
  onTimeChange,
  placeholder = 'Select time',
  className,
  disabled = false,
}: TimePickerProps) {
  const [selectedHour, setSelectedHour] = React.useState<string>('');
  const [selectedMinute, setSelectedMinute] = React.useState<string>('');

  React.useEffect(() => {
    if (time) {
      const [hour, minute] = time.split(':');

      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [time]);

  const handleHourChange = (hour: string) => {
    setSelectedHour(hour);
    if (selectedMinute) {
      onTimeChange?.(`${hour}:${selectedMinute}`);
    }
  };

  const handleMinuteChange = (minute: string) => {
    setSelectedMinute(minute);
    if (selectedHour) {
      onTimeChange?.(`${selectedHour}:${minute}`);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !time && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {time ? time : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-4"
        align="start"
      >
        <div className="flex gap-2">
          <Select
            value={selectedHour}
            onValueChange={handleHourChange}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent>
              {hours.map(hour => (
                <SelectItem
                  key={hour}
                  value={hour}
                >
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="flex items-center text-lg font-semibold">:</span>
          <Select
            value={selectedMinute}
            onValueChange={handleMinuteChange}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map(minute => (
                <SelectItem
                  key={minute}
                  value={minute}
                >
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}

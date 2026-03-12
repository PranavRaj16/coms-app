"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  showTime?: boolean;
  placeholder?: string;
  className?: string;
}

// Convert 24h hour to 12h display hour (1-12)
function to12h(hour24: number): string {
  const h = hour24 % 12;
  return (h === 0 ? 12 : h).toString().padStart(2, "0");
}

// Get AM/PM from 24h hour
function getAmPm(hour24: number): "AM" | "PM" {
  return hour24 < 12 ? "AM" : "PM";
}

// Convert 12h + ampm back to 24h
function to24h(hour12: number, ampm: "AM" | "PM"): number {
  if (ampm === "AM") {
    return hour12 === 12 ? 0 : hour12;
  } else {
    return hour12 === 12 ? 12 : hour12 + 12;
  }
}

export function DateTimePicker({
  date,
  setDate,
  showTime = false,
  placeholder = "Pick a date",
  className,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  const [hour12, setHour12] = React.useState<string>(
    date ? to12h(date.getHours()) : "12"
  );
  const [ampm, setAmpm] = React.useState<"AM" | "PM">(
    date ? getAmPm(date.getHours()) : "AM"
  );
  const [minutes, setMinutes] = React.useState<string>(
    date ? date.getMinutes().toString().padStart(2, "0") : "00"
  );

  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setHour12(to12h(date.getHours()));
      setAmpm(getAmPm(date.getHours()));
      setMinutes(date.getMinutes().toString().padStart(2, "0"));
    }
  }, [date]);

  const applyTime = (d: Date, h12: string, ap: "AM" | "PM", mins: string) => {
    const updated = new Date(d);
    updated.setHours(to24h(parseInt(h12), ap));
    updated.setMinutes(parseInt(mins));
    updated.setSeconds(0);
    return updated;
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    if (newDate) {
      const updatedDate = showTime
        ? applyTime(newDate, hour12, ampm, minutes)
        : new Date(newDate);
      setDate(updatedDate);
    } else {
      setDate(undefined);
    }
  };

  const handleTimeChange = (
    type: "hour12" | "ampm" | "minutes",
    value: string
  ) => {
    let newH = hour12;
    let newAp = ampm;
    let newMins = minutes;

    if (type === "hour12") newH = value;
    else if (type === "ampm") newAp = value as "AM" | "PM";
    else newMins = value;

    setHour12(newH);
    setAmpm(newAp);
    setMinutes(newMins);

    if (selectedDate) {
      const updatedDate = applyTime(selectedDate, newH, newAp, newMins);
      setDate(updatedDate);
    }
  };

  const displayFormat = showTime ? "PPP hh:mm aa" : "PPP";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal rounded-xl h-11 transition-all hover:bg-muted/50",
            !date && "text-muted-foreground hover:text-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70 shrink-0" />
          {date ? (
            <span className="truncate">{format(date, displayFormat)}</span>
          ) : (
            <span className="text-muted-foreground truncate">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-2xl border border-border/60 shadow-2xl z-[9999] overflow-hidden"
        align="start"
        side="bottom"
        avoidCollisions={true}
        collisionPadding={16}
      >
        {/* Calendar section */}
        <div className="bg-popover">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            className="p-3"
          />
        </div>

        {/* Time section */}
        {showTime && (
          <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
              <Clock className="w-3 h-3" />
              Set Time
            </div>
            <div className="flex items-center gap-2">
              {/* Hour 1–12 */}
              <Select
                value={hour12}
                onValueChange={(v) => handleTimeChange("hour12", v)}
              >
                <SelectTrigger className="w-[66px] h-9 rounded-lg font-bold text-sm">
                  <SelectValue placeholder="HH" />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl max-h-[180px] z-[10000]"
                  position="popper"
                  sideOffset={4}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <SelectItem key={h} value={h.toString().padStart(2, "0")}>
                      {h.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="font-bold text-muted-foreground text-base">:</span>

              {/* Minutes 0–59 */}
              <Select
                value={minutes}
                onValueChange={(v) => handleTimeChange("minutes", v)}
              >
                <SelectTrigger className="w-[66px] h-9 rounded-lg font-bold text-sm">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl max-h-[180px] z-[10000]"
                  position="popper"
                  sideOffset={4}
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <SelectItem key={m} value={m.toString().padStart(2, "0")}>
                      {m.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* AM/PM */}
              <Select
                value={ampm}
                onValueChange={(v) => handleTimeChange("ampm", v)}
              >
                <SelectTrigger className="w-[66px] h-9 rounded-lg font-bold text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl z-[10000]"
                  position="popper"
                  sideOffset={4}
                >
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PRADESHIYA_SABHA_OPTIONS } from "@/data/pradeshiyaSabhas";

export interface PradeshiyaSabhaSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
}

export function PradeshiyaSabhaSelect({
  value,
  onValueChange,
  disabled,
  placeholder = "Select Pradeshiya Sabha…",
  id,
}: PradeshiyaSabhaSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selected = PRADESHIYA_SABHA_OPTIONS.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between font-normal px-3",
            !value && "text-muted-foreground"
          )}
        >
          <span className="truncate text-left">
            {selected?.label ?? (value ? value : placeholder)}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,420px)] p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            const q = search.trim().toLowerCase();
            if (!q) return 1;
            return itemValue.toLowerCase().includes(q) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Search by name or district…" />
          <CommandList>
            <CommandEmpty>No Pradeshiya Sabha found.</CommandEmpty>
            <CommandGroup>
              {PRADESHIYA_SABHA_OPTIONS.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={`${opt.label} ${opt.district}`}
                  onSelect={() => {
                    onValueChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === opt.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{opt.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

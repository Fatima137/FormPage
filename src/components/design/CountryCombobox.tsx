
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search as SearchIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Country {
  value: string;
  label: string;
  flag: string;
}

interface CountryComboboxProps {
  id?: string; 
  countries: Country[];
  selectedCountries: Country[];
  onSelectedCountriesChange: (selected: Country[]) => void;
  className?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
}

export function CountryCombobox({
  id, 
  countries,
  selectedCountries,
  onSelectedCountriesChange,
  className,
  placeholder = "Select market(s)...",
  searchPlaceholder = "Search market...",
  noResultsText = "No country found.",
}: CountryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const handleSelect = (country: Country) => {
    const isSelected = selectedCountries.some((c) => c.value === country.value);
    if (isSelected) {
      onSelectedCountriesChange(
        selectedCountries.filter((c) => c.value !== country.value)
      );
    } else {
      onSelectedCountriesChange([...selectedCountries, country]);
    }
    setSearchValue(''); 
  };

  const handleRemoveLastSelected = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' && searchValue === '' && selectedCountries.length > 0) {
      onSelectedCountriesChange(selectedCountries.slice(0, -1));
    }
  };

  const filteredCountries = React.useMemo(() => {
    if (!searchValue) return countries;
    return countries.filter((country) =>
      country.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [countries, searchValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id} 
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-10 py-1 focus-visible:ring-[hsl(var(--primary))]", // Added focus ring
            className, 
            selectedCountries.length > 0 ? "pr-2" : ""
          )}
        >
          <div className="flex flex-wrap gap-1 items-center flex-grow">
            {selectedCountries.length === 0 && <span className="text-muted-foreground text-sm">{placeholder}</span>}
            {selectedCountries.map((country) => (
              <Badge
                key={country.value}
                variant="secondary"
                className="px-2 py-0.5 text-xs bg-muted hover:bg-muted/80"
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleSelect(country);
                }}
              >
                {country.flag} {country.label}
                <X className="ml-1 h-3 w-3 cursor-pointer" />
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command onKeyDown={handleRemoveLastSelected}>
          <div className="flex items-center border-b px-3">
            <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <ScrollArea className="max-h-60">
            <CommandList>
              <CommandEmpty>{noResultsText}</CommandEmpty>
              <CommandGroup>
                {filteredCountries.map((country) => (
                  <CommandItem
                    key={country.value}
                    value={country.label} 
                    onSelect={() => {
                      handleSelect(country);
                      setOpen(false); 
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCountries.some((c) => c.value === country.value)
                          ? "opacity-100 text-[hsl(var(--lavender-accent))]"
                          : "opacity-0"
                      )}
                    />
                    <span className="mr-2">{country.flag}</span>
                    {country.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


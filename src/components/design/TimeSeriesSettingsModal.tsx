
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, PlusCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface TimeSeriesConfig {
  cadence: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | '';
  numWaves: number;
  startDate: Date | undefined;
  keyMetricFocus: string[];
}

interface TimeSeriesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: TimeSeriesConfig) => void;
  initialSettings: TimeSeriesConfig | null;
}

const cadenceOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];

const predefinedMetrics = ['Awareness', 'Usage', 'Preference'];

export function TimeSeriesSettingsModal({
  isOpen,
  onClose,
  onSave,
  initialSettings,
}: TimeSeriesSettingsModalProps) {
  const [cadence, setCadence] = React.useState<TimeSeriesConfig['cadence']>(initialSettings?.cadence || '');
  const [numWaves, setNumWaves] = React.useState<number>(initialSettings?.numWaves || 1);
  const [startDate, setStartDate] = React.useState<Date | undefined>(initialSettings?.startDate);
  const [keyMetrics, setKeyMetrics] = React.useState<string[]>(initialSettings?.keyMetricFocus || []);
  const [customMetricInput, setCustomMetricInput] = React.useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      setCadence(initialSettings?.cadence || '');
      setNumWaves(initialSettings?.numWaves || 1);
      setStartDate(initialSettings?.startDate);
      setKeyMetrics(initialSettings?.keyMetricFocus || []);
      setCustomMetricInput('');
    }
  }, [isOpen, initialSettings]);

  const handleAddCustomMetric = () => {
    if (customMetricInput.trim() !== '' && !keyMetrics.includes(customMetricInput.trim())) {
      setKeyMetrics([...keyMetrics, customMetricInput.trim()]);
      setCustomMetricInput('');
    }
  };

  const handleRemoveMetric = (metricToRemove: string) => {
    setKeyMetrics(keyMetrics.filter((metric) => metric !== metricToRemove));
  };

  const handleTogglePredefinedMetric = (metric: string) => {
    if (keyMetrics.includes(metric)) {
      handleRemoveMetric(metric);
    } else {
      setKeyMetrics([...keyMetrics, metric]);
    }
  };

  const isFormValid = React.useMemo(() => {
    return (
      cadence !== '' &&
      numWaves > 0 &&
      startDate !== undefined &&
      keyMetrics.length > 0
    );
  }, [cadence, numWaves, startDate, keyMetrics]);

  const handleSave = () => {
    if (isFormValid) {
      onSave({ cadence, numWaves, startDate, keyMetricFocus: keyMetrics });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Do you want to track changes over time?</DialogTitle>
          <DialogDescription>
            Monitor shifts and trends over time by setting up your tracking schedule.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-6">
          <div className="grid gap-6">
            {/* Cadence and Number of Waves */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cadence">Cadence</Label>
                <Select
                  value={cadence}
                  onValueChange={(value: TimeSeriesConfig['cadence']) => setCadence(value)}
                >
                  <SelectTrigger id="cadence">
                    <SelectValue placeholder="Select cadence" />
                  </SelectTrigger>
                  <SelectContent>
                    {cadenceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="num-waves">Number of Waves</Label>
                <Input
                  id="num-waves"
                  type="number"
                  value={numWaves}
                  onChange={(e) => setNumWaves(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  min="1"
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date (Wave 1)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Key Metric Focus */}
            <div className="space-y-2">
              <Label>Key Metric Focus</Label>
              <p className="text-sm text-muted-foreground">Select or add key metrics to track.</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {predefinedMetrics.map((metric) => (
                  <Button
                    key={metric}
                    variant={keyMetrics.includes(metric) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTogglePredefinedMetric(metric)}
                    className={cn(
                      keyMetrics.includes(metric) && "bg-[hsl(var(--lavender-accent))] text-[hsl(var(--lavender-accent-foreground))] hover:bg-[hsl(var(--lavender-accent))]/90"
                    )}
                  >
                    {metric}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Add custom metric..."
                  value={customMetricInput}
                  onChange={(e) => setCustomMetricInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomMetric();
                    }
                  }}
                />
                <Button type="button" size="icon" onClick={handleAddCustomMetric} variant="outline" aria-label="Add custom metric">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              {keyMetrics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {keyMetrics.map((metric) => (
                    <Badge key={metric} variant="secondary" className="py-1">
                      {metric}
                      <button
                        type="button"
                        onClick={() => handleRemoveMetric(metric)}
                        className="ml-1.5 -mr-0.5 rounded-full outline-none hover:bg-destructive/20 focus:bg-destructive/20"
                        aria-label={`Remove ${metric}`}
                      >
                        <X className="h-3 w-3 text-destructive" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t">
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={!isFormValid}
            className="bg-[hsl(var(--action-button-bg))] text-[hsl(var(--action-button-fg))] hover:bg-[hsl(var(--action-button-bg))] hover:opacity-90"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

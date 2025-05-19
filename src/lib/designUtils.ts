
import type React from 'react';
import { extractContextualConfig, type ExtractConfigInput, type ExtractConfigOutput } from '@/ai/flows/extract-contextual-config';
import type { PhotoConfig } from '@/components/design/PhotoSettingsModal';
import type { VideoConfig } from '@/components/design/VideoSettingsModal';
import type { TimeSeriesConfig } from '@/components/design/TimeSeriesSettingsModal';
import type { Country } from '@/config/countries';
import { defaultCountries } from '@/config/countries';
import type { useToast } from '@/hooks/use-toast';

export async function suggestAndApplyContextualConfig(
  projectContext: string | undefined,
  currentSampleSize: number,
  setSelectedCountries: React.Dispatch<React.SetStateAction<Country[]>>,
  setPhotoConfig: React.Dispatch<React.SetStateAction<PhotoConfig | null>>,
  setVideoConfig: React.Dispatch<React.SetStateAction<VideoConfig | null>>,
  setTimeSeriesConfig: React.Dispatch<React.SetStateAction<TimeSeriesConfig | null>>,
  toast: ReturnType<typeof useToast>['toast']
) {
  if (!projectContext) return;
  try {
    const configInput: ExtractConfigInput = { projectContext };
    const configSuggestions: ExtractConfigOutput = await extractContextualConfig(configInput);

    if (configSuggestions.suggestedMarkets && configSuggestions.suggestedMarkets.length > 0) {
      const matchedCountries = defaultCountries.filter(dc =>
        configSuggestions.suggestedMarkets!.some(sm =>
          dc.label.toLowerCase().includes(sm.toLowerCase()) ||
          sm.toLowerCase().includes(dc.label.toLowerCase()) ||
          dc.value.toLowerCase().includes(sm.toLowerCase()) ||
          sm.toLowerCase().includes(dc.value.toLowerCase())
        )
      );
      if (matchedCountries.length > 0) {
        setSelectedCountries(prev => {
          const currentValues = new Set(prev.map(c => c.value));
          const newCountriesToAdd = matchedCountries.filter(mc => !currentValues.has(mc.value));
          return [...prev, ...newCountriesToAdd];
        });
      }
    }

    if (configSuggestions.suggestedPhoto) {
      setPhotoConfig(prev => ({
        purpose: prev?.purpose || 'qualitative',
        numPhotos: prev?.numPhotos || Math.max(1, Math.round(currentSampleSize * 0.1)),
        description: configSuggestions.suggestedPhoto!.description,
      }));
    }

    if (configSuggestions.suggestedVideo) {
      setVideoConfig(prev => ({
        purpose: prev?.purpose || 'qualitative',
        numVideos: prev?.numVideos || Math.max(1, Math.round(currentSampleSize * 0.1)),
        description: configSuggestions.suggestedVideo!.description,
      }));
    }

    if (configSuggestions.suggestedTimeSeries) {
      const parsedDate = configSuggestions.suggestedTimeSeries.startDate && configSuggestions.suggestedTimeSeries.startDate !== "Not specified"
        ? new Date(configSuggestions.suggestedTimeSeries.startDate)
        : new Date(); // Default to now if not specified or invalid
      setTimeSeriesConfig({
        cadence: configSuggestions.suggestedTimeSeries.cadence as TimeSeriesConfig['cadence'] || 'monthly',
        numWaves: configSuggestions.suggestedTimeSeries.numWaves || 3,
        startDate: isNaN(parsedDate.getTime()) ? new Date() : parsedDate, // Ensure valid date
        keyMetricFocus: configSuggestions.suggestedTimeSeries.keyMetricFocus || [],
      });
    }

  } catch (configError) {
    console.error("Error extracting contextual configuration:", configError);
    toast({
      title: "Configuration Suggestion Error",
      description: "Could not automatically suggest configurations from project context.",
      variant: "default",
    });
  }
}

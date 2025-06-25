'use client';

import * as React from 'react';
import { SlidersHorizontal, Users, Puzzle, BarChartBig, CheckCircle, Globe, Info, Settings, Camera, Video as VideoIconLucide, PieChart, AreaChart, CalendarDays, Cpu, Timer, Clock, FileText, AlertTriangle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CountryCombobox, type Country } from './CountryCombobox';
import { defaultCountries } from '@/config/countries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PhotoSettingsModal, type PhotoConfig } from './PhotoSettingsModal';
import { VideoSettingsModal, type VideoConfig } from './VideoSettingsModal';
import { SegmentationSettingsModal, type SegmentationConfig } from './SegmentationSettingsModal';
import { TimeSeriesSettingsModal, type TimeSeriesConfig } from './TimeSeriesSettingsModal';
import { TokensInfoModal } from './TokensInfoModal';
import { FieldTimeInfoModal } from './FieldTimeInfoModal';
import { SurveyLengthInfoModal } from './SurveyLengthInfoModal';
import { FeasibilityInfoModal } from './FeasibilityInfoModal';
import { IncidenceRateModal } from './IncidenceRateModal';
import { cn } from '@/lib/utils';


interface AddOnItem {
  id: string;
  label: string;
  Icon: React.ElementType;
  actionIcon?: React.ElementType;
}

const addOns: AddOnItem[] = [
  { id: "photos", label: "Photos", Icon: Camera, actionIcon: Settings },
  { id: "videos", label: "Videos", Icon: VideoIconLucide, actionIcon: Settings },
  { id: "segmentation", label: "Segmentation", Icon: PieChart, actionIcon: Settings },
  { id: "time-series", label: "Time-Series / Tracking", Icon: AreaChart, actionIcon: Settings },
];

interface ConfigurationPanelProps {
  sampleSize: number;
  onSampleSizeChange: (newSize: number) => void;
  photoConfig: PhotoConfig | null;
  onPhotoConfigChange: (config: PhotoConfig | null) => void;
  videoConfig: VideoConfig | null;
  onVideoConfigChange: (config: VideoConfig | null) => void;
  segmentationConfig: SegmentationConfig | null;
  onSegmentationConfigChange: (config: SegmentationConfig | null) => void;
  timeSeriesConfig: TimeSeriesConfig | null;
  onTimeSeriesConfigChange: (config: TimeSeriesConfig | null) => void;
  selectedCountries: Country[];
  onSelectedCountriesChange: (countries: Country[]) => void;
  surveyGenerated: boolean;
  estimatedIR: number | null;
  irRationale: string;
  irSources: string[];
  onTriggerLaunch: () => void;
}

export function ConfigurationPanel({
  sampleSize: externalSampleSize,
  onSampleSizeChange,
  photoConfig,
  onPhotoConfigChange,
  videoConfig,
  onVideoConfigChange,
  segmentationConfig,
  onSegmentationConfigChange,
  timeSeriesConfig,
  onTimeSeriesConfigChange,
  selectedCountries,
  onSelectedCountriesChange,
  surveyGenerated,
  estimatedIR,
  irRationale,
  irSources,
  onTriggerLaunch,
}: ConfigurationPanelProps) {
  const [internalSampleSize, setInternalSampleSize] = React.useState<number>(externalSampleSize);
  const [feasibilityScore, setFeasibilityScore] = React.useState<number>(0);

  const [estimatedTokens, setEstimatedTokens] = React.useState<number>(0);
  const [estimatedFieldTime, setEstimatedFieldTime] = React.useState<string>("N/A");
  const [surveyLengthEstimate, setSurveyLengthEstimate] = React.useState<string>("N/A");

  const [addOnsState, setAddOnsState] = React.useState<Record<string, boolean>>({
    photos: !!photoConfig,
    videos: !!videoConfig,
    segmentation: !!segmentationConfig,
    "time-series": !!timeSeriesConfig,
  });

  const [isPhotoModalOpen, setIsPhotoModalOpen] = React.useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
  const [isSegmentationModalOpen, setIsSegmentationModalOpen] = React.useState(false);
  const [isTimeSeriesModalOpen, setIsTimeSeriesModalOpen] = React.useState(false);

  const [isTokensModalOpen, setIsTokensModalOpen] = React.useState(false);
  const [isFieldTimeModalOpen, setIsFieldTimeModalOpen] = React.useState(false);
  const [isSurveyLengthModalOpen, setIsSurveyLengthModalOpen] = React.useState(false);
  const [isFeasibilityInfoModalOpen, setIsFeasibilityInfoModalOpen] = React.useState(false);
  const [isIncidenceRateModalOpen, setIsIncidenceRateModalOpen] = React.useState(false);

  React.useEffect(() => {
    setInternalSampleSize(externalSampleSize);
  }, [externalSampleSize]);

  React.useEffect(() => {
    setAddOnsState(prev => ({ ...prev, photos: !!photoConfig }));
  }, [photoConfig]);

  React.useEffect(() => {
    setAddOnsState(prev => ({ ...prev, videos: !!videoConfig }));
  }, [videoConfig]);

  React.useEffect(() => {
    setAddOnsState(prev => ({ ...prev, segmentation: !!segmentationConfig }));
  }, [segmentationConfig]);

  React.useEffect(() => {
    setAddOnsState(prev => ({ ...prev, "time-series": !!timeSeriesConfig }));
  }, [timeSeriesConfig]);

  const handleInternalSampleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Math.max(51, parseInt(e.target.value, 10) || 51);
    setInternalSampleSize(newSize);
    onSampleSizeChange(newSize);
  };

  const handleAddOnToggle = (id: string, checked: boolean) => {
    setAddOnsState(prev => ({ ...prev, [id]: checked }));
    if (id === "photos") {
      if (checked && !photoConfig) {
        setIsPhotoModalOpen(true);
      } else if (!checked) {
        onPhotoConfigChange(null);
      }
    } else if (id === "videos") {
      if (checked && !videoConfig) {
        setIsVideoModalOpen(true);
      } else if (!checked) {
        onVideoConfigChange(null);
      }
    } else if (id === "segmentation") {
      if (checked && !segmentationConfig) {
        setIsSegmentationModalOpen(true);
      } else if (!checked) {
        onSegmentationConfigChange(null);
      }
    } else if (id === "time-series") {
      if (checked && !timeSeriesConfig) {
        setIsTimeSeriesModalOpen(true);
      } else if (!checked) {
        onTimeSeriesConfigChange(null);
      }
    }
  };

  const handleSavePhotoSettings = (settings: PhotoConfig) => {
    onPhotoConfigChange(settings);
    setIsPhotoModalOpen(false);
  };

  const handleSaveVideoSettings = (settings: VideoConfig) => {
    onVideoConfigChange(settings);
    setIsVideoModalOpen(false);
  };

  const handleSaveSegmentationSettings = (settings: SegmentationConfig) => {
    onSegmentationConfigChange(settings);
    setIsSegmentationModalOpen(false);
  };

  const handleSaveTimeSeriesSettings = (settings: TimeSeriesConfig) => {
    onTimeSeriesConfigChange(settings);
    setIsTimeSeriesModalOpen(false);
  };


  React.useEffect(() => {
    // Feasibility Calculation
    let baseScore = 80;
    const sizeImpact = Math.max(0, 50 - Math.floor(internalSampleSize / 20));
    let countryComplexityFactor = 0;
    if (selectedCountries.length > 1) {
      countryComplexityFactor = selectedCountries.length * 2;
    }
    if (selectedCountries.some(c => ["cn", "jp", "br", "in"].includes(c.value))) {
        countryComplexityFactor += 5;
    }
    const calculatedScore = Math.min(100, Math.max(0, baseScore - sizeImpact - countryComplexityFactor - (50 - (estimatedIR ?? 50))/2 ));
    setFeasibilityScore(calculatedScore);

    // Token Calculation
    let numVideoEnabledRespondents = 0;
    let numPhotoOnlyEnabledRespondents = 0;
    let numTextOnlyRespondents = internalSampleSize;

    if (videoConfig) {
        if (videoConfig.purpose === 'quantitative') {
            numVideoEnabledRespondents = internalSampleSize;
            numTextOnlyRespondents = 0;
        } else {
            numVideoEnabledRespondents = Math.min(videoConfig.numVideos, internalSampleSize);
            numTextOnlyRespondents = internalSampleSize - numVideoEnabledRespondents;
        }
    }

    if (photoConfig) {
        if (photoConfig.purpose === 'quantitative') {
            numPhotoOnlyEnabledRespondents = numTextOnlyRespondents;
            numTextOnlyRespondents = 0;
        } else {
            const canDoPhoto = Math.min(photoConfig.numPhotos, numTextOnlyRespondents);
            numPhotoOnlyEnabledRespondents = canDoPhoto;
            numTextOnlyRespondents -= canDoPhoto;
        }
    }

    const totalTokens = (numVideoEnabledRespondents * 5) +
                        (numPhotoOnlyEnabledRespondents * 3) +
                        (numTextOnlyRespondents * 1);
    setEstimatedTokens(totalTokens);


    if (calculatedScore > 70 && (estimatedIR ?? 0) > 40) setEstimatedFieldTime("3-5 days");
    else if (calculatedScore > 40 && (estimatedIR ?? 0) > 20) setEstimatedFieldTime("5-7 days");
    else setEstimatedFieldTime("7-10+ days");
    setSurveyLengthEstimate("8-12 minutes");

  }, [internalSampleSize, selectedCountries, photoConfig, videoConfig, estimatedIR]);

  const getFeasibilityStatus = (): {
    levelText: string;
    colorClass: string;
  } => {
    if (feasibilityScore > 75) return { levelText: "High", colorClass: "text-[hsl(var(--lavender-accent))]" };
    if (feasibilityScore > 50) return { levelText: "text-yellow-500", colorClass: "text-yellow-500" };
    return { levelText: "Low", colorClass: "text-orange-500" };
  };
  const feasibilityStatus = getFeasibilityStatus();
  const FeasibilityIcon = Activity;


  if (!surveyGenerated) {
    return null;
  }

  const displayIR = estimatedIR ?? 0;

  return (
    <>
    <Sheet>
      <SheetTrigger asChild>
        <Button
            className="fixed bottom-6 right-6 shadow-lg z-50 h-14 group
                       bg-[hsl(var(--action-button-bg))] text-[hsl(var(--action-button-fg))]
                       hover:bg-[hsl(var(--action-button-bg))] hover:opacity-90 hover:text-[hsl(var(--action-button-fg))]"
            aria-label="Configure & Launch Survey"
        >
          <SlidersHorizontal className="h-6 w-6 mr-2 text-[hsl(var(--action-button-fg))] group-hover:animate-pulse" />
          Configure & Launch
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[450px] sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2 border-b sr-only"> {/* Screen reader only title */}
           <SheetTitle>Survey Configuration</SheetTitle>
           <SheetDescription>Adjust survey settings, audience, add-ons, and review feasibility before launching.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow">
          <div className="pt-4 px-6 pb-6 space-y-6">
            <div className="space-y-3 p-3 border rounded-lg">
              <h3 className="text-base font-semibold flex items-center mb-3"><Users className="mr-2 h-5 w-5 text-[hsl(var(--lavender-accent))]" />Audience</h3>
                
              <div className="flex items-center justify-between">
                <Label htmlFor="sample-size" className="flex items-center text-xs font-medium">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />Sample
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="sample-size"
                    type="number"
                    value={internalSampleSize}
                    onChange={handleInternalSampleSizeChange}
                    min="51"
                    className="h-9 text-sm focus-visible:ring-[hsl(var(--primary))] w-28"
                  />
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0 data-[state=open]:bg-transparent hover:bg-transparent">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-[hsl(var(--lavender-accent))]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-sm">How many people do you want to speak to?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="market" className="flex items-center text-xs font-medium">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />Market
                </Label>
                <div className="flex items-center gap-2">
                  <CountryCombobox
                    id="market"
                    countries={defaultCountries}
                    selectedCountries={selectedCountries}
                    onSelectedCountriesChange={onSelectedCountriesChange}
                    className="h-auto text-sm focus-visible:ring-[hsl(var(--primary))] w-48" 
                    placeholder=""
                  />
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0 data-[state=open]:bg-transparent hover:bg-transparent">
                          <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-[hsl(var(--lavender-accent))]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-sm">Market selection will impact feasibility, cost, and timelines.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="incidence-rate" className="flex items-center text-xs font-medium">
                  <Activity className="mr-2 h-4 w-4 text-muted-foreground" />Incidence Rate
                </Label>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 w-36">
                        <Progress value={displayIR} className="h-2 bg-[hsl(var(--progress-bar-bg))] [&>div]:bg-[hsl(var(--progress-bar-fill))] flex-grow" />
                        <span className={cn(
                            "font-semibold text-xs min-w-[40px] text-right",
                            displayIR > 40 ? "text-[hsl(var(--lavender-accent))]" :
                            displayIR >= 20 ? "text-yellow-500" :
                            "text-orange-500"
                            )}>
                        {displayIR}%
                        </span>
                    </div>
                    <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0 data-[state=open]:bg-transparent hover:bg-transparent" onClick={() => setIsIncidenceRateModalOpen(true)}>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-[hsl(var(--lavender-accent))]" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-sm">
                        <p>Click to see how Incidence Rate (IR) is estimated.</p>
                        </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-base font-semibold flex items-center"><Puzzle className="mr-2 h-5 w-5 text-[hsl(var(--lavender-accent))]" />Add-ons</h3>
              {addOns.map(addon => {
                const ActionIconComponent = addon.actionIcon;
                const isConfigured =
                  (addon.id === "photos" && photoConfig) ||
                  (addon.id === "videos" && videoConfig) ||
                  (addon.id === "segmentation" && segmentationConfig) ||
                  (addon.id === "time-series" && timeSeriesConfig);

                return (
                  <div key={addon.id} className="flex items-center justify-between">
                    <Label htmlFor={addon.id} className="flex items-center text-xs font-medium">
                      <addon.Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {addon.label}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={addon.id}
                        checked={addOnsState[addon.id]}
                        onCheckedChange={(checked) => handleAddOnToggle(addon.id, checked)}
                      />
                      {addOnsState[addon.id] && ActionIconComponent && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-[hsl(var(--soft-lavender-hover-bg))]"
                          onClick={() => {
                            if (addon.id === "photos") setIsPhotoModalOpen(true);
                            else if (addon.id === "videos") setIsVideoModalOpen(true);
                            else if (addon.id === "segmentation") setIsSegmentationModalOpen(true);
                            else if (addon.id === "time-series") setIsTimeSeriesModalOpen(true);
                          }}
                          aria-label={`Configure ${addon.label}`}
                        >
                          <ActionIconComponent
                            className={cn(
                              "h-4 w-4",
                              isConfigured
                                ? "text-foreground" 
                                : "text-destructive" 
                            )}
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 p-4 border rounded-lg">
               <h3 className="text-base font-semibold flex items-center mb-3"><BarChartBig className="mr-2 h-5 w-5 text-[hsl(var(--lavender-accent))]" />Feasibility &amp; Costs</h3>
                <div className="grid grid-cols-1 gap-4">

                  <Card>
                    <CardContent className="flex items-center p-3 gap-3">
                      <Cpu className="h-5 w-5 text-[hsl(var(--lavender-accent))] shrink-0" />
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium text-card-foreground">Estimated Tokens</h4>
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5 p-0 -mr-1" onClick={() => setIsTokensModalOpen(true)}>
                                  <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-[hsl(var(--lavender-accent))]" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top"><p>About Tokens</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="text-lg font-bold mt-0">{estimatedTokens.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground leading-tight mt-0.5">Based on sample, media &amp; survey type.</p>
                      </div>
                    </CardContent>
                  </Card>


                  <Card>
                    <CardContent className="flex items-center p-3 gap-3">
                      <Timer className="h-5 w-5 text-[hsl(var(--lavender-accent))] shrink-0" />
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium text-card-foreground">Est. Field Time</h4>
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5 p-0 -mr-1" onClick={() => setIsFieldTimeModalOpen(true)}>
                                  <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-[hsl(var(--lavender-accent))]" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top"><p>How field time is estimated.</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="text-lg font-bold mt-0">{estimatedFieldTime}</div>
                         <p className="text-xs text-muted-foreground leading-tight mt-0.5">Influenced by IR, sample, and market.</p>
                      </div>
                    </CardContent>
                  </Card>


                  <Card>
                     <CardContent className="flex items-center p-3 gap-3">
                      <Clock className="h-5 w-5 text-[hsl(var(--lavender-accent))] shrink-0" />
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium text-card-foreground">Survey Length</h4>
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5 p-0 -mr-1" onClick={() => setIsSurveyLengthModalOpen(true)}>
                                  <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-[hsl(var(--lavender-accent))]" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top"><p>How survey length is estimated.</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="text-lg font-bold mt-0">{surveyLengthEstimate}</div>
                        <p className="text-xs text-muted-foreground leading-tight mt-0.5">Based on number and type of questions.</p>
                      </div>
                    </CardContent>
                  </Card>


                  <Card>
                    <CardContent className="flex items-center p-3 gap-3">
                      <FeasibilityIcon className={cn("h-5 w-5 shrink-0", feasibilityStatus.colorClass)} />
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium text-card-foreground">Feasibility</h4>
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5 p-0 -mr-1" onClick={() => setIsFeasibilityInfoModalOpen(true)}>
                                  <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-[hsl(var(--lavender-accent))]" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top"><p>How feasibility is calculated.</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="text-lg font-bold mt-0">
                          <span className={feasibilityStatus.colorClass}>{feasibilityStatus.levelText}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-tight mt-0.5">Reflects overall project complexity.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 border-t sticky bottom-0 bg-background flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
            <Button
              onClick={onTriggerLaunch}
              className="bg-[hsl(var(--action-button-bg))] text-[hsl(var(--action-button-fg))] hover:bg-[hsl(var(--action-button-bg))] hover:opacity-90"
            >
              <CheckCircle className="mr-2 h-5 w-5 text-[hsl(var(--action-button-fg))]" />
              Launch Survey
            </Button>
        </div>
      </SheetContent>
    </Sheet>

    {/* Modals for Add-ons */}
    {isPhotoModalOpen && (
      <PhotoSettingsModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSave={handleSavePhotoSettings}
        sampleSize={internalSampleSize}
        initialSettings={photoConfig}
      />
    )}
    {isVideoModalOpen && (
      <VideoSettingsModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSave={handleSaveVideoSettings}
        sampleSize={internalSampleSize}
        initialSettings={videoConfig}
      />
    )}
    {isSegmentationModalOpen && (
      <SegmentationSettingsModal
        isOpen={isSegmentationModalOpen}
        onClose={() => setIsSegmentationModalOpen(false)}
        onSave={handleSaveSegmentationSettings}
        initialSettings={segmentationConfig}
      />
    )}
    {isTimeSeriesModalOpen && (
      <TimeSeriesSettingsModal
        isOpen={isTimeSeriesModalOpen}
        onClose={() => setIsTimeSeriesModalOpen(false)}
        onSave={handleSaveTimeSeriesSettings}
        initialSettings={timeSeriesConfig}
      />
    )}

    {/* Modals for Feasibility & Cost Insights */}
    {isTokensModalOpen && <TokensInfoModal isOpen={isTokensModalOpen} onClose={() => setIsTokensModalOpen(false)} />}
    {isFieldTimeModalOpen && <FieldTimeInfoModal isOpen={isFieldTimeModalOpen} onClose={() => setIsFieldTimeModalOpen(false)} />}
    {isSurveyLengthModalOpen && <SurveyLengthInfoModal isOpen={isSurveyLengthModalOpen} onClose={() => setIsSurveyLengthModalOpen(false)} />}
    {isFeasibilityInfoModalOpen &&
      <FeasibilityInfoModal
        isOpen={isFeasibilityInfoModalOpen}
        onClose={() => setIsFeasibilityInfoModalOpen(false)}
        feasibilityScore={feasibilityScore}
        estimatedIR={estimatedIR}
        sampleSize={internalSampleSize}
        photoConfig={photoConfig}
        videoConfig={videoConfig}
        selectedCountries={selectedCountries}
      />
    }
    {isIncidenceRateModalOpen &&
      <IncidenceRateModal
        isOpen={isIncidenceRateModalOpen}
        onClose={() => setIsIncidenceRateModalOpen(false)}
        estimatedIR={estimatedIR ?? 0}
        rationale={irRationale}
        sources={irSources}
      />
    }
    </>
  );
}

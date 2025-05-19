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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { FrameworkSection } from '@/config/exploreTemplates';
import { cn } from '@/lib/utils';
import { Settings2, Filter, ArrowLeft, Repeat, PlusCircle, Puzzle, type LucideIcon, SlidersHorizontal } from 'lucide-react';
import { SectionDisplayCard } from './SectionDisplayCard';
import { PathwayTile } from './PathwayTile';
import { renderQuestionTextWithPlaceholdersGlobal, QuestionTypeIcon } from '@/config/surveyUtils';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface CustomizeSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTemplateTitle: string;
  currentScreenerSections?: FrameworkSection[];
  currentContentSections?: FrameworkSection[];
  allAvailableScreenerSections?: FrameworkSection[];
  allAvailableContentSections?: FrameworkSection[];
  onSaveScreeners: (updatedSections: FrameworkSection[]) => void;
  onSaveContentSections: (updatedSections: FrameworkSection[]) => void;
  solutionType: 'explore' | 'test' | 'pulse';
}

export function CustomizeSectionsModal({
  isOpen,
  onClose,
  activeTemplateTitle,
  currentScreenerSections = [],
  currentContentSections = [],
  allAvailableScreenerSections = [],
  allAvailableContentSections = [],
  onSaveScreeners,
  onSaveContentSections,
  solutionType,
}: CustomizeSectionsModalProps) {
  const [selectedScreenerTitles, setSelectedScreenerTitles] = React.useState<Set<string>>(
    new Set(currentScreenerSections.map(s => s.title))
  );
  const [selectedContentSectionTitles, setSelectedContentSectionTitles] = React.useState<Set<string>>(
    new Set(currentContentSections.map(s => s.title))
  );
  
  const [modalStep, setModalStep] = React.useState<'contentEditor' | 'screenerEditor'>('contentEditor');
  const [addTabContentView, setAddTabContentView] = React.useState<'pathways' | 'section_picker'>('pathways');
  
  const [activeContentEditorTab, setActiveContentEditorTab] = React.useState<'included' | 'addMore'>('included');
  const [activeScreenerEditorTab, setActiveScreenerEditorTab] = React.useState<'included' | 'addScreeners'>('included');
  const [openAddSectionCards, setOpenAddSectionCards] = React.useState<string[]>([]);
  
  const [newlyAddedContentTitles, setNewlyAddedContentTitles] = React.useState<Set<string>>(new Set());
  
  const isFirstOpen = React.useRef(true);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedScreenerTitles(new Set(currentScreenerSections.map(s => s.title)));
      setSelectedContentSectionTitles(new Set(currentContentSections.map(s => s.title)));
      setModalStep('contentEditor');
      setAddTabContentView('pathways');
      setActiveContentEditorTab('addMore');
      setActiveScreenerEditorTab('included');
      isFirstOpen.current = false;
    } else {
      isFirstOpen.current = true; 
      setOpenAddSectionCards([]);
    }
  }, [isOpen, currentScreenerSections, currentContentSections]);


  const handleToggleSection = (
    sectionTitle: string,
    sectionType: 'screener' | 'content'
  ) => {
    const currentSet = sectionType === 'screener' ? selectedScreenerTitles : selectedContentSectionTitles;
    const setter = sectionType === 'screener' ? setSelectedScreenerTitles : setSelectedContentSectionTitles;

    setter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });

    if (sectionType === 'content') {
      if (newlyAddedContentTitles.has(sectionTitle)) {
        setNewlyAddedContentTitles(prev => new Set(prev.filter(t => t !== sectionTitle)));
      } else {
        setNewlyAddedContentTitles(prev => new Set(prev.add(sectionTitle)));
      }
    }
  };
  
  const buildFinalSections = (
    selectedTitles: Set<string>,
    originalSectionsFromTemplate: FrameworkSection[],
    allAvailableSectionsOfType: FrameworkSection[]
  ): FrameworkSection[] => {
    const finalSections: FrameworkSection[] = [];
    const addedTitles = new Set<string>();
    const sectionsMap = new Map(allAvailableSectionsOfType.map(s => [s.title, s]));

    originalSectionsFromTemplate.forEach(originalSection => {
      if (selectedTitles.has(originalSection.title)) {
        const sectionFromMap = sectionsMap.get(originalSection.title);
        if (sectionFromMap) {
            finalSections.push(sectionFromMap);
            addedTitles.add(originalSection.title);
        }
      }
    });
    
    selectedTitles.forEach(title => {
      if (!addedTitles.has(title)) {
        const section = sectionsMap.get(title);
        if (section) {
          finalSections.push(section);
        }
      }
    });
    return finalSections;
  };

  const handleSaveContent = () => {
    const finalContentSections = buildFinalSections(selectedContentSectionTitles, currentContentSections, allAvailableContentSections);
    onSaveContentSections(finalContentSections);
    onClose();
  };

  const handleSaveScreenersAndContinue = () => {
    const finalScreenerSections = buildFinalSections(selectedScreenerTitles, currentScreenerSections, allAvailableScreenerSections);
    onSaveScreeners(finalScreenerSections);
    setModalStep('contentEditor');
    setAddTabContentView('pathways'); 
    setActiveContentEditorTab('included'); 
  };
  
  const sectionsToDisplayInIncludedTab = React.useCallback((sectionType: 'screener' | 'content'): FrameworkSection[] => {
    const selectedTitles = sectionType === 'screener' ? selectedScreenerTitles : selectedContentSectionTitles;
    const originalSections = sectionType === 'screener' ? currentScreenerSections : currentContentSections;
    const allAvailable = sectionType === 'screener' ? allAvailableScreenerSections : allAvailableContentSections;
    
    const included: FrameworkSection[] = [];
    const titlesInAllAvailable = new Map(allAvailable.map(s => [s.title, s]));

    originalSections.forEach(originalSection => {
        if (selectedTitles.has(originalSection.title)) {
            const sectionDetail = titlesInAllAvailable.get(originalSection.title);
            if (sectionDetail) included.push(sectionDetail);
        }
    });
    selectedTitles.forEach(title => {
        if (!included.some(s => s.title === title)) {
            const sectionDetail = titlesInAllAvailable.get(title);
            if (sectionDetail) included.push(sectionDetail);
        }
    });
    return included;
  }, [selectedScreenerTitles, selectedContentSectionTitles, currentScreenerSections, currentContentSections, allAvailableScreenerSections, allAvailableContentSections]);

  const availableToAddSections = React.useCallback((sectionType: 'screener' | 'content'): FrameworkSection[] => {
    const selectedTitles = sectionType === 'screener' ? selectedScreenerTitles : selectedContentSectionTitles;
    const allAvailable = sectionType === 'screener' ? allAvailableScreenerSections : allAvailableContentSections;
    return allAvailable.filter(s => !selectedTitles.has(s.title));
  }, [selectedScreenerTitles, selectedContentSectionTitles, allAvailableScreenerSections, allAvailableContentSections]);


 const renderSectionList = (
    sections: FrameworkSection[],
    isCurrentlyIncludedBehavior: boolean,
    sectionTypeForToggle: 'screener' | 'content',
    editorViewType: 'included_content' | 'add_content' | 'included_screeners' | 'add_screeners',
    newlyAddedTitles: Set<string> = new Set()
  ) => {
    const gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5";
    const isExpandableContext = editorViewType === 'add_content' || editorViewType === 'add_screeners';

    let filteredSections = sections;
    if (editorViewType === 'add_screeners') {
      const excludedScreenerTitles = [
        "Screener: General Qualification",
        "Screener: Product Ownership",
      ];
      // Retain "Screener: Purchase channel usage" if it exists
      filteredSections = sections.filter(s => !excludedScreenerTitles.includes(s.title));
    }
    
    if (filteredSections.length === 0) {
      const message = isCurrentlyIncludedBehavior 
        ? "No sections currently included."
        : "All available sections are currently included, or none match the current filter.";
      return <p className="text-sm text-muted-foreground text-center py-8">{message}</p>;
    }
  
    if (isExpandableContext) {
      return (
        <Accordion type="multiple" value={openAddSectionCards} onValueChange={setOpenAddSectionCards} className="w-full">
            <div className={gridClass}>
                {filteredSections.map((section) => (
                     <AccordionItem value={section.title} key={section.title} className="border-none break-inside-avoid">
                        <SectionDisplayCard
                            section={section}
                            isCurrentlyIncluded={isCurrentlyIncludedBehavior}
                            onToggleSection={() => handleToggleSection(section.title, sectionTypeForToggle)}
                            solutionType={solutionType}
                            isExpandable={true}
                            isExpanded={openAddSectionCards.includes(section.title)}
                            onToggleExpand={() => setOpenAddSectionCards(prev => 
                                prev.includes(section.title) ? prev.filter(t => t !== section.title) : [...prev, section.title]
                            )}
                            cardColor={isCurrentlyIncludedBehavior ? 'green' : (newlyAddedTitles.has(section.title) ? 'purple' : undefined)}
                        >
                            {section.exampleQuestions && section.exampleQuestions.length > 0 && (
                               <AccordionContent className="pt-2 pb-1">
                                 <ul className="space-y-1 text-xs text-muted-foreground">
                                   {section.exampleQuestions.map((q, qIdx) => (
                                     <li key={qIdx} className="flex items-start">
                                       <QuestionTypeIcon type={q.questionType} className="mr-1.5 mt-0.5 shrink-0 h-3.5 w-3.5" />
                                       <span>{renderQuestionTextWithPlaceholdersGlobal(q.questionText, {}, true)}</span>
                                     </li>
                                   ))}
                                 </ul>
                               </AccordionContent>
                            )}
                        </SectionDisplayCard>
                     </AccordionItem>
                ))}
            </div>
        </Accordion>
      );
    }
    // For "Included" tab rendering (not expandable)
    return (
        <div className={gridClass}>
            {filteredSections.map((section) => (
                <SectionDisplayCard
                    key={section.title}
                    section={section}
                    isCurrentlyIncluded={isCurrentlyIncludedBehavior}
                    onToggleSection={() => handleToggleSection(section.title, sectionTypeForToggle)}
                    solutionType={solutionType}
                    isExpandable={false} 
                />
            ))}
        </div>
    );
  };


  const renderPathwayView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
      <PathwayTile
        title="Swap your screeners"
        description="Swap out the default screeners with other best-practice options for qualifying respondents."
        Icon={Repeat}
        onClick={() => {
          setModalStep('screenerEditor');
          setActiveScreenerEditorTab('addScreeners');
        }}
      />
      <PathwayTile
        title={`Add from "${activeTemplateTitle}" Template`}
        description={`Extend your survey with additional questions that are tailored to the "${activeTemplateTitle}" template.`}
        Icon={PlusCircle}
        onClick={() => {
          setAddTabContentView('section_picker');
          setActiveContentEditorTab('addMore'); 
        }}
      />
      <PathwayTile
        title="Add from Other Templates"
        description="Mix and match question groups from our other research templates (e.g., Shopper & purchases, Brand)."
        Icon={Puzzle}
        onClick={() => {
          setAddTabContentView('section_picker');
          setActiveContentEditorTab('addMore');
        }}
      />
    </div>
  );

  const renderEditorView = (editorSectionType: 'content' | 'screener') => {
    const currentTabState = editorSectionType === 'content' ? activeContentEditorTab : activeScreenerEditorTab;
    const setTabState = editorSectionType === 'content' ? setActiveContentEditorTab : setActiveScreenerEditorTab;
    
    const includedSectionsForDisplay = sectionsToDisplayInIncludedTab(editorSectionType);
    const includedTabLabel = editorSectionType === 'content' ? `Included in the template (${includedSectionsForDisplay.length})` : `Included Screeners (${includedSectionsForDisplay.length})`;
    
    const addTabLabel = editorSectionType === 'content' ? "Add question groups" : "Add Screeners";
    const addTabValue = editorSectionType === 'content' ? "addMore" : "addScreeners";
    const includedViewType = editorSectionType === 'content' ? 'included_content' : 'included_screeners';
    const addViewType = editorSectionType === 'content' ? 'add_content' : 'add_screeners';

    return (
      <Tabs 
        value={currentTabState} 
        onValueChange={(value) => {
          setTabState(value as any);
          if (editorSectionType === 'content' && value === 'addMore') {
            setAddTabContentView('pathways'); // Reset to pathways when 'Add more' tab is clicked
          }
        }} 
        className="flex flex-col flex-grow min-h-0"
      >
        <TabsList className="mx-6 mt-6 mb-4 rounded-[16px]">
          <TabsTrigger value="included" className="flex-1 rounded-l-[16px] text-sm">
            <Puzzle className="h-4 w-4 mr-2" />
            {includedTabLabel}
          </TabsTrigger>
          <TabsTrigger value={addTabValue} className="flex-1 rounded-r-[16px] text-sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            {addTabLabel}
          </TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-grow h-0 px-6 pb-6">
          <TabsContent value="included">
            {renderSectionList(includedSectionsForDisplay, true, editorSectionType, includedViewType, newlyAddedContentTitles)}
          </TabsContent>
          <TabsContent value={addTabValue}>
            {editorSectionType === 'content' && addTabContentView === 'pathways' ? (
              renderPathwayView()
            ) : (
              <>
                {(editorSectionType === 'content' && addTabContentView === 'section_picker') && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAddTabContentView('pathways')} 
                    className="mb-4 text-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Add Options
                  </Button>
                )}
                {renderSectionList(availableToAddSections(editorSectionType), false, editorSectionType, addViewType, newlyAddedContentTitles)}
              </>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    );
  };
  

  const renderContentEditor = () => (
    <>
      <DialogHeader className="p-6 pb-4 border-b">
        <DialogTitle className="flex items-center text-2xl font-bold">
          <Settings2 className="h-6 w-6 mr-3 text-[hsl(var(--lavender-accent))]" />
          Customize Content Sections
        </DialogTitle>
        <DialogDescription className="text-base">
          Refine your survey by adding or removing question groups.
        </DialogDescription>
      </DialogHeader>
      {renderEditorView('content')}
      <DialogFooter className="p-6 pt-4 border-t">
        <Button 
            onClick={handleSaveContent}
            className="bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--button-hover))]"
        >
            Save Sections & Close
        </Button>
      </DialogFooter>
    </>
  );

  const renderScreenerEditor = () => (
     <>
      <DialogHeader className="p-6 pb-4 border-b">
        <DialogTitle className="flex items-center text-2xl font-bold">
          <Filter className="h-6 w-6 mr-3 text-[hsl(var(--lavender-accent))]"/>
          Customize Screener Sections
        </DialogTitle>
        <DialogDescription className="text-base">
          Select the screener questions to qualify your respondents.
        </DialogDescription>
      </DialogHeader>
      {renderEditorView('screener')}
      <DialogFooter className="p-6 pt-4 border-t flex justify-between">
        <Button 
            variant="outline"
            onClick={() => {
                setModalStep('contentEditor');
                setAddTabContentView('pathways');
                setActiveContentEditorTab('addMore'); 
            }}
        >
            Back to Content Sections
        </Button>
        <Button 
            onClick={handleSaveScreenersAndContinue}
            className="bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--button-hover))]"
        >
            Save Screeners & Edit Content
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col p-0">
        {modalStep === 'contentEditor' ? renderContentEditor() : renderScreenerEditor()}
      </DialogContent>
    </Dialog>
  );
}

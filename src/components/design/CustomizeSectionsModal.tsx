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
import { Settings2, Filter, ArrowLeft, Repeat, PlusCircle, Puzzle, type LucideIcon, SlidersHorizontal, Eye, EyeOff } from 'lucide-react';
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
  
  const [addTabContentView, setAddTabContentView] = React.useState<'pathways' | 'section_picker'>('pathways');
  
  const [activeContentEditorTab, setActiveContentEditorTab] = React.useState<'included' | 'addMore'>('included');
  
  const [newlyAddedTitles, setNewlyAddedTitles] = React.useState<Set<string>>(new Set());
  
  const [openAddSectionCards, setOpenAddSectionCards] = React.useState<string[]>([]);
  
  const [addFilter, setAddFilter] = React.useState<'all' | 'screeners' | 'content'>('all');
  
  const [expandAllQuestions, setExpandAllQuestions] = React.useState(false);
  
  const isFirstOpen = React.useRef(true);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedScreenerTitles(new Set(currentScreenerSections.map(s => s.title)));
      setSelectedContentSectionTitles(new Set(currentContentSections.map(s => s.title)));
      setAddTabContentView('pathways');
      setActiveContentEditorTab('included');
      setNewlyAddedTitles(new Set());
      setOpenAddSectionCards([]);
      setAddFilter('all');
      setExpandAllQuestions(false);
      isFirstOpen.current = false;
    }
  }, [isOpen, currentScreenerSections, currentContentSections]);


  const handleToggleSection = (
    sectionTitle: string,
    sectionType: 'screener' | 'content'
  ) => {
    if (sectionType === 'screener') {
      setSelectedScreenerTitles(prev => {
        const newSet = new Set(prev);
        if (newSet.has(sectionTitle)) {
          newSet.delete(sectionTitle);
        } else {
          newSet.add(sectionTitle);
        }
        return newSet;
      });
    } else {
      setSelectedContentSectionTitles(prev => {
        const newSet = new Set(prev);
        if (newSet.has(sectionTitle)) {
          newSet.delete(sectionTitle);
        } else {
          newSet.add(sectionTitle);
        }
        return newSet;
      });
    }
    if (newlyAddedTitles.has(sectionTitle)) {
      setNewlyAddedTitles(prev => new Set([...prev].filter(t => t !== sectionTitle)));
    } else {
      setNewlyAddedTitles(prev => new Set(prev).add(sectionTitle));
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
    const finalContentSections = buildFinalSections(
      selectedContentSectionTitles,
      currentContentSections,
      allAvailableContentSections
    );
    const finalScreenerSections = buildFinalSections(
      selectedScreenerTitles,
      currentScreenerSections,
      allAvailableScreenerSections
    );
    
    onSaveContentSections(finalContentSections);
    onSaveScreeners(finalScreenerSections);
    
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('customizeSectionsSaved', {
        detail: {
          screenerSections: finalScreenerSections,
          contentSections: finalContentSections,
        }
      }));
    }
    
    setSelectedScreenerTitles(new Set(finalScreenerSections.map(s => s.title)));
    setSelectedContentSectionTitles(new Set(finalContentSections.map(s => s.title)));
    setNewlyAddedTitles(new Set());
    setOpenAddSectionCards([]);
    
    onClose();
  };

  const handleSaveScreenersAndContinue = () => {
    const finalScreenerSections = buildFinalSections(selectedScreenerTitles, currentScreenerSections, allAvailableScreenerSections);
    onSaveScreeners(finalScreenerSections);
    setAddTabContentView('pathways'); 
    setActiveContentEditorTab('included'); 
  };
  
  const includedScreeners = allAvailableScreenerSections.filter(s => selectedScreenerTitles.has(s.title));
  const includedContentSections = allAvailableContentSections.filter(s => selectedContentSectionTitles.has(s.title));

  const includedSectionsForDisplay = [
    ...includedScreeners,
    ...includedContentSections,
  ];

  const renderSectionList = (
    sections: FrameworkSection[],
    isCurrentlyIncludedBehavior: boolean,
    sectionTypeForToggle: 'screener' | 'content',
    editorViewType: 'included_content' | 'add_content' | 'included_screeners' | 'add_screeners',
    newlyAddedTitles: Set<string> = new Set()
  ) => {
    const filteredSections = sections.filter(section => {
      if (isCurrentlyIncludedBehavior) {
        return sectionTypeForToggle === 'screener' 
          ? selectedScreenerTitles.has(section.title)
          : selectedContentSectionTitles.has(section.title);
      }
      return sectionTypeForToggle === 'screener'
        ? !selectedScreenerTitles.has(section.title)
        : !selectedContentSectionTitles.has(section.title);
    });

    const gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
    const isExpandableContext = !isCurrentlyIncludedBehavior;

    if (isExpandableContext) {
      return (
        <Accordion 
          type="multiple" 
          value={expandAllQuestions ? filteredSections.map(s => s.title) : openAddSectionCards} 
          onValueChange={setOpenAddSectionCards} 
          className="w-full"
        >
          <div className={gridClass}>
            {filteredSections.map((section) => (
              <SectionDisplayCard
                key={section.title}
                section={section}
                isCurrentlyIncluded={isCurrentlyIncludedBehavior}
                onToggleSection={() => handleToggleSection(section.title, sectionTypeForToggle)}
                solutionType={solutionType}
                isExpandable={true}
                isExpanded={expandAllQuestions}
                cardColor={newlyAddedTitles.has(section.title) ? 'purple' : undefined}
              >
                {section.questions && section.questions.length > 0 && (
                  <div className="space-y-2">
                    {section.questions.map((question, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <QuestionTypeIcon type={question.type} className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">
                          {renderQuestionTextWithPlaceholdersGlobal(question.text)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionDisplayCard>
            ))}
          </div>
        </Accordion>
      );
    }
    // For included list (not expandable)
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
            cardColor={isCurrentlyIncludedBehavior ? 'green' : (newlyAddedTitles.has(section.title) ? 'purple' : undefined)}
          />
        ))}
      </div>
    );
  };


  const renderPathwayView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
      <PathwayTile
        title="Add screeners"
        description="Add screener question groups to qualify your respondents."
        Icon={Repeat}
        onClick={() => {
          setAddTabContentView('section_picker');
          setAddFilter('screeners');
          setActiveContentEditorTab('addMore');
        }}
      />
      <PathwayTile
        title="Add from this template"
        description={`Extend your survey with additional questions that are tailored to the \"${activeTemplateTitle}\" template.`}
        Icon={PlusCircle}
        onClick={() => {
          setAddTabContentView('section_picker');
          setAddFilter('content');
          setActiveContentEditorTab('addMore');
        }}
      />
      <PathwayTile
        title="Add from other templates"
        description="Mix and match question groups from our other research templates (e.g., Shopper & purchases, Brand)."
        Icon={Puzzle}
        onClick={() => {
          setAddTabContentView('section_picker');
          setAddFilter('content');
          setActiveContentEditorTab('addMore');
        }}
      />
    </div>
  );

  const getAvailableSections = () => {
    if (addFilter === 'screeners') {
      return allAvailableScreenerSections.filter(s => !selectedScreenerTitles.has(s.title));
    } else if (addFilter === 'content') {
      return allAvailableContentSections.filter(s => !selectedContentSectionTitles.has(s.title));
    }
    return [
      ...allAvailableScreenerSections.filter(s => !selectedScreenerTitles.has(s.title)),
      ...allAvailableContentSections.filter(s => !selectedContentSectionTitles.has(s.title)),
    ];
  };

  const renderEditorView = () => {
    const currentTabState = activeContentEditorTab;
    const setTabState = setActiveContentEditorTab;
    const includedTabLabel = `Included in the template (${includedScreeners.length + includedContentSections.length})`;
    const addTabLabel = 'Add question groups';
    const addTabValue = 'addMore';
    const includedViewType = 'included_content';
    const addViewType = 'add_content';

    return (
      <Tabs 
        value={currentTabState} 
        onValueChange={(value) => {
          setTabState(value as any);
          if (value === 'addMore') {
            setAddTabContentView('pathways');
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 auto-rows-fr">
              {includedSectionsForDisplay.map((section) => (
                <SectionDisplayCard
                  key={section.title}
                  section={section}
                  isCurrentlyIncluded={true}
                  onToggleSection={() => handleToggleSection(section.title, allAvailableScreenerSections.some(s => s.title === section.title) ? 'screener' : 'content')}
                  solutionType={solutionType}
                  cardColor={'green'}
                  showQuestions={false}
                  className="min-h-[120px] h-full flex flex-col justify-between"
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value={addTabValue}>
            {addTabContentView === 'pathways' ? (
              renderPathwayView()
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAddTabContentView('pathways')} 
                    className="text-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Add Options
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandAllQuestions(!expandAllQuestions)}
                    className="flex items-center gap-2 text-sm"
                  >
                    {expandAllQuestions ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide Questions
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        View Questions
                      </>
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAvailableSections().map((section) => (
                    <SectionDisplayCard
                      key={section.title}
                      section={section}
                      isCurrentlyIncluded={false}
                      onToggleSection={() => handleToggleSection(section.title, addFilter === 'screeners' ? 'screener' : 'content')}
                      solutionType={solutionType}
                      cardColor={newlyAddedTitles.has(section.title) ? 'purple' : undefined}
                      showQuestions={expandAllQuestions}
                      className="min-h-[120px] h-full flex flex-col justify-between"
                    />
                  ))}
                </div>
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
      {renderEditorView()}
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col p-0">
        {renderContentEditor()}
      </DialogContent>
    </Dialog>
  );
}

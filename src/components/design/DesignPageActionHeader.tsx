
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { HelpCircle, ChevronsDown, ChevronsUp, Edit, CheckCircle, Download, ExternalLink } from 'lucide-react';

interface DesignPageActionHeaderProps {
  pageTitle: string;
  showSurveyControls: boolean;
  isSurveyFullyGenerated: boolean;
  onToggleSurveyGuide: () => void;
  onToggleExpandAll: () => void;
  expandAllSections: boolean;
  onToggleEditMode: () => void;
  isEditModeActive: boolean;
  onDownloadPdf: () => void;
  onDownloadDoc: () => void;
  onOpenAsGoogleDoc: () => void;
}

export function DesignPageActionHeader({
  pageTitle,
  showSurveyControls,
  isSurveyFullyGenerated,
  onToggleSurveyGuide,
  onToggleExpandAll,
  expandAllSections,
  onToggleEditMode,
  isEditModeActive,
  onDownloadPdf,
  onDownloadDoc,
  onOpenAsGoogleDoc,
}: DesignPageActionHeaderProps) {
  return (
    <div className="flex flex-wrap justify-between items-center mb-6 gap-2"> {/* Increased mb for element-gap */}
      <h2 className="text-3xl font-bold text-foreground">{pageTitle}</h2> {/* h2: 28px bold */}
      {showSurveyControls && (
        <div className="flex flex-col sm:flex-row items-center gap-3"> {/* element-gap */}
          <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--soft-lavender-hover-bg))]" onClick={onToggleSurveyGuide}>
            <HelpCircle className="mr-1.5 h-4 w-4" /> Survey Guide
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--soft-lavender-hover-bg))]"
            onClick={onToggleExpandAll}
          >
            {expandAllSections ? <ChevronsUp className="mr-1.5 h-4 w-4" /> : <ChevronsDown className="mr-1.5 h-4 w-4" />}
            {expandAllSections ? "Collapse All" : "Expand All"}
          </Button>
          {isSurveyFullyGenerated && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--soft-lavender-hover-bg))]"
                onClick={onToggleEditMode}
              >
                {isEditModeActive ? <CheckCircle className="mr-1.5 h-4 w-4 text-[hsl(var(--lavender-accent))]" /> : <Edit className="mr-1.5 h-4 w-4" />}
                {isEditModeActive ? "Done Editing" : "Edit"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--soft-lavender-hover-bg))]">
                    <Download className="mr-1.5 h-4 w-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onDownloadPdf}>
                    <Download className="mr-2 h-4 w-4" /> Download as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDownloadDoc}>
                    <Download className="mr-2 h-4 w-4" /> Download as DOC
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onOpenAsGoogleDoc}>
                    <ExternalLink className="mr-2 h-4 w-4" /> Open as Google Doc
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      )}
    </div>
  );
}


import jsPDF from 'jspdf';
import type { SurveySection } from '@/ai/flows/suggest-survey-questions';
import { screenInMarker } from '@/config/surveyConstants';
import { formatQuestionTypeForDisplay } from '@/config/surveyUtils';

export function generateDocContent(title: string, introduction: string, sections: SurveySection[]): string {
  let docContent = `Survey Title: ${title}\n\n`;
  docContent += `Introduction: ${introduction}\n\n`;
  docContent += "----------------------------------------\n\n";

  sections.forEach((section, sectionIndex) => {
    docContent += `Section ${sectionIndex + 1}: ${section.sectionTitle}\n`;
    if (section.sectionDescription) {
      docContent += `${section.sectionDescription}\n`;
    }
    docContent += "\n";

    section.questions.forEach((question, qIndex) => {
      docContent += `Q${qIndex + 1}: ${question.questionText} [${formatQuestionTypeForDisplay(question.questionType)}]\n`;
      if (question.options && question.options.length > 0) {
        question.options.forEach((option, optIndex) => {
          let optionDisplay = `${String.fromCharCode(97 + optIndex)}) ${option.replace(screenInMarker, '').trim()}`;
          if (question.questionType === 'screener' && option.includes(screenInMarker)) {
            optionDisplay += ` ${screenInMarker}`;
          }
          docContent += `  ${optionDisplay}\n`;
        });
      }
      docContent += "\n";
    });
    docContent += "----------------------------------------\n\n";
  });
  return docContent;
}


export function generateSurveyPdf(
  surveyTitle: string,
  surveyIntroduction: string,
  surveySections: SurveySection[]
): void {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  let yPos = 20; // Initial Y position in mm
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15; // Margin in mm
  const contentWidth = doc.internal.pageSize.width - 2 * margin;
  const baseLineHeight = 7; // Approximate line height for 12pt font in mm

  // Helper to add text with wrapping and auto page-breaking
  const addTextWithWrapping = (
    text: string,
    x: number,
    currentY: number,
    options: { fontSize?: number; fontStyle?: string; maxWidth?: number } = {}
  ): number => {
    const fontSize = options.fontSize || 12;
    const fontStyle = options.fontStyle || 'normal';
    const maxWidth = options.maxWidth || contentWidth;

    doc.setFontSize(fontSize);
    doc.setFont(undefined, fontStyle);

    const lines = doc.splitTextToSize(text || '', maxWidth);
    const textBlockHeight = lines.length * (fontSize / 2.8); // Approximate height of the text block

    if (currentY + textBlockHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin; // Reset Y to top margin on new page
    }

    doc.text(lines, x, currentY);
    return currentY + textBlockHeight + (baseLineHeight / 2) ; // Add some spacing after the text block
  };
  

  // Survey Title
  yPos = addTextWithWrapping(surveyTitle, margin, yPos, { fontSize: 18, fontStyle: 'bold' });
  
  // Survey Introduction
  yPos = addTextWithWrapping(surveyIntroduction, margin, yPos, { fontSize: 12 });
  yPos += baseLineHeight / 2; // Extra space after intro

  // Survey Sections
  surveySections.forEach((section, sectionIndex) => {
    if (yPos + baseLineHeight * 3 > pageHeight - margin) { // Check space for section header
        doc.addPage();
        yPos = margin;
    }
    yPos = addTextWithWrapping(
      `Section ${sectionIndex + 1}: ${section.sectionTitle}`,
      margin,
      yPos,
      { fontSize: 16, fontStyle: 'bold' }
    );
    
    if (section.sectionDescription) {
       yPos = addTextWithWrapping(
        section.sectionDescription,
        margin,
        yPos,
        { fontSize: 10, fontStyle: 'italic' }
      );
    }
    yPos += baseLineHeight / 3; // Space after section header/desc

    section.questions.forEach((question, qIndex) => {
      if (yPos + baseLineHeight * 2 > pageHeight - margin) { // Check space for question
        doc.addPage();
        yPos = margin;
      }
      const questionPrefix = `Q${qIndex + 1}: `;
      const questionTypeSuffix = ` [${formatQuestionTypeForDisplay(question.questionType)}]`;
      const fullQuestionLine = `${questionPrefix}${question.questionText}${questionTypeSuffix}`;
      
      yPos = addTextWithWrapping(fullQuestionLine, margin, yPos, { fontSize: 12 });

      if (question.options && question.options.length > 0) {
        yPos += baseLineHeight / 4; // Small space before options
        question.options.forEach((option, optIndex) => {
          if (yPos + baseLineHeight > pageHeight - margin) { // Check space for option
            doc.addPage();
            yPos = margin;
          }
          let optionDisplay = `${String.fromCharCode(97 + optIndex)}) ${option.replace(screenInMarker, '').trim()}`;
          if (question.questionType === 'screener' && option.includes(screenInMarker)) {
            optionDisplay += ` ${screenInMarker}`;
          }
          yPos = addTextWithWrapping(optionDisplay, margin + 7, yPos, { fontSize: 10 }); // Indent options
        });
      }
      yPos += baseLineHeight / 2; // Space after each question
    });
    yPos += baseLineHeight; // Space after each section
  });

  doc.save('survey_document.pdf');
}

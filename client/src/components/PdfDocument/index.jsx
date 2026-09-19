// ============================================
// PdfDocument.jsx - PDF Document Orchestrator
// ============================================
// Renders the correct PDF template based on
// the resume's templateId inside a React-PDF Document.
// ============================================

import { Document, Page } from '@react-pdf/renderer';
import TEMPLATES from '../../constants/templates.js';
import HarvardPdf from '../pdf-templates/HarvardPdf.jsx';
import TechPdf from '../pdf-templates/TechPdf.jsx';
import StandardPdf from '../pdf-templates/StandardPdf.jsx';
import ExecutivePdf from '../pdf-templates/ExecutivePdf.jsx';
import ModernMinimalPdf from '../pdf-templates/ModernMinimalPdf.jsx';

function PdfDocument({ resume }) {
  const template = TEMPLATES.find((t) => t.id === resume.templateId) || TEMPLATES[0];
  const colors = template.colors;
  const { sections } = resume;

  const renderTemplate = () => {
    const props = {
      sections,
      colors,
      targetRole: resume.targetRole,
    };

    switch (resume.templateId) {
      case 'tech':
        return <TechPdf {...props} />;
      case 'standard':
        return <StandardPdf {...props} />;
      case 'executive':
        return <ExecutivePdf {...props} />;
      case 'modern-minimal':
        return <ModernMinimalPdf {...props} />;
      case 'harvard':
      default:
        return <HarvardPdf {...props} />;
    }
  };

  return (
    <Document title={resume.title || 'Resume'} author={sections.personalInfo.fullName || 'User'}>
      <Page size="A4" style={{ backgroundColor: '#ffffff' }}>
        {renderTemplate()}
      </Page>
    </Document>
  );
}

export default PdfDocument;

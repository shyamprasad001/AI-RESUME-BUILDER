// ============================================
// PdfDocument.jsx - PDF Document Orchestrator
// ============================================
// Renders the correct PDF template based on
// the resume's templateId inside a React-PDF Document.
// ============================================

import { Document, Page } from '@react-pdf/renderer';
import TEMPLATES from '../../constants/templates.js';
import ClassicPdf from '../pdf-templates/ClassicPdf.jsx';
import ModernPdf from '../pdf-templates/ModernPdf.jsx';
import CreativePdf from '../pdf-templates/CreativePdf.jsx';
import MinimalPdf from '../pdf-templates/MinimalPdf.jsx';
import ExecutivePdf from '../pdf-templates/ExecutivePdf.jsx';

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
      case 'modern':
        return <ModernPdf {...props} />;
      case 'creative':
        return <CreativePdf {...props} />;
      case 'minimal':
        return <MinimalPdf {...props} />;
      case 'executive':
        return <ExecutivePdf {...props} />;
      case 'classic':
      default:
        return <ClassicPdf {...props} />;
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

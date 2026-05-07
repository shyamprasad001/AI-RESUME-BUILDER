// ============================================
// TemplateSelector.jsx - Template Grid (Sidebar)
// ============================================
// Horizontal scrollable template list for the
// builder sidebar. Using React Context (React: useContext)
// ============================================

import { useContext } from 'react';
import { ResumeContext } from '../../context/ResumeContext.jsx';
import TEMPLATES from '../../constants/templates.js';
import TemplateCard from '../TemplateCard';

function TemplateSelector() {
  const { resume, updateTemplate } = useContext(ResumeContext);

  return (
    <div className="p-md">
      <h3 className="heading-sm mb-xs">Choose a Template</h3>
      <p className="text-muted text-xs mb-md">
        Select a design that fits your target industry and personal style.
      </p>

      <div className="template-selector-grid">
        {TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isActive={resume.templateId === template.id}
            onSelect={() => updateTemplate(template.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default TemplateSelector;

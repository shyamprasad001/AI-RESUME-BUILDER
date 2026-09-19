const TEMPLATES = [
  {
    id: 'harvard',
    name: 'Harvard ATS',
    category: 'professional',
    description: 'The academic and professional gold standard. Strict single-column, highly parsable.',
    colors: { primary: '#000000', accent: '#000000', text: '#000000', light: '#ffffff' },
    font: 'Georgia, serif',
    thumbnail: '/templates/classic.png', // Temporary fallback
  },
  {
    id: 'tech',
    name: 'Tech FAANG',
    category: 'modern',
    description: 'Clean, sans-serif design engineered for software and tech roles.',
    colors: { primary: '#111827', accent: '#2563eb', text: '#374151', light: '#f9fafb' },
    font: "'Inter', sans-serif",
    thumbnail: '/templates/modern.png',
  },
  {
    id: 'standard',
    name: 'Standard ATS',
    category: 'professional',
    description: 'Universally accepted ATS template. Perfect for legacy tracking systems.',
    colors: { primary: '#1f2937', accent: '#1f2937', text: '#111827', light: '#ffffff' },
    font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    thumbnail: '/templates/minimal.png',
  },
  {
    id: 'executive',
    name: 'Executive Leadership',
    category: 'executive',
    description: 'Elegant serif headers focusing on leadership impact and professional summary.',
    colors: { primary: '#1e3a8a', accent: '#1e40af', text: '#1e293b', light: '#f8fafc' },
    font: "'Playfair Display', serif",
    thumbnail: '/templates/executive.png',
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    category: 'minimal',
    description: 'Fresh but fully compliant layout using uppercase tracking and subtle grayscales.',
    colors: { primary: '#171717', accent: '#525252', text: '#262626', light: '#fafafa' },
    font: "'Inter', sans-serif",
    thumbnail: '/templates/creative.png',
  },
];

export default TEMPLATES;

import { render } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock @react-pdf/renderer components
jest.unstable_mockModule('@react-pdf/renderer', () => ({
  Text: ({ children }) => <span>{children}</span>,
  View: ({ children }) => <div>{children}</div>,
  Link: ({ children, src }) => <a href={src}>{children}</a>,
  StyleSheet: { create: (styles) => styles },
}));

const fullResume = {
  personalInfo: {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '123-456-7890',
    location: 'London, UK',
    linkedIn: 'https://linkedin.com/in/janedoe',
    portfolio: 'https://janedoe.com',
  },
  summary: 'A highly skilled software engineer.',
  experience: [
    {
      role: 'Senior Developer',
      company: 'Tech Corp',
      startDate: '2020-01',
      endDate: '2023-01',
      current: false,
      bullets: ['Developed feature A', 'Led team B'],
    },
    {
      role: 'Junior Developer',
      company: '', // Missing company
      startDate: '2019-01',
      endDate: '', // Missing endDate
      current: true,
      bullets: [],
    }
  ],
  education: [
    {
      degree: 'B.S. Computer Science',
      field: 'Engineering',
      institution: 'State University',
      gpa: '3.8',
      startDate: '2015',
      endDate: '2019',
    },
    {
      degree: 'A.S. Science',
      field: '',
      institution: '',
      gpa: '',
      startDate: '',
      endDate: '',
    }
  ],
  skills: {
    technical: ['JavaScript', 'React'],
    soft: ['Leadership', 'Communication'],
    languages: ['English', 'Spanish'],
  },
  projects: [
    {
      name: 'Project Alpha',
      link: 'https://github.com/project-alpha',
      description: 'A great project.',
      technologies: ['React', 'Node'],
      bullets: ['Built the frontend', 'Designed the database'],
    },
    {
      name: 'Project Beta',
      link: '',
      description: '',
      technologies: [],
      bullets: [],
    }
  ],
  certifications: [
    {
      name: 'AWS Certified',
      issuer: 'Amazon',
      date: '2021',
      link: 'https://aws.amazon.com/cert',
    },
    {
      name: 'Basic Cert',
      issuer: '',
      date: '',
      link: '',
    }
  ],
};

const emptyResume = {
  personalInfo: {},
  summary: '',
  experience: [],
  education: [],
  skills: { technical: [], soft: [], languages: [] },
  projects: [],
  certifications: [],
};

const colors = {
  primary: '#000000',
  secondary: '#333333',
  accent: '#0066cc',
  text: '#111111',
  background: '#ffffff',
};

describe('PdfTemplates', () => {
  let ClassicPdf, ModernPdf, CreativePdf, MinimalPdf, ExecutivePdf;
  let templates;

  beforeAll(async () => {
    ClassicPdf = (await import('../../src/components/pdf-templates/ClassicPdf.jsx')).default;
    ModernPdf = (await import('../../src/components/pdf-templates/ModernPdf.jsx')).default;
    CreativePdf = (await import('../../src/components/pdf-templates/CreativePdf.jsx')).default;
    MinimalPdf = (await import('../../src/components/pdf-templates/MinimalPdf.jsx')).default;
    ExecutivePdf = (await import('../../src/components/pdf-templates/ExecutivePdf.jsx')).default;

    templates = [
      { name: 'Classic', Component: ClassicPdf },
      { name: 'Modern', Component: ModernPdf },
      { name: 'Creative', Component: CreativePdf },
      { name: 'Minimal', Component: MinimalPdf },
      { name: 'Executive', Component: ExecutivePdf },
    ];
  });

  it('runs dynamic tests', () => {
    templates.forEach(({ name, Component }) => {
      const { container, getAllByText } = render(
        <Component sections={fullResume} colors={colors} targetRole="Software Engineer" />
      );
      expect(getAllByText(/Jane Doe/i)[0]).toBeInTheDocument();
      expect(getAllByText(/Software Engineer/i)[0]).toBeInTheDocument();
      expect(getAllByText(/Tech Corp/i)[0]).toBeInTheDocument();
      
      const emptyResult = render(
        <Component sections={emptyResume} colors={colors} targetRole="" />
      );
      expect(emptyResult.container).toBeInTheDocument();
    });
  });
});

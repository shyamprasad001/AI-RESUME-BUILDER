import { render } from '@testing-library/react';
import ClassicTemplate from '../../src/components/templates/ClassicTemplate.jsx';
import ModernTemplate from '../../src/components/templates/ModernTemplate.jsx';
import CreativeTemplate from '../../src/components/templates/CreativeTemplate.jsx';
import MinimalTemplate from '../../src/components/templates/MinimalTemplate.jsx';
import ExecutiveTemplate from '../../src/components/templates/ExecutiveTemplate.jsx';

const fullResume = {
  personalInfo: {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    location: 'New York, NY',
    linkedIn: 'https://linkedin.com/in/johndoe',
    portfolio: 'https://johndoe.com',
  },
  summary: 'A highly skilled software engineer with 5 years of experience.',
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
      company: '', // Missing company to hit branch
      startDate: '2019-01',
      endDate: '', // Missing endDate but current is true
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

describe('Templates', () => {
  const templates = [
    { name: 'Classic', Component: ClassicTemplate },
    { name: 'Modern', Component: ModernTemplate },
    { name: 'Creative', Component: CreativeTemplate },
    { name: 'Minimal', Component: MinimalTemplate },
    { name: 'Executive', Component: ExecutiveTemplate },
  ];

  templates.forEach(({ name, Component }) => {
    describe(`${name}Template`, () => {
      it('renders full data without crashing', () => {
        const { getAllByText } = render(
          <Component sections={fullResume} colors={colors} targetRole="Software Engineer" />
        );
        expect(getAllByText(/John Doe/i)[0]).toBeInTheDocument();
        expect(getAllByText(/Software Engineer/i)[0]).toBeInTheDocument();
        expect(getAllByText(/Tech Corp/i)[0]).toBeInTheDocument();
      });

      it('renders empty data without crashing', () => {
        const { container } = render(
          <Component sections={emptyResume} colors={colors} targetRole="" />
        );
        expect(container).toBeInTheDocument();
      });
    });
  });
});

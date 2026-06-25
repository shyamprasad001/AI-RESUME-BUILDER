import { render, screen, act } from '@testing-library/react';
import { useContext } from 'react';
import { ResumeContext, ResumeProvider } from '../../src/context/ResumeContext';

const TestComponent = () => {
  const context = useContext(ResumeContext);
  const { 
    resume, activeSection, activeTab, isSaving, lastSaved, hasChanges,
    updateSection, updateTemplate, updateAtsScore, updateField,
    loadResume, resetResume, getCompletionPercentage,
    setActiveSection, setActiveTab, setIsSaving, setLastSaved, setHasChanges
  } = context;

  return (
    <div>
      <div data-testid="resume-title">{resume.title}</div>
      <div data-testid="active-section">{activeSection}</div>
      <div data-testid="active-tab">{activeTab}</div>
      <div data-testid="has-changes">{hasChanges.toString()}</div>
      <div data-testid="completion">{getCompletionPercentage()}</div>
      <div data-testid="ats-score">{resume.atsScore || 'null'}</div>
      
      <button onClick={() => updateSection('summary', 'New Summary')}>Update Summary</button>
      <button onClick={() => updateTemplate('modern')}>Update Template</button>
      <button onClick={() => updateAtsScore(85)}>Update ATS</button>
      <button onClick={() => updateField('title', 'My Awesome Resume')}>Update Field</button>
      <button onClick={() => loadResume({ ...resume, title: 'Loaded Resume' })}>Load Resume</button>
      <button onClick={() => resetResume()}>Reset</button>
      
      <button onClick={() => setActiveSection('experience')}>Set Section Experience</button>
      <button onClick={() => setActiveTab('preview')}>Set Tab Preview</button>
    </div>
  );
};

describe('ResumeContext', () => {
  it('should initialize with default values', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );

    expect(screen.getByTestId('resume-title').textContent).toBe('Untitled Resume');
    expect(screen.getByTestId('active-section').textContent).toBe('personalInfo');
    expect(screen.getByTestId('active-tab').textContent).toBe('sections');
    expect(screen.getByTestId('has-changes').textContent).toBe('false');
    expect(screen.getByTestId('ats-score').textContent).toBe('null');
    expect(screen.getByTestId('completion').textContent).toBe('0'); // initial state has nothing filled
  });

  it('should update section and set hasChanges to true', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );

    act(() => {
      screen.getByText('Update Summary').click();
    });

    expect(screen.getByTestId('has-changes').textContent).toBe('true');
    // We can also verify completion percentage goes up since summary is now filled
    expect(Number(screen.getByTestId('completion').textContent)).toBeGreaterThan(0);
  });

  it('should update template and set hasChanges to true', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );

    act(() => {
      screen.getByText('Update Template').click();
    });

    expect(screen.getByTestId('has-changes').textContent).toBe('true');
  });

  it('should update ATS score without setting hasChanges to true directly? Actually, wait, updateAtsScore just updates resume.', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );

    act(() => {
      screen.getByText('Update ATS').click();
    });

    expect(screen.getByTestId('ats-score').textContent).toBe('85');
    // updateAtsScore does not explicitly set hasChanges=true in context, let's verify
    expect(screen.getByTestId('has-changes').textContent).toBe('false');
  });

  it('should update arbitrary field and set hasChanges to true', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );

    act(() => {
      screen.getByText('Update Field').click();
    });

    expect(screen.getByTestId('resume-title').textContent).toBe('My Awesome Resume');
    expect(screen.getByTestId('has-changes').textContent).toBe('true');
  });

  it('should load resume and reset hasChanges', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );

    act(() => {
      screen.getByText('Update Field').click(); // dirties state
    });
    expect(screen.getByTestId('has-changes').textContent).toBe('true');

    act(() => {
      screen.getByText('Load Resume').click();
    });

    expect(screen.getByTestId('resume-title').textContent).toBe('Loaded Resume');
    expect(screen.getByTestId('has-changes').textContent).toBe('false');
  });

  it('should reset resume to initial state', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );

    act(() => {
      screen.getByText('Update Field').click();
    });

    act(() => {
      screen.getByText('Reset').click();
    });

    expect(screen.getByTestId('resume-title').textContent).toBe('Untitled Resume');
    expect(screen.getByTestId('has-changes').textContent).toBe('false');
  });

  it('should allow setting active section and active tab', () => {
    render(
      <ResumeProvider>
        <TestComponent />
      </ResumeProvider>
    );

    act(() => {
      screen.getByText('Set Section Experience').click();
      screen.getByText('Set Tab Preview').click();
    });

    expect(screen.getByTestId('active-section').textContent).toBe('experience');
    expect(screen.getByTestId('active-tab').textContent).toBe('preview');
  });
});

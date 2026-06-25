import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import VersionList from '../../src/components/VersionList/index.jsx';

describe('VersionList', () => {
  it('renders a list of VersionCards', () => {
    const versions = [
      { _id: 'v1', label: 'Version 1', versionNumber: 1 },
      { _id: 'v2', label: 'Version 2', versionNumber: 2 }
    ];
    
    render(<VersionList versions={versions} resumeId="123" onRestore={jest.fn()} onDelete={jest.fn()} />);
    
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('v1')).toBeInTheDocument();
    
    expect(screen.getByText('Version 2')).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();
  });

  it('renders empty when no versions', () => {
    const { container } = render(<VersionList versions={[]} resumeId="123" onRestore={jest.fn()} onDelete={jest.fn()} />);
    expect(container.querySelector('.grid-3')).toBeEmptyDOMElement();
  });
});

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.unstable_mockModule('../../src/components/Navbar', () => ({ default: () => <nav data-testid="navbar">Navbar</nav> }));
jest.unstable_mockModule('react-hot-toast', () => ({ default: { error: jest.fn(), success: jest.fn() } }));
jest.unstable_mockModule('../../src/services/resumeService.js', () => ({
  getVersions: jest.fn(),
  saveVersion: jest.fn(),
  restoreVersion: jest.fn(),
  deleteVersion: jest.fn(),
}));

describe('VersionsPage', () => {
  let VersionsPageComp, resumeService, toast;

  beforeAll(async () => {
    VersionsPageComp = (await import('../../src/pages/VersionsPage/index.jsx')).default;
    resumeService = await import('../../src/services/resumeService.js');
    toast = (await import('react-hot-toast')).default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter initialEntries={['/versions/123']}>
        <Routes>
          <Route path="/versions/:id" element={<VersionsPageComp />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state initially', async () => {
    resumeService.getVersions.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter();
    
    expect(screen.getByText('Version History')).toBeInTheDocument();
  });

  it('renders empty state if no versions', async () => {
    resumeService.getVersions.mockResolvedValueOnce([]);

    await act(async () => {
      renderWithRouter();
    });

    expect(screen.getByText('No versions yet')).toBeInTheDocument();
  });

  it('renders versions list', async () => {
    const mockVersions = [
      { _id: 'v1', label: 'V1', createdAt: '2023-01-01T12:00:00.000Z' },
      { _id: 'v2', label: 'V2', createdAt: '2023-01-02T12:00:00.000Z' }
    ];
    resumeService.getVersions.mockResolvedValueOnce(mockVersions);

    await act(async () => {
      renderWithRouter();
    });

    expect(screen.getByText('V1')).toBeInTheDocument();
    expect(screen.getByText('V2')).toBeInTheDocument();
  });

  it('handles fetch error', async () => {
    resumeService.getVersions.mockRejectedValueOnce(new Error('Failed'));

    await act(async () => {
      renderWithRouter();
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to load versions');
  });

  it('opens and closes save prompt', async () => {
    resumeService.getVersions.mockResolvedValueOnce([]);

    await act(async () => {
      renderWithRouter();
    });

    fireEvent.click(screen.getByText('Save Current Version'));
    
    expect(screen.getByPlaceholderText('e.g., Before AI review, Final draft...')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByPlaceholderText('e.g., Before AI review, Final draft...')).not.toBeInTheDocument();
  });

  it('saves a version', async () => {
    resumeService.getVersions.mockResolvedValueOnce([]);
    resumeService.saveVersion.mockResolvedValueOnce({});
    resumeService.getVersions.mockResolvedValueOnce([{ _id: 'v1', label: 'New Version' }]);

    await act(async () => {
      renderWithRouter();
    });

    fireEvent.click(screen.getByText('Save Current Version'));
    
    const input = screen.getByPlaceholderText('e.g., Before AI review, Final draft...');
    fireEvent.change(input, { target: { value: 'New Version' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(resumeService.saveVersion).toHaveBeenCalledWith('123', 'New Version');
    expect(toast.success).toHaveBeenCalledWith('Version saved successfully');
    expect(resumeService.getVersions).toHaveBeenCalledTimes(2);
  });

  it('handles save error and empty label', async () => {
    resumeService.getVersions.mockResolvedValueOnce([]);
    
    await act(async () => {
      renderWithRouter();
    });

    fireEvent.click(screen.getByText('Save Current Version'));
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(toast.error).toHaveBeenCalledWith('Please enter a version label');

    fireEvent.change(screen.getByPlaceholderText('e.g., Before AI review, Final draft...'), { target: { value: 'Err' } });
    resumeService.saveVersion.mockRejectedValueOnce(new Error('Failed'));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to save version');
  });

  it('handles restore and delete from VersionList', async () => {
    const mockVersions = [
      { _id: 'v1', label: 'V1', createdAt: '2023-01-01T12:00:00.000Z' }
    ];
    resumeService.getVersions.mockResolvedValueOnce(mockVersions);
    resumeService.restoreVersion.mockResolvedValueOnce({});
    resumeService.deleteVersion.mockResolvedValueOnce({});

    await act(async () => {
      renderWithRouter();
    });

    const restoreBtn = screen.getByText('Restore');
    await act(async () => {
      fireEvent.click(restoreBtn);
    });

    expect(resumeService.restoreVersion).toHaveBeenCalledWith('123', 'v1');
    expect(toast.success).toHaveBeenCalledWith('Version restored successfully');

    const deleteBtn = screen.getByTestId('delete-version-v1');
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    expect(resumeService.deleteVersion).toHaveBeenCalledWith('123', 'v1');
    expect(toast.success).toHaveBeenCalledWith('Version deleted');
  });

  it('handles restore and delete errors', async () => {
    const mockVersions = [
      { _id: 'v1', label: 'V1', createdAt: '2023-01-01T12:00:00.000Z' }
    ];
    resumeService.getVersions.mockResolvedValueOnce(mockVersions);
    resumeService.restoreVersion.mockRejectedValueOnce(new Error('Restore error'));
    resumeService.deleteVersion.mockRejectedValueOnce(new Error('Delete error'));

    await act(async () => {
      renderWithRouter();
    });

    const restoreBtn = screen.getByText('Restore');
    await act(async () => {
      fireEvent.click(restoreBtn);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to restore version');

    const deleteBtn = screen.getByTestId('delete-version-v1');
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to delete version');
  });
});

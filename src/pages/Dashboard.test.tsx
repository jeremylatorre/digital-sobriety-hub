import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import { AssessmentService } from '@/core/services/AssessmentService';
import { BrowserRouter } from 'react-router-dom';

// Mock AuthContext
const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
};

const mockLogout = vi.fn();

vi.mock('@/contexts/AuthContext', async () => {
    const actual = await vi.importActual('@/contexts/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            user: mockUser,
            loading: false,
            logout: mockLogout,
        }),
    };
});

// Mock AssessmentService
vi.mock('@/core/services/AssessmentService', () => ({
    AssessmentService: {
        getAssessments: vi.fn(),
        deleteAssessment: vi.fn(),
    },
}));

// Mock Toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockAssessments = [
    {
        id: '1',
        projectName: 'Test Project',
        projectDescription: 'Description',
        completed: false,
        level: 'essential',
        updatedAt: new Date().toISOString(),
        score: { complianceRate: 80 },
    },
];

const renderDashboard = () => {
    return render(
        <BrowserRouter>
            <Dashboard />
        </BrowserRouter>
    );
};

describe('Dashboard Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (AssessmentService.getAssessments as any).mockResolvedValue(mockAssessments);
    });

    it('renders assessments', async () => {
        renderDashboard();
        await waitFor(() => {
            expect(screen.getByText('Test Project')).toBeInTheDocument();
        });
    });

    it('opens delete confirmation dialog', async () => {
        renderDashboard();
        await waitFor(() => {
            expect(screen.getByText('Test Project')).toBeInTheDocument();
        });

        const deleteButton = screen.getByText(/Supprimer/i);
        fireEvent.click(deleteButton);

        expect(screen.getByText(/Supprimer l'évaluation \?/i)).toBeInTheDocument();
    });

    it('calls deleteAssessment on confirmation', async () => {
        (AssessmentService.deleteAssessment as any).mockResolvedValue(undefined);
        renderDashboard();
        await waitFor(() => {
            expect(screen.getByText('Test Project')).toBeInTheDocument();
        });

        // Open dialog
        const deleteButton = screen.getByText(/Supprimer/i);
        fireEvent.click(deleteButton);

        // Confirm delete (need to find the button in the dialog)
        // The dialog button text is "Supprimer" as well, so we might need to be specific
        // or use getAllByText. The dialog action usually has a specific class or we can use the text.
        // In the dialog: <AlertDialogAction ...>Supprimer</AlertDialogAction>

        // Since there are multiple "Supprimer" buttons (one on card, one in dialog),
        // we should look for the one in the dialog.
        // However, `screen.getByText` might fail if multiple.
        // Let's use `within` or `getAllByText`.

        const confirmButton = screen.getAllByText('Supprimer')[1]; // Assuming 2nd one is in dialog
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(AssessmentService.deleteAssessment).toHaveBeenCalledWith('1');
        });
    });
});

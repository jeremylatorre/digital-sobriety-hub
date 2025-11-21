import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AssessmentForm } from './AssessmentForm';
import { Referential } from '@/core/domain/Referential';
import { CriterionResponse } from '@/core/domain/Criterion';

const mockReferential: Referential = {
    id: 'test-ref',
    name: 'Test Referential',
    version: '1.0',
    description: 'Test',
    lastUpdate: '2024-01-01',
    source: 'test',
    themes: [
        { id: 'theme1', name: 'Theme 1', description: 'First theme' },
        { id: 'theme2', name: 'Theme 2', description: 'Second theme' }
    ],
    criteria: [
        {
            id: 'crit1',
            number: '1',
            title: 'Criterion 1',
            description: 'First criterion',
            theme: 'theme1',
            level: 'essential',
            objective: 'Test objective',
            implementation: 'Test implementation',
            verification: 'Test verification',
            resources: []
        },
        {
            id: 'crit2',
            number: '2',
            title: 'Criterion 2',
            description: 'Second criterion',
            theme: 'theme1',
            level: 'essential',
            objective: 'Test objective',
            implementation: 'Test implementation',
            verification: 'Test verification',
            resources: []
        },
        {
            id: 'crit3',
            number: '3',
            title: 'Criterion 3',
            description: 'Third criterion',
            theme: 'theme2',
            level: 'essential',
            objective: 'Test objective',
            implementation: 'Test implementation',
            verification: 'Test verification',
            resources: []
        }
    ]
};

describe('AssessmentForm - Navigation Bug Regression Tests', () => {
    let mockOnResponseUpdate: ReturnType<typeof vi.fn>;
    let mockOnProgressUpdate: ReturnType<typeof vi.fn>;
    let mockOnComplete: ReturnType<typeof vi.fn>;
    let mockResponses: CriterionResponse[];

    beforeEach(() => {
        mockOnResponseUpdate = vi.fn();
        mockOnProgressUpdate = vi.fn();
        mockOnComplete = vi.fn();
        mockResponses = [
            { criterionId: 'crit1', status: 'pending' },
            { criterionId: 'crit2', status: 'pending' },
            { criterionId: 'crit3', status: 'pending' }
        ];
    });

    it('should NOT reset to first question after clicking Next', async () => {
        const user = userEvent.setup();

        render(
            <AssessmentForm
                referential={mockReferential}
                responses={mockResponses}
                onResponseUpdate={mockOnResponseUpdate}
                onProgressUpdate={mockOnProgressUpdate}
                onComplete={mockOnComplete}
                level="essential"
            />
        );

        // Wait for first criterion to load
        await waitFor(() => {
            expect(screen.getByText('Criterion 1')).toBeInTheDocument();
        });

        // Click "Suivant" button
        const nextButton = screen.getByRole('button', { name: /suivant/i });
        await user.click(nextButton);

        // Should now show second criterion
        await waitFor(() => {
            expect(screen.getByText('Criterion 2')).toBeInTheDocument();
        });

        // Critical: Should NOT go back to first criterion
        expect(screen.queryByText('Criterion 1')).not.toBeInTheDocument();
    });

    it('should NOT reset position when initialTheme/initialIndex are provided', async () => {
        const user = userEvent.setup();

        render(
            <AssessmentForm
                referential={mockReferential}
                responses={mockResponses}
                initialTheme="theme1"
                initialIndex={0}
                onResponseUpdate={mockOnResponseUpdate}
                onProgressUpdate={mockOnProgressUpdate}
                onComplete={mockOnComplete}
                level="essential"
            />
        );

        // Wait for initialization to first criterion
        await waitFor(() => {
            expect(screen.getByText('Criterion 1')).toBeInTheDocument();
        });

        // Navigate to next question
        await user.click(screen.getByRole('button', { name: /suivant/i }));

        await waitFor(() => {
            expect(screen.getByText('Criterion 2')).toBeInTheDocument();
        });

        // Wait to ensure no reset happens
        await new Promise(resolve => setTimeout(resolve, 200));

        // Should still be on second criterion (not reset to initialIndex)
        expect(screen.getByText('Criterion 2')).toBeInTheDocument();
        expect(screen.queryByText('Criterion 1')).not.toBeInTheDocument();
    });

    it('should call onProgressUpdate only once per navigation (no infinite loop)', async () => {
        const user = userEvent.setup();

        render(
            <AssessmentForm
                referential={mockReferential}
                responses={mockResponses}
                onResponseUpdate={mockOnResponseUpdate}
                onProgressUpdate={mockOnProgressUpdate}
                onComplete={mockOnComplete}
                level="essential"
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Criterion 1')).toBeInTheDocument();
        });

        // Clear initialization calls
        mockOnProgressUpdate.mockClear();

        // Navigate to next question
        await user.click(screen.getByRole('button', { name: /suivant/i }));

        await waitFor(() => {
            expect(screen.getByText('Criterion 2')).toBeInTheDocument();
        });

        // Wait to ensure no additional calls
        await new Promise(resolve => setTimeout(resolve, 300));

        // Should have been called exactly once for the navigation
        expect(mockOnProgressUpdate).toHaveBeenCalledTimes(1);
        expect(mockOnProgressUpdate).toHaveBeenCalledWith('theme1', 1);
    });

    it('should not cause infinite re-renders', async () => {
        let renderCount = 0;

        const TestWrapper = () => {
            renderCount++;
            return (
                <AssessmentForm
                    referential={mockReferential}
                    responses={mockResponses}
                    onResponseUpdate={mockOnResponseUpdate}
                    onProgressUpdate={mockOnProgressUpdate}
                    onComplete={mockOnComplete}
                    level="essential"
                />
            );
        };

        render(<TestWrapper />);

        await waitFor(() => {
            expect(screen.getByText('Criterion 1')).toBeInTheDocument();
        });

        const initialRenderCount = renderCount;

        // Wait and verify render count doesn't explode
        await new Promise(resolve => setTimeout(resolve, 500));

        // Should not have rendered many more times (allowing for a few React re-renders)
        expect(renderCount).toBeLessThan(initialRenderCount + 5);
    });
});

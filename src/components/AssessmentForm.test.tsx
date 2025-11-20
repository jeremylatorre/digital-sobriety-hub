import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AssessmentForm } from './AssessmentForm';
import { Referential } from '@/core/domain/Referential';
import { CriterionResponse } from '@/core/domain/Criterion';

describe('AssessmentForm', () => {
    const mockReferential: Referential = {
        id: 'test-ref',
        name: 'Test Referential',
        version: '1.0',
        description: 'Test',
        lastUpdate: '2024-01-01',
        source: 'test',
        themes: [
            { id: 'strategy', name: 'Stratégie', description: 'Desc 1' }
        ],
        criteria: [
            {
                id: 'c1',
                number: '1.1',
                title: 'Essential Criterion',
                description: 'Desc',
                level: 'essential',
                theme: 'strategy',
                objective: 'Obj',
                implementation: 'Impl',
                verification: 'Verif',
                resources: []
            },
            {
                id: 'c2',
                number: '1.2',
                title: 'Advanced Criterion',
                description: 'Desc',
                level: 'advanced',
                theme: 'strategy',
                objective: 'Obj',
                implementation: 'Impl',
                verification: 'Verif',
                resources: []
            }
        ]
    };

    const mockResponses: CriterionResponse[] = [
        { criterionId: 'c1', status: 'pending' },
        { criterionId: 'c2', status: 'pending' }
    ];

    const mockOnResponseUpdate = vi.fn();
    const mockOnComplete = vi.fn();

    it('should render the form with the first criterion after selecting a theme', () => {
        render(
            <AssessmentForm
                referential={mockReferential}
                responses={mockResponses}
                onResponseUpdate={mockOnResponseUpdate}
                onComplete={mockOnComplete}
            />
        );

        const themeButton = screen.getByText('Stratégie');
        fireEvent.click(themeButton);

        expect(screen.getByText('Essential Criterion')).toBeInTheDocument();
    });

    it('should filter criteria based on selected level', async () => {
        render(
            <AssessmentForm
                referential={mockReferential}
                responses={mockResponses}
                onResponseUpdate={mockOnResponseUpdate}
                onComplete={mockOnComplete}
            />
        );

        // Open select
        const selectTrigger = screen.getByRole('combobox');
        fireEvent.click(selectTrigger);

        // Select Essential level
        const essentialOption = screen.getByText('Essentiel');
        fireEvent.click(essentialOption);

        // Select theme
        const themeButton = screen.getByText('Stratégie');
        fireEvent.click(themeButton);

        // Should show essential criterion
        expect(screen.getByText('Essential Criterion')).toBeInTheDocument();

        // Should NOT be able to navigate to advanced criterion (Next button should finish theme)
        const nextButton = screen.getByText('Terminer le thème');
        expect(nextButton).toBeInTheDocument();
    });

    it('should show theme summary after completing a theme', () => {
        render(
            <AssessmentForm
                referential={mockReferential}
                responses={mockResponses}
                onResponseUpdate={mockOnResponseUpdate}
                onComplete={mockOnComplete}
            />
        );

        // Select theme (Advanced default)
        const themeButton = screen.getByText('Stratégie');
        fireEvent.click(themeButton);

        // Navigate through criteria
        const nextButton = screen.getByText('Suivant');
        fireEvent.click(nextButton);

        // Now at last criterion
        const finishThemeButton = screen.getByText('Terminer le thème');
        fireEvent.click(finishThemeButton);

        // Should show summary
        expect(screen.getByText('Thématique terminée !')).toBeInTheDocument();
        expect(screen.getByText('Score de conformité pour ce thème')).toBeInTheDocument();
    });

    it('should call onResponseUpdate when a status is selected', () => {
        render(
            <AssessmentForm
                referential={mockReferential}
                responses={mockResponses}
                onResponseUpdate={mockOnResponseUpdate}
                onComplete={mockOnComplete}
            />
        );

        const themeButton = screen.getByText('Stratégie');
        fireEvent.click(themeButton);

        const compliantRadio = screen.getByLabelText('Conforme');
        fireEvent.click(compliantRadio);

        expect(mockOnResponseUpdate).toHaveBeenCalledWith(expect.objectContaining({
            criterionId: 'c1',
            status: 'compliant'
        }));
    });
});

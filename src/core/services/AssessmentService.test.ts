import { describe, it, expect } from 'vitest';
import { AssessmentService } from './AssessmentService';
import { Assessment } from '../domain/Assessment';
import { Referential } from '../domain/Referential';

describe('AssessmentService', () => {
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
                title: 'Criterion 1',
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
                title: 'Criterion 2',
                description: 'Desc',
                level: 'recommended',
                theme: 'strategy',
                objective: 'Obj',
                implementation: 'Impl',
                verification: 'Verif',
                resources: []
            }
        ]
    };

    const mockAssessment: Assessment = {
        id: 'test-assessment',
        referentialId: 'test-ref',
        projectName: 'Test Project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: false,
        responses: [
            { criterionId: 'c1', status: 'compliant' },
            { criterionId: 'c2', status: 'non-compliant' }
        ]
    };

    describe('calculateScore', () => {
        it('should calculate correct compliance rate', () => {
            const score = AssessmentService.calculateScore(mockAssessment, mockReferential);
            expect(score.totalCriteria).toBe(2);
            expect(score.compliant).toBe(1);
            expect(score.nonCompliant).toBe(1);
            expect(score.complianceRate).toBe(50);
        });

        it('should handle not-applicable responses correctly', () => {
            const assessmentWithNA = {
                ...mockAssessment,
                responses: [
                    { criterionId: 'c1', status: 'compliant' },
                    { criterionId: 'c2', status: 'not-applicable' }
                ]
            } as Assessment;

            const score = AssessmentService.calculateScore(assessmentWithNA, mockReferential);
            expect(score.notApplicable).toBe(1);
            expect(score.complianceRate).toBe(100); // 1 compliant out of 1 applicable
        });
    });

    describe('generateImprovements', () => {
        it('should generate improvements for non-compliant criteria', () => {
            const improvements = AssessmentService.generateImprovements(mockAssessment, mockReferential);
            expect(improvements).toHaveLength(1);
            expect(improvements[0].criterion).toBe('1.2');
            expect(improvements[0].priority).toBe('medium'); // recommended -> medium
        });
    });
});

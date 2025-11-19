import { useState, useEffect } from 'react';
import { Assessment, AssessmentScore } from '@/core/domain/Assessment';
import { Referential } from '@/core/domain/Referential';
import { CriterionResponse } from '@/core/domain/Criterion';
import { AssessmentService } from '@/core/services/AssessmentService';
import { ReferentialService } from '@/core/services/ReferentialService';

export function useAssessment(assessmentId?: string) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [referential, setReferential] = useState<Referential | null>(null);
  const [score, setScore] = useState<AssessmentScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assessmentId) {
      loadAssessment(assessmentId);
    }
  }, [assessmentId]);

  const loadAssessment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const loadedAssessment = AssessmentService.getAssessment(id);
      if (!loadedAssessment) {
        throw new Error('Assessment not found');
      }
      setAssessment(loadedAssessment);
      
      const loadedReferential = await ReferentialService.loadReferential(loadedAssessment.referentialId);
      setReferential(loadedReferential);
      
      const calculatedScore = AssessmentService.calculateScore(loadedAssessment, loadedReferential);
      setScore(calculatedScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const createAssessment = async (referentialId: string, projectName: string, projectDescription?: string) => {
    setLoading(true);
    setError(null);
    try {
      const loadedReferential = await ReferentialService.loadReferential(referentialId);
      setReferential(loadedReferential);

      const newAssessment: Assessment = {
        id: `assessment-${Date.now()}`,
        referentialId,
        projectName,
        projectDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: loadedReferential.criteria.map((criterion) => ({
          criterionId: criterion.id,
          status: 'pending',
        })),
        completed: false,
      };

      AssessmentService.saveAssessment(newAssessment);
      setAssessment(newAssessment);
      
      const calculatedScore = AssessmentService.calculateScore(newAssessment, loadedReferential);
      setScore(calculatedScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  const updateResponse = (response: CriterionResponse) => {
    if (!assessment || !referential) return;

    const updatedResponses = assessment.responses.map((r) =>
      r.criterionId === response.criterionId ? response : r
    );

    const updatedAssessment: Assessment = {
      ...assessment,
      responses: updatedResponses,
      updatedAt: new Date().toISOString(),
    };

    AssessmentService.saveAssessment(updatedAssessment);
    setAssessment(updatedAssessment);
    
    const calculatedScore = AssessmentService.calculateScore(updatedAssessment, referential);
    setScore(calculatedScore);
  };

  const completeAssessment = () => {
    if (!assessment) return;

    const completedAssessment: Assessment = {
      ...assessment,
      completed: true,
      updatedAt: new Date().toISOString(),
    };

    AssessmentService.saveAssessment(completedAssessment);
    setAssessment(completedAssessment);
  };

  const deleteAssessment = (id: string) => {
    AssessmentService.deleteAssessment(id);
  };

  const getImprovements = () => {
    if (!assessment || !referential) return [];
    return AssessmentService.generateImprovements(assessment, referential);
  };

  return {
    assessment,
    referential,
    score,
    loading,
    error,
    createAssessment,
    updateResponse,
    completeAssessment,
    deleteAssessment,
    getImprovements,
  };
}

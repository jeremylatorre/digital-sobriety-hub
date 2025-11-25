import { useState, useEffect } from 'react';
import { Assessment, AssessmentScore } from '@/core/domain/Assessment';
import { Referential } from '@/core/domain/Referential';
import { CriterionResponse } from '@/core/domain/Criterion';
import { AssessmentService } from '@/core/services/AssessmentService';
import { ReferentialService } from '@/core/services/ReferentialService';
import { useAuth } from '@/contexts/AuthContext';

export function useAssessment(assessmentId?: string) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [referential, setReferential] = useState<Referential | null>(null);
  const [score, setScore] = useState<AssessmentScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (assessmentId) {
      loadAssessment(assessmentId);
    }
  }, [assessmentId, isAuthenticated]); // Reload if auth changes

  const loadAssessment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const loadedAssessment = await AssessmentService.getAssessment(id);

      if (!loadedAssessment) {
        throw new Error('Assessment not found');
      }
      setAssessment(loadedAssessment);

      const loadedReferential = await ReferentialService.getReferential(loadedAssessment.referentialId);
      if (!loadedReferential) {
        throw new Error('Referential not found');
      }
      setReferential(loadedReferential);

      const calculatedScore = AssessmentService.calculateScore(loadedAssessment, loadedReferential);
      setScore(calculatedScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const createAssessment = async (referentialId: string, projectName: string, projectDescription?: string, level: 'essential' | 'recommended' | 'advanced' = 'advanced'): Promise<Assessment | null> => {
    setLoading(true);
    setError(null);
    try {
      const loadedReferential = await ReferentialService.getReferential(referentialId);
      if (!loadedReferential) {
        throw new Error('Referential not found');
      }
      setReferential(loadedReferential);

      const initialResponses = loadedReferential.criteria.map((criterion) => ({
        criterionId: criterion.id,
        status: 'pending' as const,
      }));

      // Generate ID: Use UUID for cloud (handled by DB usually, but we need it for optimistic UI or we let DB generate)
      // For simplicity in this hybrid approach:
      // - If auth: we can let the service handle ID generation or we generate a UUID here.
      // - If local: we use 'assessment-' prefix.
      // Ideally AssessmentService.saveAssessment handles the ID if it's new? 
      // Actually AssessmentService.saveAssessment expects an ID.
      // Let's generate a UUID if auth, or timestamp if not.

      const isLocal = !isAuthenticated;
      const id = isLocal ? `assessment-${Date.now()}` : crypto.randomUUID();

      const newAssessment: Assessment = {
        id,
        referentialId,
        projectName,
        projectDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: initialResponses,
        completed: false,
        level,
      };

      const calculatedScore = AssessmentService.calculateScore(newAssessment, loadedReferential);
      newAssessment.score = calculatedScore;
      setScore(calculatedScore);

      await AssessmentService.saveAssessment(newAssessment);

      // Set the assessment state so the form renders
      setAssessment(newAssessment);

      return newAssessment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create assessment';
      setError(errorMessage);
      console.error("Error creating assessment:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateResponse = async (response: CriterionResponse) => {
    if (!assessment || !referential) return;

    const updatedResponses = assessment.responses.map((r) =>
      r.criterionId === response.criterionId ? response : r
    );

    const updatedAssessment: Assessment = {
      ...assessment,
      responses: updatedResponses,
      updatedAt: new Date().toISOString(),
    };

    const calculatedScore = AssessmentService.calculateScore(updatedAssessment, referential);
    updatedAssessment.score = calculatedScore;
    setScore(calculatedScore);
    setAssessment(updatedAssessment);

    // Debounce or fire-and-forget save? 
    // For now, await it to ensure consistency, but UI is optimistic above.
    try {
      await AssessmentService.saveAssessment(updatedAssessment);
    } catch (e) {
      console.error("Failed to save assessment", e);
      // Optionally revert state here
    }
  };

  const updateResponses = async (newResponses: CriterionResponse[]) => {
    if (!assessment || !referential) return;

    const updatedResponses = assessment.responses.map((r) => {
      const newResponse = newResponses.find((nr) => nr.criterionId === r.criterionId);
      return newResponse || r;
    });

    const updatedAssessment: Assessment = {
      ...assessment,
      responses: updatedResponses,
      updatedAt: new Date().toISOString(),
    };

    const calculatedScore = AssessmentService.calculateScore(updatedAssessment, referential);
    updatedAssessment.score = calculatedScore;
    setScore(calculatedScore);
    setAssessment(updatedAssessment);

    try {
      await AssessmentService.saveAssessment(updatedAssessment);
    } catch (e) {
      console.error("Failed to save assessment", e);
    }
  };

  const completeAssessment = async () => {
    if (!assessment) return;

    const completedAssessment: Assessment = {
      ...assessment,
      completed: true,
      updatedAt: new Date().toISOString(),
      score: score || undefined,
    };

    setAssessment(completedAssessment);
    try {
      await AssessmentService.saveAssessment(completedAssessment);
    } catch (e) {
      console.error("Failed to complete assessment", e);
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      await AssessmentService.deleteAssessment(id);
    } catch (e) {
      console.error("Failed to delete assessment", e);
      throw e;
    }
  };

  const getImprovements = () => {
    if (!assessment || !referential) return [];
    return AssessmentService.generateImprovements(assessment, referential);
  };

  const resumeAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const assessments = await AssessmentService.getAssessments();

      // Find latest incomplete
      const lastIncomplete = assessments
        .filter(a => !a.completed)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

      if (lastIncomplete) {
        setAssessment(lastIncomplete);

        const loadedReferential = await ReferentialService.getReferential(lastIncomplete.referentialId);
        if (loadedReferential) {
          setReferential(loadedReferential);
          const calculatedScore = AssessmentService.calculateScore(lastIncomplete, loadedReferential);
          setScore(calculatedScore);
          return true;
        }
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume assessment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (theme: string | null, index: number) => {
    if (!assessment) return;

    const updatedAssessment: Assessment = {
      ...assessment,
      currentTheme: theme || undefined,
      currentIndex: index,
      updatedAt: new Date().toISOString(),
    };

    setAssessment(updatedAssessment);
    try {
      await AssessmentService.saveAssessment(updatedAssessment);
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  return {
    assessment,
    referential,
    score,
    loading,
    error,
    createAssessment,
    updateResponse,
    updateResponses,
    completeAssessment,
    deleteAssessment,
    getImprovements,
    resumeAssessment,
    saveProgress,
  };
}

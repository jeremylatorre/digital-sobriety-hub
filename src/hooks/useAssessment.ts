import { useState, useEffect } from 'react';
import { Assessment, AssessmentScore } from '@/core/domain/Assessment';
import { Referential } from '@/core/domain/Referential';
import { CriterionResponse } from '@/core/domain/Criterion';
import { AssessmentService } from '@/core/services/AssessmentService';
import { ReferentialService } from '@/core/services/ReferentialService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useAssessment(assessmentId?: string) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [referential, setReferential] = useState<Referential | null>(null);
  const [score, setScore] = useState<AssessmentScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const isAuthenticated = !!user;
  const userId = user?.id;

  useEffect(() => {
    if (assessmentId) {
      loadAssessment(assessmentId);
    }
  }, [assessmentId, isAuthenticated]); // Reload if auth changes

  const loadAssessment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      let loadedAssessment: Assessment | null = null;

      // Try to load from Cloud if authenticated and ID looks like a UUID (36 chars)
      if (isAuthenticated && id.length === 36) {
        try {
          const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (data) {
            loadedAssessment = {
              id: data.id,
              referentialId: data.referential_id || 'rgesn-2024',
              projectName: data.project_name,
              projectDescription: data.project_description,
              createdAt: data.created_at,
              updatedAt: data.created_at,
              responses: data.responses || [],
              completed: data.status === 'completed',
              currentTheme: data.current_theme,
              currentIndex: data.current_index,
              level: data.level as 'essential' | 'recommended' | 'advanced'
            };
          }
        } catch (e) {
          console.warn("Failed to load from cloud, trying local", e);
        }
      }

      if (!loadedAssessment) {
        loadedAssessment = AssessmentService.getAssessment(id);
      }

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

      const newAssessment: Assessment = {
        id: `assessment-${Date.now()}`, // Temporary ID for local
        referentialId,
        projectName,
        projectDescription,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: initialResponses,
        completed: false,
        level,
      };

      if (isAuthenticated && userId) {
        // Create in Cloud
        const { data, error } = await supabase
          .from('assessments')
          .insert({
            user_id: userId,
            project_name: projectName,
            project_description: projectDescription,
            referential_id: referentialId,
            responses: initialResponses,
            status: 'draft',
            score: { globalScore: 0 },
            level
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          newAssessment.id = data.id;
          newAssessment.createdAt = data.created_at;
          newAssessment.updatedAt = data.created_at;
        }
      } else {
        // Save Local
        AssessmentService.saveAssessment(newAssessment);
      }

      setAssessment(newAssessment);

      const calculatedScore = AssessmentService.calculateScore(newAssessment, loadedReferential);
      setScore(calculatedScore);

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

  const saveToCloud = async (assessmentToSave: Assessment, scoreToSave?: AssessmentScore) => {
    if (!isAuthenticated || !assessmentToSave.id || assessmentToSave.id.startsWith('assessment-')) return;

    try {
      await supabase
        .from('assessments')
        .update({
          responses: assessmentToSave.responses,
          status: assessmentToSave.completed ? 'completed' : 'draft',
          score: scoreToSave ? { globalScore: scoreToSave.complianceRate } : undefined,
          current_theme: assessmentToSave.currentTheme,
          current_index: assessmentToSave.currentIndex,
          level: assessmentToSave.level
        })
        .eq('id', assessmentToSave.id);
    } catch (e) {
      console.error("Failed to save to cloud", e);
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

    setAssessment(updatedAssessment);
    const calculatedScore = AssessmentService.calculateScore(updatedAssessment, referential);
    setScore(calculatedScore);

    if (isAuthenticated && !assessment.id.startsWith('assessment-')) {
      saveToCloud(updatedAssessment, calculatedScore);
    } else {
      AssessmentService.saveAssessment(updatedAssessment);
    }
  };

  const updateResponses = (newResponses: CriterionResponse[]) => {
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

    setAssessment(updatedAssessment);
    const calculatedScore = AssessmentService.calculateScore(updatedAssessment, referential);
    setScore(calculatedScore);

    if (isAuthenticated && !assessment.id.startsWith('assessment-')) {
      saveToCloud(updatedAssessment, calculatedScore);
    } else {
      AssessmentService.saveAssessment(updatedAssessment);
    }
  };

  const completeAssessment = () => {
    if (!assessment) return;

    const completedAssessment: Assessment = {
      ...assessment,
      completed: true,
      updatedAt: new Date().toISOString(),
    };

    setAssessment(completedAssessment);

    if (isAuthenticated && !assessment.id.startsWith('assessment-')) {
      saveToCloud(completedAssessment, score || undefined);
    } else {
      AssessmentService.saveAssessment(completedAssessment);
    }
  };

  const deleteAssessment = async (id: string) => {
    if (isAuthenticated && !id.startsWith('assessment-')) {
      await supabase.from('assessments').delete().eq('id', id);
    } else {
      AssessmentService.deleteAssessment(id);
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
      let lastIncomplete: Assessment | null = null;

      if (isAuthenticated) {
        // Try to fetch last draft from cloud
        try {
          const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('status', 'draft')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (data) {
            lastIncomplete = {
              id: data.id,
              referentialId: data.referential_id || 'rgesn-2024',
              projectName: data.project_name,
              projectDescription: data.project_description,
              createdAt: data.created_at,
              updatedAt: data.created_at,
              responses: data.responses || [],
              completed: false,
              currentTheme: data.current_theme,
              currentIndex: data.current_index,
              level: data.level as 'essential' | 'recommended' | 'advanced'
            };
          }
        } catch (e) {
          console.error("Failed to fetch draft from cloud", e);
        }
      }

      if (!lastIncomplete) {
        const assessments = AssessmentService.getAssessments();
        lastIncomplete = assessments
          .filter(a => !a.completed)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
      }

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

  const saveProgress = (theme: string | null, index: number) => {
    if (!assessment) return;

    const updatedAssessment: Assessment = {
      ...assessment,
      currentTheme: theme || undefined,
      currentIndex: index,
      updatedAt: new Date().toISOString(),
    };

    setAssessment(updatedAssessment);

    if (isAuthenticated && !assessment.id.startsWith('assessment-')) {
      saveToCloud(updatedAssessment, score || undefined);
    } else {
      AssessmentService.saveAssessment(updatedAssessment);
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

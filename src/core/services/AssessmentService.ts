import { Assessment, AssessmentScore } from '../domain/Assessment';
import { Referential } from '../domain/Referential';
import { supabase } from '@/lib/supabase';

export class AssessmentService {
  private static readonly STORAGE_KEY = 'assessments';

  static async saveAssessment(assessment: Assessment): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;

    if (user && !assessment.id.startsWith('assessment-')) {
      // Cloud Save
      const { error } = await supabase.from('assessments').upsert({
        id: assessment.id,
        user_id: user.id,
        project_name: assessment.projectName,
        project_description: assessment.projectDescription,
        referential_id: assessment.referentialId,
        level: assessment.level,
        status: assessment.completed ? 'completed' : 'draft',
        responses: assessment.responses,
        current_theme: assessment.currentTheme,
        current_index: assessment.currentIndex,
        updated_at: new Date().toISOString(),
        score: assessment.score,
      });

      if (error) throw error;
    } else {
      // Local Save
      const assessments = this.getLocalAssessments();
      const index = assessments.findIndex((a) => a.id === assessment.id);

      if (index >= 0) {
        assessments[index] = assessment;
      } else {
        assessments.push(assessment);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assessments));
    }
  }

  static async getAssessments(): Promise<Assessment[]> {
    const user = (await supabase.auth.getUser()).data.user;

    if (user) {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data.map(this.mapFromDb);
    } else {
      return this.getLocalAssessments();
    }
  }

  static async getAssessment(id: string): Promise<Assessment | null> {
    // If it looks like a local ID (starts with "assessment-"), check local storage first
    if (id.startsWith('assessment-')) {
      const local = this.getLocalAssessments().find((a) => a.id === id);
      return local || null;
    }

    const user = (await supabase.auth.getUser()).data.user;

    if (user) {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return null; // Or throw?
      if (!data) return null;

      return this.mapFromDb(data);
    } else {
      // Fallback to local if not logged in but trying to access a potentially local ID
      // (Though logic above handles "assessment-" prefix)
      return this.getLocalAssessments().find((a) => a.id === id) || null;
    }
  }

  static async deleteAssessment(id: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;

    if (user && !id.startsWith('assessment-')) {
      const { error } = await supabase.from('assessments').delete().eq('id', id);
      if (error) throw error;
    } else {
      const assessments = this.getLocalAssessments().filter((a) => a.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assessments));
    }
  }

  // --- Helpers ---

  private static getLocalAssessments(): Assessment[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private static mapFromDb(data: any): Assessment {
    return {
      id: data.id,
      referentialId: data.referential_id,
      projectName: data.project_name,
      projectDescription: data.project_description,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      responses: data.responses || [],
      completed: data.status === 'completed',
      currentTheme: data.current_theme,
      currentIndex: data.current_index,
      level: data.level as 'essential' | 'recommended' | 'advanced',
      score: data.score,
    };
  }

  static calculateScore(assessment: Assessment, referential: Referential): AssessmentScore {
    const { responses, level: assessmentLevel } = assessment;
    const { criteria } = referential;

    const compliant = responses.filter((r) => r.status === 'compliant').length;
    const nonCompliant = responses.filter((r) => r.status === 'non-compliant').length;
    const notApplicable = responses.filter((r) => r.status === 'not-applicable').length;
    const pending = responses.filter((r) => r.status === 'pending').length;

    const applicableCriteria = responses.length - notApplicable;
    const complianceRate = applicableCriteria > 0 ? (compliant / applicableCriteria) * 100 : 0;

    // Score by level
    const scoreByLevel = {
      essential: { compliant: 0, total: 0 },
      recommended: { compliant: 0, total: 0 },
      advanced: { compliant: 0, total: 0 },
    };

    criteria.forEach((criterion) => {
      const response = responses.find((r) => r.criterionId === criterion.id);
      if (response && response.status !== 'not-applicable') {
        scoreByLevel[criterion.level].total++;
        if (response.status === 'compliant') {
          scoreByLevel[criterion.level].compliant++;
        }
      }
    });

    // Score by theme
    const scoreByTheme: Record<string, { compliant: number; total: number }> = {};

    criteria.forEach((criterion) => {
      const response = responses.find((r) => r.criterionId === criterion.id);
      if (!scoreByTheme[criterion.theme]) {
        scoreByTheme[criterion.theme] = { compliant: 0, total: 0 };
      }
      if (response && response.status !== 'not-applicable') {
        scoreByTheme[criterion.theme].total++;
        if (response.status === 'compliant') {
          scoreByTheme[criterion.theme].compliant++;
        }
      }
    });

    // Calculate level-specific score
    // Filter criteria based on assessment level
    const levelCriteria = criteria.filter((c) => {
      // Light: only essential criteria
      if (assessmentLevel === 'essential') return c.level === 'essential';
      // Full: all criteria
      return true;
    });

    const levelResponses = responses.filter((r) =>
      levelCriteria.some((c) => c.id === r.criterionId)
    );

    const levelCompliant = levelResponses.filter((r) => r.status === 'compliant').length;
    const levelNotApplicable = levelResponses.filter((r) => r.status === 'not-applicable').length;
    const levelApplicable = levelResponses.length - levelNotApplicable;
    const levelComplianceRate = levelApplicable > 0 ? (levelCompliant / levelApplicable) * 100 : 0;

    return {
      totalCriteria: criteria.length,
      compliant,
      nonCompliant,
      notApplicable,
      pending,
      complianceRate,
      levelScore: {
        level: assessmentLevel,
        compliant: levelCompliant,
        total: levelApplicable,
        complianceRate: levelComplianceRate,
      },
      scoreByLevel,
      scoreByTheme,
    };
  }

  static generateImprovements(assessment: Assessment, referential: Referential): {
    criterion: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
  }[] {
    const improvements: {
      criterion: string;
      title: string;
      priority: 'high' | 'medium' | 'low';
      suggestion: string;
    }[] = [];

    assessment.responses.forEach((response) => {
      if (response.status === 'non-compliant') {
        const criterion = referential.criteria.find((c) => c.id === response.criterionId);
        if (criterion) {
          improvements.push({
            criterion: criterion.number,
            title: criterion.title,
            priority: criterion.level === 'essential' ? 'high' : criterion.level === 'recommended' ? 'medium' : 'low',
            suggestion: criterion.implementation,
          });
        }
      }
    });

    return improvements.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
}

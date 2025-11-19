import { Assessment, AssessmentScore } from '../domain/Assessment';
import { Referential } from '../domain/Referential';
import { CriterionResponse } from '../domain/Criterion';

export class AssessmentService {
  private static readonly STORAGE_KEY = 'assessments';

  static saveAssessment(assessment: Assessment): void {
    const assessments = this.getAssessments();
    const index = assessments.findIndex((a) => a.id === assessment.id);
    
    if (index >= 0) {
      assessments[index] = assessment;
    } else {
      assessments.push(assessment);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assessments));
  }

  static getAssessments(): Assessment[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static getAssessment(id: string): Assessment | null {
    const assessments = this.getAssessments();
    return assessments.find((a) => a.id === id) || null;
  }

  static deleteAssessment(id: string): void {
    const assessments = this.getAssessments().filter((a) => a.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assessments));
  }

  static calculateScore(assessment: Assessment, referential: Referential): AssessmentScore {
    const { responses } = assessment;
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

    return {
      totalCriteria: criteria.length,
      compliant,
      nonCompliant,
      notApplicable,
      pending,
      complianceRate,
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

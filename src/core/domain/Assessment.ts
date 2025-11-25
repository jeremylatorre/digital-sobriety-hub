import { CriterionResponse } from './Criterion';

export interface Assessment {
  id: string;
  referentialId: string;
  projectName: string;
  projectDescription?: string;
  createdAt: string;
  updatedAt: string;
  responses: CriterionResponse[];
  completed: boolean;
  currentTheme?: string;
  currentIndex?: number;
  level: 'essential' | 'recommended' | 'advanced';
  score?: AssessmentScore;
}

export interface AssessmentScore {
  totalCriteria: number;
  compliant: number;
  nonCompliant: number;
  notApplicable: number;
  pending: number;
  complianceRate: number; // Percentage
  scoreByLevel: {
    essential: { compliant: number; total: number };
    recommended: { compliant: number; total: number };
    advanced: { compliant: number; total: number };
  };
  scoreByTheme: Record<string, { compliant: number; total: number }>;
}

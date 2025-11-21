export type CriterionLevel = 'essential' | 'recommended' | 'advanced';
export type CriterionStatus = 'compliant' | 'non-compliant' | 'not-applicable' | 'pending';
export type CriterionTheme = 'strategy' | 'specifications' | 'architecture' | 'ux-ui' | 'contents' | 'frontend' | 'backend' | 'hosting' | 'algorithm';

export interface Criterion {
  id: string;
  number: string; // Ex: "1.1", "2.3"
  title: string;
  description: string;
  level: CriterionLevel;
  theme: CriterionTheme;
  objective: string;
  implementation: string;
  verification: string;
  resources?: string[];
  priority?: boolean; // For Quick Assessment mode
}

export interface CriterionResponse {
  criterionId: string;
  status: CriterionStatus;
  comment?: string;
  evidence?: string;
}

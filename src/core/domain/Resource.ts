// Domain entity - Resource
export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  tags: string[];
  type: ResourceType;
  url: string;
  readingTime: string;
  impact: ImpactLevel;
}

export type ResourceCategory = "Guides" | "Outils" | "Cas d'études";

export type ResourceType = "link" | "pdf" | "article";

export type ImpactLevel = "low" | "medium" | "high";

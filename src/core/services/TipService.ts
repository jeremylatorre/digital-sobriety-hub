import { Tip } from "@/core/domain/Tip";

/**
 * Service for fetching tips
 * Phase 1: Static JSON
 * Phase 2+: Can be extended for dynamic tips, user feedback
 */
export class TipService {
  private static instance: TipService;

  private constructor() {}

  public static getInstance(): TipService {
    if (!TipService.instance) {
      TipService.instance = new TipService();
    }
    return TipService.instance;
  }

  async fetchTips(): Promise<Tip[]> {
    try {
      const response = await fetch("/tips.json");
      if (!response.ok) {
        throw new Error("Failed to fetch tips");
      }
      const data = await response.json();
      return data.tips;
    } catch (error) {
      console.error("Error fetching tips:", error);
      return [];
    }
  }

  getRandomTip(tips: Tip[], currentId?: string): Tip | null {
    if (tips.length === 0) return null;
    if (tips.length === 1) return tips[0];

    const availableTips = currentId
      ? tips.filter((tip) => tip.id !== currentId)
      : tips;

    const randomIndex = Math.floor(Math.random() * availableTips.length);
    return availableTips[randomIndex];
  }
}

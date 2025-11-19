import { Referential } from '../domain/Referential';

export class ReferentialService {
  private static readonly BASE_PATH = '/referentials';

  static async loadReferential(referentialId: string): Promise<Referential> {
    try {
      const response = await fetch(`${this.BASE_PATH}/${referentialId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load referential: ${referentialId}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading referential:', error);
      throw error;
    }
  }

  static async listReferentials(): Promise<{ id: string; name: string; version: string }[]> {
    // For now, hardcoded list. Can be replaced with API call
    return [
      {
        id: 'rgesn',
        name: 'RGESN - Référentiel Général d\'Écoconception de Services Numériques',
        version: '2.0 (Mai 2024)',
      },
      // Add more referentials here in the future
    ];
  }
}

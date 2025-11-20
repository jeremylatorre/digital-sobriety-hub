import { Referential } from '../domain/Referential';
import { RGESN_REFERENTIAL } from '@/data/rgesn';

export class ReferentialService {
  static async listReferentials(): Promise<{ id: string; name: string; version: string }[]> {
    // In the future, we can add more referentials to this list
    const referentials = [RGESN_REFERENTIAL];

    return referentials.map(ref => ({
      id: ref.id,
      name: ref.name,
      version: ref.version
    }));
  }

  static async getReferential(id: string): Promise<Referential | null> {
    if (id === 'rgesn') {
      return RGESN_REFERENTIAL;
    }
    return null;
  }
}

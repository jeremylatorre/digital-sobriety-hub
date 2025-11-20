import { describe, it, expect } from 'vitest';
import { ReferentialService } from './ReferentialService';

describe('ReferentialService', () => {
    describe('listReferentials', () => {
        it('should return the list of available referentials', async () => {
            const referentials = await ReferentialService.listReferentials();
            expect(referentials).toHaveLength(1);
            expect(referentials[0].id).toBe('rgesn');
        });
    });

    describe('getReferential', () => {
        it('should return the RGESN referential when requested', async () => {
            const referential = await ReferentialService.getReferential('rgesn');
            expect(referential).not.toBeNull();
            expect(referential?.id).toBe('rgesn');
            expect(referential?.criteria.length).toBeGreaterThan(0);
        });

        it('should return null for unknown referential', async () => {
            const referential = await ReferentialService.getReferential('unknown');
            expect(referential).toBeNull();
        });
    });
});

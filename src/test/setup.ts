import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
            signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
            signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
        }),
    },
}));

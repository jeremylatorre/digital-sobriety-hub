import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Profile from './Profile';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            updateUser: vi.fn(),
            signOut: vi.fn(),
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        rpc: vi.fn(),
    },
}));

// Mock AuthContext
const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { full_name: 'Test User' },
};

const mockLogout = vi.fn();

vi.mock('@/contexts/AuthContext', async () => {
    const actual = await vi.importActual('@/contexts/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            user: mockUser,
            loading: false,
            logout: mockLogout,
        }),
    };
});

// Mock Toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const renderProfile = () => {
    return render(
        <BrowserRouter>
            <Profile />
        </BrowserRouter>
    );
};

describe('Profile Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders profile information', () => {
        renderProfile();
        expect(screen.getByLabelText(/Nom complet/i)).toHaveValue('Test User');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('test@example.com');
    });

    it('updates profile name', async () => {
        (supabase.auth.updateUser as any).mockResolvedValue({ error: null });
        renderProfile();

        const nameInput = screen.getByLabelText(/Nom complet/i);
        fireEvent.change(nameInput, { target: { value: 'New Name' } });

        const saveButton = screen.getByText(/Enregistrer/i);
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(supabase.auth.updateUser).toHaveBeenCalledWith({
                data: { full_name: 'New Name' },
            });
        });
    });

    it('opens delete confirmation dialog', () => {
        renderProfile();
        const deleteButton = screen.getByText(/Supprimer mon compte/i);
        fireEvent.click(deleteButton);

        expect(screen.getByText(/Êtes-vous absolument sûr/i)).toBeInTheDocument();
    });

    it('calls delete_user RPC on confirmation', async () => {
        (supabase.rpc as any).mockResolvedValue({ error: null });
        renderProfile();

        // Open dialog
        const deleteButton = screen.getByText(/Supprimer mon compte/i);
        fireEvent.click(deleteButton);

        // Confirm delete
        const confirmButton = screen.getByText(/Supprimer définitivement/i);
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(supabase.rpc).toHaveBeenCalledWith('delete_user');
            expect(mockLogout).toHaveBeenCalled();
        });
    });
});

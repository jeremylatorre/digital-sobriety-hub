import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Register from './Register';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Mock toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock useNavigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

describe('Register Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders registration form', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        expect(screen.getByRole('heading', { name: /inscription/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^confirmer le mot de passe$/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();
    });

    it('shows error when passwords do not match', async () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/^mot de passe$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/^confirmer le mot de passe$/i), { target: { value: 'password456' } });
        fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Les mots de passe ne correspondent pas');
        });
        expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('calls signUp and shows success message on valid submission', async () => {
        (supabase.auth.signUp as any).mockResolvedValue({ error: null });

        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/^mot de passe$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/^confirmer le mot de passe$/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

        await waitFor(() => {
            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(toast.success).toHaveBeenCalledWith('Compte créé avec succès');
            expect(screen.getByText(/compte créé !/i)).toBeInTheDocument();
            expect(screen.getByText(/un email de confirmation a été envoyé/i)).toBeInTheDocument();
        });
    });

    it('shows error message on registration failure', async () => {
        (supabase.auth.signUp as any).mockResolvedValue({ error: { message: 'User already registered' } });

        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'existing@example.com' } });
        fireEvent.change(screen.getByLabelText(/^mot de passe$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/^confirmer le mot de passe$/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Erreur lors de l'inscription"));
        });
    });
});

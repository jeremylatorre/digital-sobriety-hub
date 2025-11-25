import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from './Login';
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

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    it('calls signInWithPassword and redirects on success', async () => {
        (supabase.auth.signInWithPassword as any).mockResolvedValue({ error: null });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/^mot de passe$/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

        await waitFor(() => {
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(toast.success).toHaveBeenCalledWith('Connexion réussie');
            expect(navigateMock).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('shows specific error when email is not confirmed', async () => {
        (supabase.auth.signInWithPassword as any).mockResolvedValue({ error: { message: 'Email not confirmed' } });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'unconfirmed@example.com' } });
        fireEvent.change(screen.getByLabelText(/^mot de passe$/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Veuillez confirmer votre email avant de vous connecter.');
        });
    });

    it('shows generic error on other failures', async () => {
        (supabase.auth.signInWithPassword as any).mockResolvedValue({ error: { message: 'Invalid login credentials' } });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByLabelText(/^mot de passe$/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Erreur de connexion. Vérifiez vos identifiants.');
        });
    });
});

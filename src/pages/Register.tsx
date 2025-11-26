import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    // CAPTCHA is only required when site key is configured (production)
    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    const isCaptchaEnabled = !!turnstileSiteKey;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        // Check CAPTCHA if enabled
        if (isCaptchaEnabled && !captchaToken) {
            toast.error('Veuillez compléter la vérification CAPTCHA');
            return;
        }

        setLoading(true);

        try {
            const signUpOptions: any = {
                email,
                password,
            };

            // Include CAPTCHA token if enabled
            if (isCaptchaEnabled && captchaToken) {
                signUpOptions.options = {
                    captchaToken
                };
            }

            const { error } = await supabase.auth.signUp(signUpOptions);

            if (error) throw error;

            setSuccess(true);
            toast.success('Compte créé avec succès');
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'inscription. L'email est peut-être déjà utilisé.");
            // Reset CAPTCHA on error
            setCaptchaToken(null);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                    <Card className="w-full max-w-md text-center">
                        <CardHeader>
                            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <CardTitle>Compte créé !</CardTitle>
                            <CardDescription>
                                Un email de confirmation a été envoyé à <strong>{email}</strong>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Veuillez cliquer sur le lien dans l'email pour activer votre compte avant de vous connecter.
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button onClick={() => navigate('/login')} className="w-full">
                                Retour à la connexion
                            </Button>
                        </CardFooter>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Inscription</CardTitle>
                        <CardDescription>Créez votre compte pour sauvegarder vos évaluations</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleRegister}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="exemple@email.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="passwordConfirm">Confirmer le mot de passe</Label>
                                <Input
                                    id="passwordConfirm"
                                    type="password"
                                    required
                                    minLength={8}
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Création du compte...' : "S'inscrire"}
                            </Button>
                            <p className="text-sm text-muted-foreground text-center">
                                Déjà un compte ?{' '}
                                <Link to="/login" className="text-primary hover:underline">
                                    Se connecter
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </main>
            <Footer />
        </div>
    );
}

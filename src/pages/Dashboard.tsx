import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, ExternalLink, PlayCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AssessmentRecord {
    id: string;
    project_name: string;
    project_description: string;
    created_at: string;
    updated_at?: string;
    status: 'draft' | 'completed';
    score?: {
        globalScore: number;
    };
}

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadAssessments();
        }
    }, [user]);

    const loadAssessments = async () => {
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setAssessments(data as unknown as AssessmentRecord[]);
        } catch (error) {
            console.error('Error loading assessments:', error);
            toast.error('Impossible de charger vos évaluations.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) return;

        try {
            const { error } = await supabase
                .from('assessments')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setAssessments(assessments.filter(a => a.id !== id));
            toast.success('Évaluation supprimée.');
        } catch (error) {
            console.error('Error deleting assessment:', error);
            toast.error('Erreur lors de la suppression.');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Tableau de bord</h1>
                        <p className="text-muted-foreground mt-1">
                            Bienvenue, {user?.email}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => navigate('/assessment')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle évaluation
                        </Button>
                        <Button variant="outline" onClick={handleLogout}>
                            Se déconnecter
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : assessments.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="mb-4 flex justify-center">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <ExternalLink className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Aucune évaluation</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Vous n'avez pas encore réalisé d'évaluation. Commencez dès maintenant pour mesurer l'empreinte de votre service numérique.
                            </p>
                            <Button onClick={() => navigate('/assessment')}>
                                Commencer une évaluation
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {assessments.map((assessment) => (
                            <Card key={assessment.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="truncate pr-2" title={assessment.project_name}>
                                            {assessment.project_name}
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Badge variant={assessment.status === 'completed' ? 'default' : 'secondary'}>
                                                {assessment.status === 'completed' ? 'Terminé' : 'Brouillon'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                            {(assessment as any).level === 'essential' ? 'Light' :
                                                (assessment as any).level === 'recommended' ? 'Standard' : 'Full'}
                                        </Badge>
                                        <CardDescription className="line-clamp-2 flex-1">
                                            {assessment.project_description || "Pas de description"}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Dernière modification</span>
                                            <span>{format(new Date(assessment.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                                        </div>
                                        {assessment.score && (
                                            <div className="flex justify-between font-medium">
                                                <span>Score global</span>
                                                <span className={
                                                    assessment.score.globalScore >= 80 ? "text-green-600" :
                                                        assessment.score.globalScore >= 50 ? "text-orange-600" : "text-red-600"
                                                }>
                                                    {Math.round(assessment.score.globalScore)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between pt-4 border-t">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(assessment.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Supprimer
                                    </Button>
                                    {assessment.status === 'draft' ? (
                                        <Button
                                            size="sm"
                                            onClick={() => navigate(`/assessment?id=${assessment.id}`)}
                                        >
                                            <PlayCircle className="h-4 w-4 mr-2" />
                                            Reprendre
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/assessment?id=${assessment.id}`)}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Voir résultats
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AssessmentService } from '@/core/services/AssessmentService';
import { Assessment } from '@/core/domain/Assessment';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadAssessments();
        }
    }, [user]);

    const loadAssessments = async () => {
        try {
            const data = await AssessmentService.getAssessments();
            setAssessments(data);
        } catch (error) {
            console.error('Error loading assessments:', error);
            toast.error('Impossible de charger vos évaluations.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await AssessmentService.deleteAssessment(id);
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

    const getGlobalScore = (assessment: Assessment) => {
        // Since AssessmentService.getAssessments() returns Assessment objects,
        // we might not have the score pre-calculated in the object properties 
        // if it's not stored directly or if we need to calculate it.
        // However, the previous code assumed `score.globalScore`.
        // Let's check if we need to calculate it or if it's stored.
        // The Supabase schema has a `score` jsonb column.
        // AssessmentService.mapFromDb maps it? 
        // Wait, AssessmentService.mapFromDb DOES NOT map the score!
        // I need to update AssessmentService to map the score if it exists.
        // For now, I'll assume I need to fix AssessmentService mapping first 
        // OR calculate it on the fly here (which requires referential).
        // Better to have it in the Assessment object or a separate type.
        // Let's check Assessment interface.
        return 0; // Placeholder until I fix AssessmentService
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
                                        <CardTitle className="truncate pr-2" title={assessment.projectName}>
                                            {assessment.projectName}
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Badge variant={assessment.completed ? 'default' : 'secondary'}>
                                                {assessment.completed ? 'Terminé' : 'Brouillon'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge
                                            variant={
                                                assessment.level === 'essential' ? 'essential' :
                                                    assessment.level === 'recommended' ? 'recommended' : 'advanced'
                                            }
                                            className="text-xs"
                                        >
                                            {assessment.level === 'essential' ? 'Light' :
                                                assessment.level === 'recommended' ? 'Standard' : 'Full'}
                                        </Badge>
                                        <CardDescription className="line-clamp-2 flex-1">
                                            {assessment.projectDescription || "Pas de description"}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Dernière modification</span>
                                            <span>{format(new Date(assessment.updatedAt), 'dd MMM yyyy', { locale: fr })}</span>
                                        </div>
                                        {assessment.score && (
                                            <div className="flex justify-between font-medium">
                                                <span>Score global</span>
                                                <span className={
                                                    assessment.score.complianceRate >= 80 ? "text-green-600" :
                                                        assessment.score.complianceRate >= 50 ? "text-orange-600" : "text-red-600"
                                                }>
                                                    {Math.round(assessment.score.complianceRate)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between pt-4 border-t">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Supprimer
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Supprimer l'évaluation ?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Cette action est irréversible. L'évaluation "{assessment.projectName}" sera définitivement supprimée.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(assessment.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Supprimer
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    {!assessment.completed ? (
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
                                            onClick={() => navigate(`/assessment-results/${assessment.id}`)}
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

import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ResultsSummary } from '@/components/ResultsSummary';
import { ImprovementSuggestions } from '@/components/ImprovementSuggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssessment } from '@/hooks/useAssessment';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AssessmentResults() {
  const { id } = useParams<{ id: string }>();
  const { assessment, referential, score, getImprovements, loading, error } = useAssessment(id);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement des résultats...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!assessment || !referential || !score) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Évaluation introuvable</CardTitle>
              <CardDescription>L'évaluation demandée n'existe pas ou a été supprimée.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/assessment">Créer une nouvelle évaluation</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const improvements = getImprovements();

  const handleShare = () => {
    toast.info('Fonctionnalité de partage à venir');
  };

  const handleDownload = () => {
    toast.info('Fonctionnalité d\'export PDF à venir');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/assessment?id=${assessment.id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ajuster les réponses
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} hidden>
                <Share2 className="h-4 w-4 mr-2" />
                Partager (bientôt)
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} hidden>
                <Download className="h-4 w-4 mr-2" />
                Exporter PDF (bientôt)
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">{assessment.projectName}</h1>
            {assessment.projectDescription && (
              <p className="text-muted-foreground">{assessment.projectDescription}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Référentiel : {referential.name} v{referential.version}
            </p>
            <p className="text-sm text-muted-foreground">
              Évalué le {new Date(assessment.updatedAt).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <ResultsSummary score={score} referential={referential} />

          <ImprovementSuggestions improvements={improvements} />

          <Card>
            <CardHeader>
              <CardTitle>Prochaines étapes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Pour améliorer votre score d'écoconception, nous vous recommandons de :
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Prioriser les critères essentiels non conformes</li>
                <li>Consulter les ressources disponibles dans notre hub</li>
                <li>Mettre en place un plan d'action avec des objectifs mesurables</li>
                <li>Réévaluer régulièrement votre projet pour suivre les progrès</li>
              </ul>
              <div className="flex gap-3 pt-4">
                <Button asChild variant="outline">
                  <Link to="/">Explorer les ressources</Link>
                </Button>
                <Button asChild>
                  <Link to="/assessment">Nouvelle évaluation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ReferentialSelector } from '@/components/ReferentialSelector';
import { AssessmentForm } from '@/components/AssessmentForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssessment } from '@/hooks/useAssessment';
import { toast } from 'sonner';

export default function Assessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'project' | 'evaluate'>('select');
  const [selectedReferentialId, setSelectedReferentialId] = useState<string>('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  
  const { assessment, referential, createAssessment, updateResponse, completeAssessment } = useAssessment();

  const handleReferentialSelect = (referentialId: string) => {
    setSelectedReferentialId(referentialId);
    setStep('project');
  };

  const handleProjectSubmit = async () => {
    if (!projectName.trim()) {
      toast.error('Veuillez saisir un nom de projet');
      return;
    }
    
    await createAssessment(selectedReferentialId, projectName, projectDescription);
    setStep('evaluate');
    toast.success('Évaluation créée avec succès');
  };

  const handleComplete = () => {
    completeAssessment();
    toast.success('Évaluation terminée avec succès');
    navigate(`/assessment-results/${assessment?.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Auto-évaluation</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Évaluez votre projet numérique selon les bonnes pratiques d'écoconception
          </p>
        </div>

        {step === 'select' && (
          <ReferentialSelector onSelect={handleReferentialSelect} />
        )}

        {step === 'project' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Informations du projet</CardTitle>
              <CardDescription>
                Renseignez les informations de base sur votre projet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Nom du projet *</Label>
                <Input
                  id="projectName"
                  placeholder="Mon super projet"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Description (optionnelle)</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Une brève description de votre projet..."
                  rows={4}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                  Retour
                </Button>
                <Button onClick={handleProjectSubmit} className="flex-1">
                  Commencer l'évaluation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'evaluate' && assessment && referential && (
          <AssessmentForm
            referential={referential}
            responses={assessment.responses}
            onResponseUpdate={updateResponse}
            onComplete={handleComplete}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

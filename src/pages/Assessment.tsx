import { useState, useRef } from 'react';
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
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { CriterionResponse, CriterionStatus } from '@/core/domain/Criterion';

export default function Assessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'project' | 'evaluate'>('select');
  const [selectedReferentialId, setSelectedReferentialId] = useState<string>('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { assessment, referential, createAssessment, updateResponse, updateResponses, completeAssessment } = useAssessment();

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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importedResponses: CriterionResponse[] = jsonData.map((row: any) => ({
          criterionId: row['ID Critère'],
          status: row['Statut'] as CriterionStatus,
          comment: row['Commentaire']
        })).filter(r => r.criterionId && r.status);

        // Create assessment with imported responses
        await createAssessment(selectedReferentialId, projectName || 'Évaluation importée', projectDescription);

        // Wait for assessment to be created, then update responses
        setTimeout(() => {
          if (updateResponses) {
            updateResponses(importedResponses);
            setStep('evaluate');
            toast.success(`Import réussi ! ${importedResponses.length} réponses importées.`);
          }
        }, 100);
      } catch (error) {
        console.error("Erreur lors de l'import:", error);
        toast.error("Erreur lors de la lecture du fichier.");
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
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
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold text-foreground">Auto-évaluation</h1>
            <span className="text-sm font-semibold px-2.5 py-1 rounded bg-primary/20 text-primary">ALPHA</span>
          </div>
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
                Renseignez les informations de base sur votre projet ou importez une évaluation existante
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
                <Button variant="outline" onClick={handleImportClick} className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Importer
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleImportFile}
                />
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
            onResponsesUpdate={updateResponses}
            onComplete={handleComplete}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

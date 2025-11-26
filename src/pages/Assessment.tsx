import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AssessmentForm } from '@/components/AssessmentForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAssessment } from '@/hooks/useAssessment';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { CriterionResponse, CriterionStatus } from '@/core/domain/Criterion';

export default function Assessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get('id');

  const [project, setProject] = useState({ name: '', description: '' });
  const [showNewProject, setShowNewProject] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<'essential' | 'recommended' | 'advanced'>('essential');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    assessment,
    referential,
    loading,
    createAssessment,
    updateResponse,
    updateResponses,
    completeAssessment,
    saveProgress,
    deleteAssessment
  } = useAssessment(assessmentId || undefined);

  // Show new project form when:
  // - No assessment is loaded yet
  // - Not loading an assessment
  // - No assessmentId in URL
  useEffect(() => {
    if (!assessment && !loading && !assessmentId) {
      setShowNewProject(true);
    }
  }, [assessment, loading, assessmentId]);

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
        // Defaulting to rgesn-2024 for now
        const newAssessment = await createAssessment('rgesn-2024', project.name || 'Évaluation importée', project.description);

        if (newAssessment) {
          // Wait for state update if needed, but we have the object now.
          // However, updateResponses relies on 'assessment' state in hook.
          // Since we just called setAssessment in hook, it should be updated on next render.
          // But here we are in the same closure.

          // Better approach: pass responses to createAssessment? 
          // For now, let's use the timeout but check success.
          setTimeout(() => {
            if (updateResponses) {
              updateResponses(importedResponses);
              setShowNewProject(false);
              toast.success(`Import réussi ! ${importedResponses.length} réponses importées.`);
            }
          }, 100);
        } else {
          toast.error("Erreur lors de la création de l'évaluation pour l'import.");
        }
      } catch (error) {
        console.error("Erreur lors de l'import:", error);
        toast.error("Erreur lors de la lecture du fichier.");
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.name.trim()) {
      toast.error('Veuillez saisir un nom de projet');
      return;
    }

    const newAssessment = await createAssessment('rgesn-2024', project.name, project.description, selectedLevel);

    if (newAssessment) {
      setShowNewProject(false);
      toast.success('Évaluation créée avec succès');
    } else {
      toast.error("Erreur lors de la création de l'évaluation. Veuillez réessayer.");
    }
  };

  const handleComplete = () => {
    completeAssessment();
    toast.success('Évaluation terminée avec succès');
    navigate(`/assessment-results/${assessment?.id}`);
  };

  const handleReset = () => {
    if (confirm("Êtes-vous sûr de vouloir recommencer ? Toutes vos réponses seront effacées.")) {
      if (assessment) {
        deleteAssessment(assessment.id);
      }
      setProject({ name: '', description: '' });
      setShowNewProject(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Skeleton header */}
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded-lg w-2/3 mx-auto"></div>
              <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
            {/* Skeleton content */}
            <div className="mt-12 animate-pulse space-y-4">
              <div className="h-64 bg-muted rounded-xl"></div>
              <div className="h-12 bg-muted rounded-lg w-1/4"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (showNewProject || !assessment || !referential) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Hero section */}
            <div className="text-center space-y-4 mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Nouvelle évaluation
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Évaluez votre projet
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Démarrez une évaluation d'écoconception basée sur le référentiel RGESN et obtenez des recommandations personnalisées.
              </p>
            </div>

            <Card className="border-2 shadow-lg">
              <CardHeader className="space-y-3 pb-6">
                <CardTitle className="text-2xl">Informations du projet</CardTitle>
                <CardDescription className="text-base">
                  Ces informations identifieront votre évaluation et apparaîtront dans le rapport final.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProjectSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-medium">
                      Nom du projet <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      required
                      value={project.name}
                      onChange={(e) => setProject({ ...project, name: e.target.value })}
                      placeholder="Ex: Mon Site Web"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-medium">
                      Description <span className="text-muted-foreground font-normal">(optionnel)</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={project.description}
                      onChange={(e) => setProject({ ...project, description: e.target.value })}
                      placeholder="Décrivez brièvement le contexte de votre projet..."
                      className="min-h-[120px] text-base resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Niveau d'évaluation <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Choisissez le niveau de profondeur (non modifiable après création)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('essential')}
                        className={`p-5 rounded-lg border-2 transition-all text-left ${selectedLevel === 'essential'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <div className="font-semibold text-lg mb-2">Light</div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Évaluation rapide des critères essentiels
                        </div>
                        <div className="text-xs text-muted-foreground">30 questions</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('advanced')}
                        className={`p-5 rounded-lg border-2 transition-all text-left ${selectedLevel === 'advanced'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <div className="font-semibold text-lg mb-2">Full</div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Évaluation complète de tous les critères
                        </div>
                        <div className="text-xs text-muted-foreground">78 questions</div>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button type="submit" size="lg" className="flex-1 h-12 text-base font-medium">
                      Commencer l'évaluation
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleImportClick}
                      className="h-12"
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Importer Excel
                    </Button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={handleImportFile}
                    aria-label="Importer un fichier Excel"
                  />
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        {/* Project header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold truncate">
                  {assessment.projectName}
                </h1>
                <Badge variant="secondary" className="text-xs font-mono shrink-0">
                  ALPHA
                </Badge>
              </div>
              {assessment.projectDescription && (
                <p className="text-muted-foreground text-sm md:text-base line-clamp-2">
                  {assessment.projectDescription}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Recommencer
              </Button>
            </div>
          </div>
        </div>

        <AssessmentForm
          referential={referential}
          responses={assessment.responses}
          initialTheme={assessment.currentTheme}
          initialIndex={assessment.currentIndex}
          onResponseUpdate={updateResponse}
          onResponsesUpdate={updateResponses}
          onProgressUpdate={saveProgress}
          onComplete={handleComplete}
          level={assessment.level}
        />
      </main>
      <Footer />
    </div>
  );
}

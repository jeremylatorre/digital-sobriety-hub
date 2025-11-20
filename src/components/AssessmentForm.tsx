import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Criterion, CriterionResponse, CriterionStatus, CriterionLevel } from '@/core/domain/Criterion';
import { Referential } from '@/core/domain/Referential';
import { ChevronLeft, ChevronRight, Info, CheckCircle2, Trophy, Download, Upload } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface AssessmentFormProps {
  referential: Referential;
  responses: CriterionResponse[];
  onResponseUpdate: (response: CriterionResponse) => void;
  onResponsesUpdate?: (responses: CriterionResponse[]) => void;
  onComplete: () => void;
}

const levelColors = {
  essential: 'bg-destructive text-destructive-foreground',
  recommended: 'bg-primary text-primary-foreground',
  advanced: 'bg-secondary text-secondary-foreground',
};

const levelLabels = {
  essential: 'Essentiel',
  recommended: 'Recommandé',
  advanced: 'Avancé',
};

const themeLabels: Record<string, string> = {
  strategy: 'Stratégie',
  specifications: 'Spécifications',
  architecture: 'Architecture',
  'ux-ui': 'UX/UI',
  contents: 'Contenus',
  frontend: 'Frontend',
  backend: 'Backend',
  hosting: 'Hébergement',
  algorithm: 'Algorithmie',
};

export function AssessmentForm({ referential, responses, onResponseUpdate, onResponsesUpdate, onComplete }: AssessmentFormProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  const [evaluationLevel, setEvaluationLevel] = useState<CriterionLevel>('advanced');
  const [showThemeSummary, setShowThemeSummary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter criteria based on selected level
  const filteredCriteria = useMemo(() => {
    return referential.criteria.filter((c) => {
      if (evaluationLevel === 'essential') return c.level === 'essential';
      if (evaluationLevel === 'recommended') return c.level === 'essential' || c.level === 'recommended';
      return true;
    });
  }, [referential.criteria, evaluationLevel]);

  const criteriaByTheme = useMemo(() => {
    return filteredCriteria.reduce((acc, criterion) => {
      if (!acc[criterion.theme]) {
        acc[criterion.theme] = [];
      }
      acc[criterion.theme].push(criterion);
      return acc;
    }, {} as Record<string, Criterion[]>);
  }, [filteredCriteria]);

  const themes = Object.keys(criteriaByTheme);
  const currentCriteria = currentTheme ? criteriaByTheme[currentTheme] : [];
  const currentCriterion = currentCriteria[currentIndex];
  const currentResponse = responses.find((r) => r.criterionId === currentCriterion?.id);

  // Calculate global progress
  const relevantResponses = responses.filter(r =>
    filteredCriteria.some(c => c.id === r.criterionId)
  );
  const totalResponded = relevantResponses.filter((r) => r.status !== 'pending').length;
  const progress = (totalResponded / filteredCriteria.length) * 100;

  // Calculate score
  const calculateScore = (criteriaList: Criterion[]) => {
    const themeResponses = responses.filter(r =>
      criteriaList.some(c => c.id === r.criterionId) &&
      r.status !== 'pending' &&
      r.status !== 'not-applicable'
    );

    if (themeResponses.length === 0) return 0;

    const compliantCount = themeResponses.filter(r => r.status === 'compliant').length;
    return Math.round((compliantCount / themeResponses.length) * 100);
  };

  const globalScore = calculateScore(filteredCriteria);
  const currentThemeScore = currentTheme ? calculateScore(criteriaByTheme[currentTheme]) : 0;

  const handleStatusChange = (status: CriterionStatus) => {
    if (!currentCriterion) return;
    onResponseUpdate({
      ...currentResponse,
      criterionId: currentCriterion.id,
      status,
    });
  };

  const handleCommentChange = (comment: string) => {
    if (!currentCriterion) return;
    onResponseUpdate({
      ...currentResponse,
      criterionId: currentCriterion.id,
      status: currentResponse?.status || 'pending',
      comment,
    });
  };

  const handleNext = () => {
    if (currentIndex < currentCriteria.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of theme
      setShowThemeSummary(true);
    }
  };

  const handleContinueAfterSummary = () => {
    setShowThemeSummary(false);
    const currentThemeIndex = themes.indexOf(currentTheme!);
    if (currentThemeIndex < themes.length - 1) {
      setCurrentTheme(themes[currentThemeIndex + 1]);
      setCurrentIndex(0);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (showThemeSummary) {
      setShowThemeSummary(false);
      return;
    }

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      const currentThemeIndex = themes.indexOf(currentTheme!);
      if (currentThemeIndex > 0) {
        const prevTheme = themes[currentThemeIndex - 1];
        setCurrentTheme(prevTheme);
        setCurrentIndex(criteriaByTheme[prevTheme].length - 1);
      } else {
        // Go back to theme selection
        setCurrentTheme(null);
      }
    }
  };

  const handleExport = () => {
    const data = referential.criteria.map(criterion => {
      const response = responses.find(r => r.criterionId === criterion.id);
      return {
        'Thème': themeLabels[criterion.theme],
        'ID Critère': criterion.id,
        'Numéro': criterion.number,
        'Titre': criterion.title,
        'Niveau': levelLabels[criterion.level],
        'Statut': response?.status || 'pending',
        'Commentaire': response?.comment || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Évaluation");
    XLSX.writeFile(wb, "evaluation-rgesn.xlsx");
    toast.success("Export réussi !");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newResponses: CriterionResponse[] = jsonData.map((row: any) => ({
          criterionId: row['ID Critère'],
          status: row['Statut'] as CriterionStatus,
          comment: row['Commentaire']
        })).filter(r => r.criterionId && r.status); // Basic validation

        if (onResponsesUpdate) {
          onResponsesUpdate(newResponses);
          toast.success("Import réussi !");
        } else {
          toast.error("La fonction d'import n'est pas disponible.");
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

  const isFirstCriterion = currentTheme === themes[0] && currentIndex === 0;

  if (!currentTheme) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{referential.name}</CardTitle>
            <CardDescription>Version {referential.version}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{referential.description}</p>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exporter Excel
              </Button>
              <Button variant="outline" onClick={handleImportClick}>
                <Upload className="mr-2 h-4 w-4" />
                Importer Excel
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleImportFile}
              />
            </div>

            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="level-select" className="text-base font-semibold">Niveau d'évaluation</Label>
                <p className="text-sm text-muted-foreground">
                  Choisissez le niveau de profondeur de l'évaluation que vous souhaitez réaliser.
                </p>
              </div>
              <Select
                value={evaluationLevel}
                onValueChange={(v) => setEvaluationLevel(v as CriterionLevel)}
              >
                <SelectTrigger id="level-select" className="w-full md:w-[300px]">
                  <SelectValue placeholder="Choisir un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essential">
                    <div className="flex items-center gap-2">
                      <Badge className={levelColors.essential}>Essentiel</Badge>
                      <span className="text-muted-foreground text-xs">(Light)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="recommended">
                    <div className="flex items-center gap-2">
                      <Badge className={levelColors.recommended}>Recommandé</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div className="flex items-center gap-2">
                      <Badge className={levelColors.advanced}>Avancé</Badge>
                      <span className="text-muted-foreground text-xs">(Complet)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Thématiques ({filteredCriteria.length} critères)</h3>
              {themes.map((theme) => {
                const themeInfo = referential.themes.find((t) => t.id === theme);
                const themeCriteriaCount = criteriaByTheme[theme].length;
                return (
                  <Button
                    key={theme}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-4"
                    onClick={() => setCurrentTheme(theme)}
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{themeInfo?.name || themeLabels[theme]}</div>
                      <div className="text-sm text-muted-foreground">{themeCriteriaCount} critères</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showThemeSummary) {
    const currentThemeIndex = themes.indexOf(currentTheme);
    const isLastTheme = currentThemeIndex === themes.length - 1;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center py-8">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Thématique terminée !</CardTitle>
            <CardDescription className="text-lg">
              {themeLabels[currentTheme]}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">{currentThemeScore}%</div>
              <p className="text-muted-foreground">Score de conformité pour ce thème</p>
            </div>
            <Progress value={currentThemeScore} className="h-3 w-64 mx-auto" />
          </CardContent>
          <CardFooter className="justify-center gap-4">
            <Button variant="outline" onClick={() => setShowThemeSummary(false)}>
              Revoir mes réponses
            </Button>
            <Button onClick={handleContinueAfterSummary} size="lg">
              {isLastTheme ? "Terminer l'évaluation" : "Thème suivant"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentTheme(null)}>
              ← Retour au menu
            </Button>
            <span className="text-sm text-muted-foreground">
              Progression : {totalResponded} / {filteredCriteria.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Score actuel : {globalScore}%
            </Badge>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{themeLabels[currentCriterion.theme]}</Badge>
                <Badge className={levelColors[currentCriterion.level]}>
                  {levelLabels[currentCriterion.level]}
                </Badge>
                <span className="text-sm text-muted-foreground">Critère {currentCriterion.number}</span>
              </div>
              <CardTitle className="text-xl">{currentCriterion.title}</CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-md">
                  <div className="space-y-2">
                    <p><strong>Objectif :</strong> {currentCriterion.objective}</p>
                    <p><strong>Mise en œuvre :</strong> {currentCriterion.implementation}</p>
                    <p><strong>Vérification :</strong> {currentCriterion.verification}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>{currentCriterion.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Statut de conformité</Label>
            <RadioGroup
              value={currentResponse?.status}
              onValueChange={(value) => handleStatusChange(value as CriterionStatus)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compliant" id="compliant" />
                <Label htmlFor="compliant" className="cursor-pointer flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Conforme
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-compliant" id="non-compliant" />
                <Label htmlFor="non-compliant" className="cursor-pointer">Non conforme</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-applicable" id="not-applicable" />
                <Label htmlFor="not-applicable" className="cursor-pointer">Non applicable</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              placeholder="Ajoutez des précisions sur votre réponse..."
              value={currentResponse?.comment || ''}
              onChange={(e) => handleCommentChange(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {currentCriteria.length} dans ce thème
            </span>

            <Button onClick={handleNext}>
              {currentIndex === currentCriteria.length - 1 ? "Terminer le thème" : "Suivant"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

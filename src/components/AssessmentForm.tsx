import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Criterion, CriterionResponse, CriterionStatus } from '@/core/domain/Criterion';
import { Referential } from '@/core/domain/Referential';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AssessmentFormProps {
  referential: Referential;
  responses: CriterionResponse[];
  onResponseUpdate: (response: CriterionResponse) => void;
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
  frontend: 'Frontend',
  backend: 'Backend',
  hosting: 'Hébergement',
};

export function AssessmentForm({ referential, responses, onResponseUpdate, onComplete }: AssessmentFormProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);

  const criteriaByTheme = referential.criteria.reduce((acc, criterion) => {
    if (!acc[criterion.theme]) {
      acc[criterion.theme] = [];
    }
    acc[criterion.theme].push(criterion);
    return acc;
  }, {} as Record<string, Criterion[]>);

  const themes = Object.keys(criteriaByTheme);
  const currentCriteria = currentTheme ? criteriaByTheme[currentTheme] : [];
  const currentCriterion = currentCriteria[currentIndex];
  const currentResponse = responses.find((r) => r.criterionId === currentCriterion?.id);

  const totalResponded = responses.filter((r) => r.status !== 'pending').length;
  const progress = (totalResponded / referential.criteria.length) * 100;

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
      const currentThemeIndex = themes.indexOf(currentTheme!);
      if (currentThemeIndex < themes.length - 1) {
        setCurrentTheme(themes[currentThemeIndex + 1]);
        setCurrentIndex(0);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      const currentThemeIndex = themes.indexOf(currentTheme!);
      if (currentThemeIndex > 0) {
        const prevTheme = themes[currentThemeIndex - 1];
        setCurrentTheme(prevTheme);
        setCurrentIndex(criteriaByTheme[prevTheme].length - 1);
      }
    }
  };

  const isFirstCriterion = currentTheme === themes[0] && currentIndex === 0;
  const isLastCriterion = currentTheme === themes[themes.length - 1] && currentIndex === currentCriteria.length - 1;

  if (!currentTheme) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{referential.name}</CardTitle>
            <CardDescription>Version {referential.version}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{referential.description}</p>
            <div className="space-y-3">
              {themes.map((theme) => {
                const themeInfo = referential.themes.find((t) => t.id === theme);
                const themeCriteria = criteriaByTheme[theme].length;
                return (
                  <Button
                    key={theme}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-4"
                    onClick={() => setCurrentTheme(theme)}
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{themeInfo?.name || themeLabels[theme]}</div>
                      <div className="text-sm text-muted-foreground">{themeCriteria} critères</div>
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Progression globale : {totalResponded} / {referential.criteria.length}
          </span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
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
                <Label htmlFor="compliant" className="cursor-pointer">Conforme</Label>
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
              disabled={isFirstCriterion}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {currentCriteria.length} dans ce thème
            </span>

            {isLastCriterion ? (
              <Button onClick={onComplete}>
                Terminer l'évaluation
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

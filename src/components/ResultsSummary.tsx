import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AssessmentScore } from '@/core/domain/Assessment';
import { Referential } from '@/core/domain/Referential';
import { CheckCircle2, XCircle, MinusCircle, Circle } from 'lucide-react';

interface ResultsSummaryProps {
  score: AssessmentScore;
  referential: Referential;
}

const themeLabels: Record<string, string> = {
  strategy: 'Stratégie',
  specifications: 'Spécifications',
  architecture: 'Architecture',
  'ux-ui': 'UX/UI',
  frontend: 'Frontend',
  backend: 'Backend',
  hosting: 'Hébergement',
};

export function ResultsSummary({ score, referential }: ResultsSummaryProps) {
  const getComplianceLevel = (rate: number) => {
    if (rate >= 80) return { label: 'Excellent', color: 'bg-green-500' };
    if (rate >= 60) return { label: 'Bon', color: 'bg-primary' };
    if (rate >= 40) return { label: 'Moyen', color: 'bg-yellow-500' };
    return { label: 'À améliorer', color: 'bg-destructive' };
  };

  const level = getComplianceLevel(score.levelScore.complianceRate);
  const levelLabels = {
    essential: 'Essentiel',
    recommended: 'Recommandé',
    advanced: 'Complet',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Score {levelLabels[score.levelScore.level]}</CardTitle>
          <CardDescription>Score basé sur les critères {levelLabels[score.levelScore.level].toLowerCase()}s</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <div className="text-6xl font-bold text-primary">
              {Math.round(score.levelScore.complianceRate)}%
            </div>
            <Badge className={level.color} variant="default">
              {level.label}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {score.levelScore.compliant} sur {score.levelScore.total} critères conformes
            </p>
          </div>

          {/* Show overall score if different from level score */}
          {score.levelScore.level !== 'advanced' && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Couverture globale (tous critères) : <span className="font-semibold text-foreground">{Math.round(score.complianceRate)}%</span>
                <br />
                <span className="text-xs">({score.compliant} sur {score.totalCriteria - score.notApplicable} critères)</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-1 p-4 rounded-lg bg-accent/50">
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-5 w-5 mr-1" />
                <span className="text-2xl font-bold">{score.compliant}</span>
              </div>
              <p className="text-sm text-muted-foreground">Conformes</p>
            </div>
            <div className="text-center space-y-1 p-4 rounded-lg bg-accent/50">
              <div className="flex items-center justify-center text-destructive">
                <XCircle className="h-5 w-5 mr-1" />
                <span className="text-2xl font-bold">{score.nonCompliant}</span>
              </div>
              <p className="text-sm text-muted-foreground">Non conformes</p>
            </div>
            <div className="text-center space-y-1 p-4 rounded-lg bg-accent/50">
              <div className="flex items-center justify-center text-muted-foreground">
                <MinusCircle className="h-5 w-5 mr-1" />
                <span className="text-2xl font-bold">{score.notApplicable}</span>
              </div>
              <p className="text-sm text-muted-foreground">Non applicables</p>
            </div>
            <div className="text-center space-y-1 p-4 rounded-lg bg-accent/50">
              <div className="flex items-center justify-center text-muted-foreground">
                <Circle className="h-5 w-5 mr-1" />
                <span className="text-2xl font-bold">{score.pending}</span>
              </div>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score par niveau</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(['essential', 'recommended', 'advanced'] as const).map((level) => {
            const levelScore = score.scoreByLevel[level];
            const percentage = levelScore.total > 0 ? (levelScore.compliant / levelScore.total) * 100 : 0;
            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {level === 'essential' ? 'Essentiel' : level === 'recommended' ? 'Recommandé' : 'Avancé'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {levelScore.compliant} / {levelScore.total}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score par thématique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(score.scoreByTheme).map(([theme, themeScore]) => {
            const percentage = themeScore.total > 0 ? (themeScore.compliant / themeScore.total) * 100 : 0;
            return (
              <div key={theme} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{themeLabels[theme] || theme}</span>
                  <span className="text-sm text-muted-foreground">
                    {themeScore.compliant} / {themeScore.total}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

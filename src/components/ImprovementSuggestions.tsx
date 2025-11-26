import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface Improvement {
  criterion: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
}

interface ImprovementSuggestionsProps {
  improvements: Improvement[];
}

const priorityConfig = {
  high: {
    label: 'Priorité haute',
    icon: AlertCircle,
    className: 'bg-destructive text-destructive-foreground',
  },
  medium: {
    label: 'Priorité moyenne',
    icon: AlertTriangle,
    className: 'bg-primary text-primary-foreground',
  },
  low: {
    label: 'Priorité basse',
    icon: Info,
    className: 'bg-secondary text-secondary-foreground',
  },
};

export function ImprovementSuggestions({ improvements }: ImprovementSuggestionsProps) {
  if (improvements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aucune amélioration nécessaire</CardTitle>
          <CardDescription>Félicitations ! Tous les critères applicables sont conformes.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Améliorations recommandées</CardTitle>
        <CardDescription>
          {improvements.length} point{improvements.length > 1 ? 's' : ''} de non-conformité détecté
          {improvements.length > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {improvements.map((improvement, index) => {
            const config = priorityConfig[improvement.priority];
            const Icon = config.icon;
            return (
              <div
                key={`${improvement.criterion}-${index}`}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-md ${config.className}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">Critère {improvement.criterion}</Badge>
                      <Badge className={config.className}>{config.label}</Badge>
                    </div>
                    <h4 className="font-semibold">{improvement.title}</h4>
                    <div
                      className="text-sm text-muted-foreground [&_ul]:list-disc [&_ul]:pl-4 [&_p]:mb-2"
                      dangerouslySetInnerHTML={{ __html: improvement.suggestion }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

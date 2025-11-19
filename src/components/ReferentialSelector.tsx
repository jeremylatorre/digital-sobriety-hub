import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ReferentialService } from '@/core/services/ReferentialService';
import { Leaf, ExternalLink } from 'lucide-react';

interface ReferentialSelectorProps {
  onSelect: (referentialId: string) => void;
}

export function ReferentialSelector({ onSelect }: ReferentialSelectorProps) {
  const [referentials, setReferentials] = useState<{ id: string; name: string; version: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    ReferentialService.listReferentials().then(setReferentials);
  }, []);

  const handleSubmit = () => {
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <CardTitle>Choisissez votre référentiel</CardTitle>
        </div>
        <CardDescription>
          Sélectionnez le référentiel que vous souhaitez utiliser pour évaluer votre projet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedId} onValueChange={setSelectedId}>
          {referentials.map((ref) => (
            <div key={ref.id} className="flex items-start space-x-3 space-y-0 rounded-md border border-border p-4 hover:bg-accent/50 transition-colors">
              <RadioGroupItem value={ref.id} id={ref.id} />
              <div className="flex-1 space-y-1">
                <Label htmlFor={ref.id} className="font-semibold cursor-pointer">
                  {ref.name}
                </Label>
                <p className="text-sm text-muted-foreground">Version {ref.version}</p>
                {ref.id === 'rgesn' && (
                  <a
                    href="https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                  >
                    En savoir plus <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>

        <Button onClick={handleSubmit} disabled={!selectedId} className="w-full">
          Commencer l'évaluation
        </Button>
      </CardContent>
    </Card>
  );
}

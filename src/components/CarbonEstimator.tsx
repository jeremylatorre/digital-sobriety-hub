import { useState } from 'react';
import tgwf from '@tgwf/co2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, Leaf } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export function CarbonEstimator() {
    const [dataSize, setDataSize] = useState<string>('');
    const [unit, setUnit] = useState<'MB' | 'GB'>('MB');
    const [greenHost, setGreenHost] = useState(false);
    const [result, setResult] = useState<number | null>(null);

    const calculateEmission = () => {
        if (!dataSize) return;

        // Initialize CO2.js with SWD model (Sustainable Web Design)
        const emissions = new tgwf.co2({ model: 'swd' });

        // Convert input to bytes
        let bytes = Number(dataSize);
        if (unit === 'MB') bytes *= 1024 * 1024;
        if (unit === 'GB') bytes *= 1024 * 1024 * 1024;

        // Calculate emissions, passing greenHost parameter
        const emission = emissions.perByte(bytes, greenHost);
        setResult(emission);
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-primary" />
                    <CardTitle>Calculateur Carbone</CardTitle>
                </div>
                <CardDescription>
                    Estimez l'empreinte carbone liée au transfert de données (Modèle SWD).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="size">Volume</Label>
                        <Input
                            id="size"
                            type="number"
                            placeholder="Ex: 1.5"
                            value={dataSize}
                            onChange={(e) => setDataSize(e.target.value)}
                        />
                    </div>
                    <div className="w-24 space-y-2">
                        <Label>Unité</Label>
                        <div className="flex rounded-md shadow-sm">
                            <Button
                                variant={unit === 'MB' ? 'default' : 'outline'}
                                size="sm"
                                className="rounded-r-none w-1/2 px-2"
                                onClick={() => setUnit('MB')}
                            >
                                MB
                            </Button>
                            <Button
                                variant={unit === 'GB' ? 'default' : 'outline'}
                                size="sm"
                                className="rounded-l-none w-1/2 px-2"
                                onClick={() => setUnit('GB')}
                            >
                                GB
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="greenHost"
                        checked={greenHost}
                        onCheckedChange={(checked) => setGreenHost(checked === true)}
                    />
                    <label
                        htmlFor="greenHost"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Hébergement vert
                    </label>
                </div>

                <Button onClick={calculateEmission} className="w-full">
                    Calculer l'impact
                </Button>

                {result !== null && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2" aria-live="polite">
                        <div className="bg-green-100 p-2 rounded-full dark:bg-green-900/20">
                            <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Estimation :</p>
                            <p className="text-2xl font-bold text-foreground">
                                {result.toFixed(3)} <span className="text-sm font-normal text-muted-foreground">gCO2e</span>
                            </p>
                            {greenHost && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    ✓ Hébergement vert pris en compte
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

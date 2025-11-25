import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  initialTheme?: string;
  initialIndex?: number;
  onResponseUpdate: (response: CriterionResponse) => void;
  onResponsesUpdate?: (responses: CriterionResponse[]) => void;
  onProgressUpdate?: (theme: string | null, index: number) => void;
  onComplete: () => void;
  level: CriterionLevel;
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

export function AssessmentForm({ referential, responses, initialTheme, initialIndex, onResponseUpdate, onResponsesUpdate, onProgressUpdate, onComplete, level }: AssessmentFormProps) {
  const [selectedCriterionId, setSelectedCriterionId] = useState<string | null>(null);
  const [openAccordionValue, setOpenAccordionValue] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter criteria based on level
  const filteredCriteria = useMemo(() => {
    return referential.criteria.filter((c) => {
      if (level === 'essential') return c.level === 'essential';
      if (level === 'recommended') return c.level === 'essential' || c.level === 'recommended';
      return true;
    });
  }, [referential.criteria, level]);

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

  // Track if we've initialized to avoid resetting position on every render
  const hasInitialized = useRef(false);

  // Initialize with first criterion or resume from saved position (ONCE on mount)
  useEffect(() => {
    if (hasInitialized.current) return; // Already initialized, skip

    if (initialTheme && initialIndex !== undefined) {
      const themeCriteria = criteriaByTheme[initialTheme];
      if (themeCriteria && themeCriteria[initialIndex]) {
        setSelectedCriterionId(themeCriteria[initialIndex].id);
        setOpenAccordionValue(initialTheme);
        hasInitialized.current = true;
      }
    } else if (!selectedCriterionId && themes.length > 0) {
      const firstTheme = themes[0];
      const firstCriterion = criteriaByTheme[firstTheme][0];
      setSelectedCriterionId(firstCriterion.id);
      setOpenAccordionValue(firstTheme);
      hasInitialized.current = true;
    }
  }, [initialTheme, initialIndex, criteriaByTheme, themes]); // Removed selectedCriterionId from deps

  // Use ref to track last saved position to avoid infinite loops
  const lastSavedPosition = useRef<{ theme: string | null; index: number } | null>(null);

  // Save progress whenever selection changes
  useEffect(() => {
    if (selectedCriterionId && onProgressUpdate) {
      // Find the theme and index
      for (const theme of themes) {
        const index = criteriaByTheme[theme].findIndex(c => c.id === selectedCriterionId);
        if (index !== -1) {
          // Only save if position actually changed
          if (!lastSavedPosition.current ||
            lastSavedPosition.current.theme !== theme ||
            lastSavedPosition.current.index !== index) {
            lastSavedPosition.current = { theme, index };
            onProgressUpdate(theme, index);
          }
          break;
        }
      }
    }
  }, [selectedCriterionId]); // Only depend on selectedCriterionId

  const selectedCriterion = filteredCriteria.find(c => c.id === selectedCriterionId);
  const currentResponse = responses.find((r) => r.criterionId === selectedCriterionId);

  // Calculate global progress
  const relevantResponses = responses.filter(r =>
    filteredCriteria.some(c => c.id === r.criterionId)
  );
  const totalResponded = relevantResponses.filter((r) => r.status !== 'pending').length;
  const progress = (totalResponded / filteredCriteria.length) * 100;

  // Calculate theme progress
  const getThemeProgress = (theme: string) => {
    const themeCriteria = criteriaByTheme[theme];
    const themeResponses = responses.filter(r =>
      themeCriteria.some(c => c.id === r.criterionId) && r.status !== 'pending'
    );
    return {
      completed: themeResponses.length,
      total: themeCriteria.length,
    };
  };

  const handleStatusChange = (status: CriterionStatus) => {
    if (!selectedCriterion) return;
    onResponseUpdate({
      ...currentResponse,
      criterionId: selectedCriterion.id,
      status,
    });
  };

  const handleCommentChange = (comment: string) => {
    if (!selectedCriterion) return;
    onResponseUpdate({
      ...currentResponse,
      criterionId: selectedCriterion.id,
      status: currentResponse?.status || 'pending',
      comment,
    });
  };

  const handleNext = () => {
    if (!selectedCriterion || isTransitioning) return;

    // Start transition
    setIsTransitioning(true);

    // Wait for fade out
    setTimeout(() => {
      // Find current position
      let currentTheme = '';
      let currentIndex = -1;
      for (const theme of themes) {
        const index = criteriaByTheme[theme].findIndex(c => c.id === selectedCriterion.id);
        if (index !== -1) {
          currentTheme = theme;
          currentIndex = index;
          break;
        }
      }

      // Move to next criterion
      const themeCriteria = criteriaByTheme[currentTheme];
      if (currentIndex < themeCriteria.length - 1) {
        // Next question in same theme
        setSelectedCriterionId(themeCriteria[currentIndex + 1].id);
      } else {
        // Move to next theme
        const themeIndex = themes.indexOf(currentTheme);
        if (themeIndex < themes.length - 1) {
          const nextTheme = themes[themeIndex + 1];
          setSelectedCriterionId(criteriaByTheme[nextTheme][0].id);
          setOpenAccordionValue(nextTheme);
        } else {
          // All done
          setIsTransitioning(false);
          onComplete();
          return;
        }
      }

      // End transition after content changes
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  };

  const handlePrevious = () => {
    if (!selectedCriterion || isTransitioning) return;

    // Start transition
    setIsTransitioning(true);

    // Wait for fade out
    setTimeout(() => {
      // Find current position
      let currentTheme = '';
      let currentIndex = -1;
      for (const theme of themes) {
        const index = criteriaByTheme[theme].findIndex(c => c.id === selectedCriterion.id);
        if (index !== -1) {
          currentTheme = theme;
          currentIndex = index;
          break;
        }
      }

      // Move to previous criterion
      if (currentIndex > 0) {
        // Previous question in same theme
        const themeCriteria = criteriaByTheme[currentTheme];
        setSelectedCriterionId(themeCriteria[currentIndex - 1].id);
      } else {
        // Move to previous theme
        const themeIndex = themes.indexOf(currentTheme);
        if (themeIndex > 0) {
          const prevTheme = themes[themeIndex - 1];
          const prevThemeCriteria = criteriaByTheme[prevTheme];
          setSelectedCriterionId(prevThemeCriteria[prevThemeCriteria.length - 1].id);
          setOpenAccordionValue(prevTheme);
        }
      }

      // End transition after content changes
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
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
        })).filter(r => r.criterionId && r.status);

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
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const isFirstCriterion = selectedCriterion?.id === criteriaByTheme[themes[0]]?.[0]?.id;
  const isLastCriterion = selectedCriterion?.id === criteriaByTheme[themes[themes.length - 1]]?.[criteriaByTheme[themes[themes.length - 1]].length - 1]?.id;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with progress */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Progression : {totalResponded} / {filteredCriteria.length}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">{levelLabels[level]}</Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {Math.round(progress)}%
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Export/Import buttons */}
      <div className="flex gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
        <Button variant="outline" size="sm" onClick={handleImportClick}>
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
      </div>

      {/* Split Layout: Sidebar (Accordion) + Main (Question Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        {/* Sidebar: Accordion Navigation */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation</CardTitle>
              <CardDescription>Sélectionnez une question</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="single" collapsible value={openAccordionValue} onValueChange={setOpenAccordionValue}>
                {themes.map((theme) => {
                  const themeProgress = getThemeProgress(theme);
                  const themeInfo = referential.themes.find((t) => t.id === theme);
                  return (
                    <AccordionItem key={theme} value={theme}>
                      <AccordionTrigger className="px-6">
                        <div className="flex-1 text-left">
                          <div className="font-semibold">{themeInfo?.name || themeLabels[theme]}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {themeProgress.completed} / {themeProgress.total} complétées
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6">
                        <div className="space-y-1">
                          {criteriaByTheme[theme].map((criterion, index) => {
                            const response = responses.find((r) => r.criterionId === criterion.id);
                            const isAnswered = response?.status !== 'pending';
                            const isSelected = selectedCriterionId === criterion.id;
                            return (
                              <button
                                key={criterion.id}
                                onClick={() => setSelectedCriterionId(criterion.id)}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted'
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isAnswered && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                  <span className="flex-1 truncate">{criterion.number}. {criterion.title}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Main: Question Form */}
        {selectedCriterion && (
          <div
            className="transition-opacity duration-200 ease-in-out"
            style={{ opacity: isTransitioning ? 0 : 1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{themeLabels[selectedCriterion.theme]}</Badge>
                      <Badge className={levelColors[selectedCriterion.level]}>
                        {levelLabels[selectedCriterion.level]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Critère {selectedCriterion.number}</span>
                    </div>
                    <CardTitle className="text-xl">{selectedCriterion.title}</CardTitle>
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
                          <p><strong>Objectif :</strong> {selectedCriterion.objective}</p>
                          <p><strong>Mise en œuvre :</strong> {selectedCriterion.implementation}</p>
                          <p><strong>Vérification :</strong> {selectedCriterion.verification}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardDescription>{selectedCriterion.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Statut de conformité</Label>
                  <RadioGroup
                    value={currentResponse?.status}
                    onValueChange={(value) => handleStatusChange(value as CriterionStatus)}
                  >
                    <div className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105">
                      <RadioGroupItem value="compliant" id="compliant" />
                      <Label htmlFor="compliant" className="cursor-pointer">
                        Conforme
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105">
                      <RadioGroupItem value="non-compliant" id="non-compliant" />
                      <Label htmlFor="non-compliant" className="cursor-pointer">Non conforme</Label>
                    </div>
                    <div className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105">
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
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstCriterion}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>

                <span className="text-sm text-muted-foreground">
                  {totalResponded} / {filteredCriteria.length} réponses
                </span>

                <Button onClick={handleNext}>
                  {isLastCriterion ? "Terminer" : "Suivant"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

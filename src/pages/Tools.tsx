import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TOOLS } from '@/data/tools';
import { ExternalLink, Leaf, TreePine, Cloud, Lightbulb, Award, Gauge, Package, Activity, Brain, Zap, Cpu, Calculator } from 'lucide-react';
import { CarbonEstimator } from '@/components/CarbonEstimator';

const iconMap: Record<string, any> = {
    Leaf,
    TreePine,
    Cloud,
    Lightbulb,
    Award,
    Gauge,
    Package,
    Activity,
    Brain,
    Zap,
    Cpu,
    Calculator
};

export default function Tools() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-8 text-center space-y-2">
                    <h1 className="text-4xl font-bold text-foreground">Boîte à outils</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Découvrez une sélection d'outils pour mesurer et améliorer la sobriété numérique de vos projets
                    </p>
                </div>

                {/* Info blocks side by side above tools */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Pourquoi mesurer ?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Le transfert de données sur internet consomme de l'électricité à chaque étape : data centers, réseaux de transmission et terminaux utilisateurs.
                                <br /><br />
                                Réduire le poids de vos pages web est l'un des leviers les plus efficaces pour diminuer l'impact carbone de votre site.
                            </p>
                        </CardContent>
                    </Card>

                    <CarbonEstimator />
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TOOLS.map((tool) => {
                        const IconComponent = iconMap[tool.icon] || Leaf;
                        return (
                            <Card key={tool.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <IconComponent className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle className="text-xl">{tool.name}</CardTitle>
                                    </div>
                                    <CardDescription className="text-sm">
                                        {tool.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => window.open(tool.link, '_blank')}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Accéder à l'outil
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </main>
            <Footer />
        </div>
    );
}

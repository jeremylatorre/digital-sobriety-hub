import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Target, Users, Code, ExternalLink, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border bg-muted/30 py-12">
          <div className="container px-4">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">À propos</h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Un hub gratuit et open-source pour promouvoir la sobriété numérique
              et le craftmanship dans le développement web.
            </p>
          </div>
        </section>

        <section className="container px-4 py-12">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Mission */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle>Notre Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Sensibiliser et outiller les développeurs, designers et décideurs
                  aux pratiques de développement web sobre. Nous croyons qu'un web
                  plus léger est un web plus accessible, plus performant et plus
                  durable.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Values */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle>Nos Valeurs</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-1 font-medium">Sobriété</h3>
                  <p className="text-sm text-muted-foreground">
                    Concevoir des solutions simples et efficaces, sans
                    fonctionnalités superflues.
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 font-medium">Accessibilité</h3>
                  <p className="text-sm text-muted-foreground">
                    Rendre le web utilisable par tous, indépendamment des
                    capacités ou des équipements.
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 font-medium">Durabilité</h3>
                  <p className="text-sm text-muted-foreground">
                    Réduire l'empreinte environnementale du numérique par des
                    choix techniques responsables.
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 font-medium">Craftmanship</h3>
                  <p className="text-sm text-muted-foreground">
                    Écrire du code propre, maintenable et élégant pour des
                    projets pérennes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Open Source */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle>Projet Open Source</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Ce hub est entièrement open-source et gratuit. Le code source
                  est disponible sur GitHub pour que chacun puisse contribuer,
                  apprendre et adapter le projet à ses besoins. Nous croyons au
                  partage des connaissances et à la collaboration.
                </CardDescription>
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <a
                      href="https://github.com/jeremylatorre/digital-sobriety-hub"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Code className="h-4 w-4" />
                      Voir le code sur GitHub
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contribute */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle>Contribuer</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Vous souhaitez ajouter une ressource, corriger une erreur ou
                  améliorer le projet ? Les contributions sont les bienvenues !
                  Consultez notre dépôt GitHub pour plus d'informations sur
                  comment participer.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Alternumia */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle>Accompagnement Professionnel</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Besoin d'aller plus loin ? Je propose des services d'accompagnement
                  sur mesure en <strong>numérique responsable</strong> et <strong>IA frugale</strong>.
                  Audit, formation, stratégie : construisons ensemble un numérique plus vertueux.
                </CardDescription>
                <div className="mt-4">
                  <Button asChild>
                    <a
                      href="https://alternumia.fr/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Découvrir Alternumia
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;

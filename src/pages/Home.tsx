import { useState, useMemo } from "react";
import { ResourceCategory } from "@/core/domain/Resource";
import { useResources, useFilteredResources } from "@/hooks/useResources";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResourceCard from "@/components/ResourceCard";
import FilterBar from "@/components/FilterBar";
import DidYouKnow from "@/components/DidYouKnow";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { resources, loading, error } = useResources();
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | "Tous">("Tous");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredResources = useFilteredResources(resources, selectedCategory, selectedTags);

  // Extract unique categories and tags
  const categories: ResourceCategory[] = useMemo(
    () => Array.from(new Set(resources.map((r) => r.category))),
    [resources]
  );

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    resources.forEach((r) => r.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [resources]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory("Tous");
    setSelectedTags([]);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <section className="border-b border-border bg-muted/30 py-12">
          <div className="container px-4">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              Hub de Sobriété Numérique
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Ressources, guides et outils pour concevoir des applications web sobres,
              accessibles et durables. Apprenez les meilleures pratiques du développement
              web léger et du craftmanship.
            </p>
          </div>
        </section>

        {/* Main content */}
        <section className="container px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            {/* Resources grid */}
            <div className="space-y-6">
              <FilterBar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onResetFilters={handleResetFilters}
                resultCount={filteredResources.length}
              />

              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {filteredResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}

              {!loading && filteredResources.length === 0 && (
                <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
                  <p className="text-muted-foreground">
                    Aucune ressource ne correspond à vos critères.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar - Did you know */}
            <aside className="lg:sticky lg:top-24 lg:h-fit" aria-label="Conseils">
              <DidYouKnow />
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

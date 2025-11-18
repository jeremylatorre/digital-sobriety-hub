import { useState, useEffect } from "react";
import { Resource, ResourceCategory } from "@/core/domain/Resource";
import { ResourceService } from "@/core/services/ResourceService";

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const service = ResourceService.getInstance();
        const data = await service.fetchResources();
        setResources(data);
        setError(null);
      } catch (err) {
        setError("Impossible de charger les ressources");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  return { resources, loading, error };
};

export const useFilteredResources = (
  resources: Resource[],
  selectedCategory: ResourceCategory | "Tous",
  selectedTags: string[]
) => {
  const [filteredResources, setFilteredResources] = useState<Resource[]>(resources);

  useEffect(() => {
    let filtered = resources;

    // Filter by category
    if (selectedCategory !== "Tous") {
      filtered = filtered.filter((r) => r.category === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((r) =>
        selectedTags.every((tag) => r.tags.includes(tag))
      );
    }

    setFilteredResources(filtered);
  }, [resources, selectedCategory, selectedTags]);

  return filteredResources;
};

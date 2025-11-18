import { ResourceCategory } from "@/core/domain/Resource";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterBarProps {
  categories: ResourceCategory[];
  selectedCategory: ResourceCategory | "Tous";
  onCategoryChange: (category: ResourceCategory | "Tous") => void;
  availableTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onResetFilters: () => void;
  resultCount: number;
}

const FilterBar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  availableTags,
  selectedTags,
  onTagToggle,
  onResetFilters,
  resultCount,
}: FilterBarProps) => {
  const hasActiveFilters = selectedCategory !== "Tous" || selectedTags.length > 0;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Category filters */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Catégories</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "Tous" ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange("Tous")}
            className="text-xs"
          >
            Tous
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Tag filters */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer text-xs hover:bg-primary/80"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
                {isSelected && <X className="ml-1 h-3 w-3" aria-hidden="true" />}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Results and reset */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{resultCount}</span> ressource
          {resultCount > 1 ? "s" : ""} trouvée{resultCount > 1 ? "s" : ""}
        </p>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-xs"
          >
            <X className="mr-1 h-3 w-3" aria-hidden="true" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;

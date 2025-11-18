import { Resource } from "@/core/domain/Resource";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Clock, TrendingUp } from "lucide-react";

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard = ({ resource }: ResourceCardProps) => {
  const impactColors = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-accent/20 text-accent-foreground",
    high: "bg-primary/20 text-primary",
  };

  return (
    <Card className="group h-full transition-all hover:shadow-md hover:border-primary/50">
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full focus-visible:outline-none"
      >
        <CardHeader>
          <div className="mb-2 flex items-start justify-between gap-2">
            <Badge variant="secondary" className="text-xs">
              {resource.category}
            </Badge>
            <ExternalLink
              className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>
          <CardTitle className="text-lg leading-tight group-hover:text-primary">
            {resource.title}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <CardDescription className="mb-4 line-clamp-3">
            {resource.description}
          </CardDescription>

          <div className="flex flex-wrap items-center gap-2">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {resource.readingTime}
            </span>
            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${impactColors[resource.impact]}`}>
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              Impact {resource.impact}
            </span>
          </div>
        </CardContent>
      </a>
    </Card>
  );
};

export default ResourceCard;

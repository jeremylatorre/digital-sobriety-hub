import { useTips } from "@/hooks/useTips";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DidYouKnow = () => {
  // Auto-rotate every 60 seconds
  const { currentTip, nextTip, loading } = useTips(60000);

  if (loading) {
    return (
      <Card className="border-tip-border bg-tip-bg">
        <CardContent className="p-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!currentTip) return null;

  return (
    <Card className="border-tip-border bg-tip-bg">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">
            Le saviez-vous ?
          </h2>
        </div>

        <p className="mb-3 text-sm leading-relaxed text-foreground">
          {currentTip.content}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Source : {currentTip.source}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextTip}
            className="h-8 text-xs"
            aria-label="Voir un autre conseil"
          >
            <RefreshCw className="mr-1 h-3 w-3" aria-hidden="true" />
            Autre conseil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DidYouKnow;

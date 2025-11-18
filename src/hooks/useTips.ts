import { useState, useEffect, useCallback } from "react";
import { Tip } from "@/core/domain/Tip";
import { TipService } from "@/core/services/TipService";

export const useTips = (autoRotateInterval?: number) => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  const service = TipService.getInstance();

  useEffect(() => {
    const loadTips = async () => {
      try {
        setLoading(true);
        const data = await service.fetchTips();
        setTips(data);
        if (data.length > 0) {
          setCurrentTip(data[0]);
        }
      } catch (err) {
        console.error("Error loading tips:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTips();
  }, []);

  const nextTip = useCallback(() => {
    if (tips.length === 0) return;
    const next = service.getRandomTip(tips, currentTip?.id);
    if (next) setCurrentTip(next);
  }, [tips, currentTip, service]);

  // Auto-rotate if interval is provided
  useEffect(() => {
    if (!autoRotateInterval || tips.length === 0) return;

    const interval = setInterval(nextTip, autoRotateInterval);
    return () => clearInterval(interval);
  }, [autoRotateInterval, nextTip, tips.length]);

  return { currentTip, nextTip, loading };
};

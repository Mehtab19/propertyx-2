import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) { setFavoriteIds(new Set()); return; }
    const { data } = await supabase
      .from("favorites")
      .select("property_id")
      .eq("user_id", user.id);
    if (data) setFavoriteIds(new Set(data.map((f) => f.property_id)));
  }, [user]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const toggleFavorite = useCallback(async (propertyId: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save properties.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const isFav = favoriteIds.has(propertyId);

    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", propertyId);
      setFavoriteIds((prev) => { const next = new Set(prev); next.delete(propertyId); return next; });
      toast({ title: "Removed from favorites" });
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: propertyId });
      setFavoriteIds((prev) => new Set(prev).add(propertyId));
      toast({ title: "Saved to favorites ❤️" });
    }
    setLoading(false);
  }, [user, favoriteIds, toast]);

  return { favoriteIds, toggleFavorite, loading, refetch: fetchFavorites };
}

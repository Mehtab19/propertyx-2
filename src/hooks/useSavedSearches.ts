/**
 * Saved Searches Hook
 * Manages saved search filters for authenticated users
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Type for Supabase response
interface SavedSearchRow {
  id: string;
  name: string;
  filters: unknown;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const mapRowToSavedSearch = (row: SavedSearchRow): SavedSearch => ({
  id: row.id,
  name: row.name,
  filters: row.filters as Record<string, any>,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const useSavedSearches = () => {
  const { user, isAuthenticated } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's saved searches
  const fetchSavedSearches = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSavedSearches([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedSearches((data || []).map(mapRowToSavedSearch));
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  // Save a new search
  const saveSearch = useCallback(async (name: string, filters: Record<string, any>) => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to save searches');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name,
          filters,
        })
        .select()
        .single();

      if (error) throw error;

      const mapped = mapRowToSavedSearch(data);
      setSavedSearches(prev => [mapped, ...prev]);
      toast.success('Search saved successfully');
      return mapped;
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error('Failed to save search');
      return null;
    }
  }, [user, isAuthenticated]);

  // Update a saved search
  const updateSearch = useCallback(async (id: string, name: string, filters: Record<string, any>) => {
    if (!isAuthenticated || !user) return false;

    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ name, filters })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedSearches(prev =>
        prev.map(s => s.id === id ? { ...s, name, filters, updated_at: new Date().toISOString() } : s)
      );
      toast.success('Search updated');
      return true;
    } catch (error) {
      console.error('Error updating search:', error);
      toast.error('Failed to update search');
      return false;
    }
  }, [user, isAuthenticated]);

  // Delete a saved search
  const deleteSearch = useCallback(async (id: string) => {
    if (!isAuthenticated || !user) return false;

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedSearches(prev => prev.filter(s => s.id !== id));
      toast.success('Search deleted');
      return true;
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error('Failed to delete search');
      return false;
    }
  }, [user, isAuthenticated]);

  return {
    savedSearches,
    loading,
    saveSearch,
    updateSearch,
    deleteSearch,
    refetch: fetchSavedSearches,
  };
};

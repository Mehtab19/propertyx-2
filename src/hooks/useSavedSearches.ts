/**
 * Saved Searches Hook
 * Stub implementation - saved_searches table not yet created
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useSavedSearches = () => {
  const { user, isAuthenticated } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading] = useState(false);

  const saveSearch = useCallback(async (name: string, filters: Record<string, any>) => {
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to save searches');
      return null;
    }
    // Stub: saved_searches table not yet available
    const stub: SavedSearch = {
      id: crypto.randomUUID(),
      name,
      filters,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSavedSearches(prev => [stub, ...prev]);
    toast.success('Search saved (local only)');
    return stub;
  }, [user, isAuthenticated]);

  const updateSearch = useCallback(async (id: string, name: string, filters: Record<string, any>) => {
    setSavedSearches(prev =>
      prev.map(s => s.id === id ? { ...s, name, filters, updated_at: new Date().toISOString() } : s)
    );
    toast.success('Search updated');
    return true;
  }, []);

  const deleteSearch = useCallback(async (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
    toast.success('Search deleted');
    return true;
  }, []);

  return {
    savedSearches,
    loading,
    saveSearch,
    updateSearch,
    deleteSearch,
    refetch: () => {},
  };
};

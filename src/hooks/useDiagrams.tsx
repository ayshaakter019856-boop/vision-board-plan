import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Diagram {
  id: string;
  title: string;
  description?: string | null;
  nodes: any;
  edges: any;
  created_at: string;
  updated_at: string;
}

export const useDiagrams = () => {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDiagrams = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('diagrams')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDiagrams((data || []) as Diagram[]);
    } catch (error) {
      console.error('Error fetching diagrams:', error);
      toast.error('Failed to load diagrams');
    } finally {
      setLoading(false);
    }
  };

  const saveDiagram = async (title: string, nodes: any[], edges: any[], description?: string, id?: string) => {
    if (!user) {
      toast.error('You must be signed in to save diagrams');
      return null;
    }

    try {
      if (id) {
        // Update existing diagram
        const { data, error } = await supabase
          .from('diagrams')
          .update({
            title,
            description,
            nodes,
            edges,
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        
        setDiagrams(prev => prev.map(d => d.id === id ? data as Diagram : d));
        toast.success('Diagram updated successfully!');
        return data;
      } else {
        // Create new diagram
        const { data, error } = await supabase
          .from('diagrams')
          .insert({
            user_id: user.id,
            title,
            description,
            nodes,
            edges,
          })
          .select()
          .single();

        if (error) throw error;
        
        setDiagrams(prev => [data as Diagram, ...prev]);
        toast.success('Diagram saved successfully!');
        return data;
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      toast.error('Failed to save diagram');
      return null;
    }
  };

  const deleteDiagram = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('diagrams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDiagrams(prev => prev.filter(d => d.id !== id));
      toast.success('Diagram deleted successfully!');
    } catch (error) {
      console.error('Error deleting diagram:', error);
      toast.error('Failed to delete diagram');
    }
  };

  useEffect(() => {
    fetchDiagrams();
  }, [user]);

  return {
    diagrams,
    loading,
    saveDiagram,
    deleteDiagram,
    refetch: fetchDiagrams,
  };
};
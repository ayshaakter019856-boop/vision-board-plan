import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Note {
  id: string;
  title: string;
  content?: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotes = async (includeCompleted = false) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('notes')
        .select('*');
      
      if (!includeCompleted) {
        query = query.eq('completed', false);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes((data || []) as Note[]);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async (title: string, content?: string, id?: string) => {
    if (!user) {
      toast.error('You must be signed in to save notes');
      return null;
    }

    try {
      if (id) {
        // Update existing note
        const { data, error } = await supabase
          .from('notes')
          .update({
            title,
            content,
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        
        setNotes(prev => prev.map(n => n.id === id ? data as Note : n));
        toast.success('Note updated successfully!');
        return data;
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('notes')
          .insert({
            user_id: user.id,
            title,
            content,
          })
          .select()
          .single();

        if (error) throw error;
        
        setNotes(prev => [data as Note, ...prev]);
        toast.success('Note saved successfully!');
        return data;
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
      return null;
    }
  };

  const completeNote = async (id: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ completed: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note completed!');
      return data;
    } catch (error) {
      console.error('Error completing note:', error);
      toast.error('Failed to complete note');
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted successfully!');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  return {
    notes,
    loading,
    saveNote,
    completeNote,
    deleteNote,
    refetch: fetchNotes,
    fetchNotes,
  };
};
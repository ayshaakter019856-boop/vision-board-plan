import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Cost {
  id: string;
  user_id: string;
  month_name: string;
  date: string;
  costing_reason: string;
  costing_amount: number;
  is_earning: boolean;
  created_at: string;
  updated_at: string;
}

export const useCosts = () => {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('costs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching costs:', error);
        return;
      }

      setCosts(data || []);
    } catch (error) {
      console.error('Error fetching costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCost = async (
    month_name: string,
    date: string,
    costing_reason: string,
    costing_amount: number,
    is_earning: boolean = false,
    id?: string
  ) => {
    if (!user) return;

    try {
      const costData = {
        user_id: user.id,
        month_name,
        date,
        costing_reason,
        costing_amount,
        is_earning,
      };

      if (id) {
        // Update existing cost
        const { data, error } = await supabase
          .from('costs')
          .update(costData)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating cost:', error);
          return;
        }

        setCosts(prev => prev.map(cost => cost.id === id ? data : cost));
      } else {
        // Create new cost
        const { data, error } = await supabase
          .from('costs')
          .insert(costData)
          .select()
          .single();

        if (error) {
          console.error('Error creating cost:', error);
          return;
        }

        setCosts(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Error saving cost:', error);
    }
  };

  const deleteCost = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('costs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting cost:', error);
        return;
      }

      setCosts(prev => prev.filter(cost => cost.id !== id));
    } catch (error) {
      console.error('Error deleting cost:', error);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, [user]);

  const refetch = () => {
    fetchCosts();
  };

  return {
    costs,
    loading,
    saveCost,
    deleteCost,
    refetch,
  };
};
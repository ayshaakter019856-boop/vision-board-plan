import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export const useRoles = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async () => {
    if (!user) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRole(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role
        })
        .select()
        .single();

      if (error) {
        console.error('Error assigning role:', error);
        return { error };
      }

      // If assigning to current user, update local state
      if (userId === user?.id) {
        setUserRole(data);
      }

      return { data };
    } catch (error) {
      console.error('Error:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [user]);

  const isAdmin = userRole?.role === 'admin';

  return {
    userRole,
    loading,
    isAdmin,
    assignRole,
    refetch: fetchUserRole
  };
};
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface NetflixAccount {
  id: string;
  user_id: string;
  product_name: string;
  email: string;
  password: string;
  profile_name?: string;
  profile_pin?: string;
  note?: string;
  category: string;
  order_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useNetflixAccounts = () => {
  const [netflixAccounts, setNetflixAccounts] = useState<NetflixAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNetflixAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('netflix_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNetflixAccounts(data || []);
    } catch (error) {
      console.error('Error fetching Netflix accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load Netflix accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNetflixAccount = async (accountData: Omit<NetflixAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('netflix_accounts')
        .insert([{
          ...accountData,
          user_id: userData.user.id,
          status: accountData.status || 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      setNetflixAccounts(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Netflix account created successfully",
      });
    } catch (error) {
      console.error('Error creating Netflix account:', error);
      toast({
        title: "Error",
        description: "Failed to create Netflix account",
        variant: "destructive",
      });
    }
  };

  const updateNetflixAccount = async (id: string, updates: Partial<NetflixAccount>) => {
    try {
      const { data, error } = await supabase
        .from('netflix_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNetflixAccounts(prev => 
        prev.map(account => account.id === id ? data : account)
      );
      
      toast({
        title: "Success",
        description: "Netflix account updated successfully",
      });
    } catch (error) {
      console.error('Error updating Netflix account:', error);
      toast({
        title: "Error",
        description: "Failed to update Netflix account",
        variant: "destructive",
      });
    }
  };

  const deleteNetflixAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('netflix_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNetflixAccounts(prev => prev.filter(account => account.id !== id));
      toast({
        title: "Success",
        description: "Netflix account deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting Netflix account:', error);
      toast({
        title: "Error",
        description: "Failed to delete Netflix account",
        variant: "destructive",
      });
    }
  };

  const bulkCreateNetflixAccounts = async (accounts: any[]) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No authenticated user');

      const accountsWithUserId = accounts.map(account => ({
        ...account,
        user_id: userData.user.id,
        status: account.status || 'active'
      }));

      const { data, error } = await supabase
        .from('netflix_accounts')
        .insert(accountsWithUserId)
        .select();

      if (error) throw error;

      setNetflixAccounts(prev => [...(data || []), ...prev]);
      toast({
        title: "Success",
        description: `Successfully imported ${data?.length || 0} Netflix accounts`,
      });
    } catch (error) {
      console.error('Error bulk creating Netflix accounts:', error);
      toast({
        title: "Error",
        description: "Failed to import Netflix accounts",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNetflixAccounts();
  }, []);

  return {
    netflixAccounts,
    loading,
    createNetflixAccount,
    updateNetflixAccount,
    deleteNetflixAccount,
    bulkCreateNetflixAccounts,
    fetchNetflixAccounts
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { encryptionService } from '@/lib/encryption';

export interface Account {
  id: string;
  product_name: string;
  email: string;
  password: string;
  note?: string;
  customer_name?: string;
  order_date?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Decrypt passwords for display
      const decryptedAccounts = await Promise.all(
        (data || []).map(async (account) => ({
          ...account,
          password: await encryptionService.decrypt(account.password),
          email: await encryptionService.decrypt(account.email)
        }))
      );
      
      setAccounts(decryptedAccounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (accountData: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      // Encrypt sensitive data before storing
      const encryptedData = {
        ...accountData,
        password: await encryptionService.encrypt(accountData.password),
        email: await encryptionService.encrypt(accountData.email),
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('accounts')
        .insert([encryptedData])
        .select()
        .single();

      if (error) throw error;
      
      // Store decrypted version in state for display
      const decryptedAccount = {
        ...data,
        password: accountData.password,
        email: accountData.email
      };
      
      setAccounts(prev => [decryptedAccount, ...prev]);
      toast.success('Account created successfully');
      return decryptedAccount;
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
      return null;
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      // Encrypt sensitive data before updating
      const encryptedUpdates = { ...updates };
      if (updates.password) {
        encryptedUpdates.password = await encryptionService.encrypt(updates.password);
      }
      if (updates.email) {
        encryptedUpdates.email = await encryptionService.encrypt(updates.email);
      }

      const { error } = await supabase
        .from('accounts')
        .update(encryptedUpdates)
        .eq('id', id);

      if (error) throw error;

      // Update state with decrypted data for display
      setAccounts(prev => 
        prev.map(account => 
          account.id === id ? { ...account, ...updates } : account
        )
      );
      toast.success('Account updated successfully');
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account');
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccounts(prev => prev.filter(account => account.id !== id));
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  return {
    accounts,
    loading,
    createAccount,
    updateAccount,
    deleteAccount,
    refetch: fetchAccounts
  };
};
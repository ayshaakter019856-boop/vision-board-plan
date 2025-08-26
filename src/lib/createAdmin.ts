import { supabase } from '@/integrations/supabase/client';

export const createAdminUser = async () => {
  try {
    console.log('Creating admin user...');
    
    const { data, error } = await supabase.functions.invoke('create-admin', {
      body: {
        email: 'anisahmed@brainleaked.com',
        password: 'anisahmed@brain123'
      }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return { error };
    }

    console.log('Admin user created successfully:', data);
    return { data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error };
  }
};

// Call this function in browser console to create the admin user
// createAdminUser();
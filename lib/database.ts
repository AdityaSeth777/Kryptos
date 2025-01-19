import { createClient } from '@supabase/supabase-js';

export class Database {
  private supabase;
  private static instance: Database | null = null;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async signInWithWallet(walletAddress: string) {
    try {
      const email = `${walletAddress.toLowerCase()}@web3chat.com`;
      const password = `${walletAddress.toLowerCase()}_secret`;

      // Try to sign in first
      const { data, error: signInError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If sign in fails, create a new account
      if (signInError) {
        const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              wallet_address: walletAddress.toLowerCase(),
            },
          },
        });

        if (signUpError) throw signUpError;
        return signUpData;
      }

      return data;
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  }

  async storeMessage(senderId: string, recipientId: string, message: string) {
    try {
      // Ensure sender is authenticated
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) {
        await this.signInWithWallet(senderId);
      }

      const { data, error } = await this.supabase
        .from('messages')
        .insert([
          {
            sender_id: senderId.toLowerCase(),
            recipient_id: recipientId.toLowerCase(),
            message,
            timestamp: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error('Error storing message:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in storeMessage:', error);
      throw error;
    }
  }

  async getMessages(userId: string) {
    try {
      const lowerId = userId.toLowerCase();
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${lowerId},recipient_id.eq.${lowerId}`)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getMessages:', error);
      throw error;
    }
  }

  subscribeToMessages(userId: string, callback: (message: any) => void) {
    const lowerId = userId.toLowerCase();
    const channel = this.supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${lowerId}`,
        },
        (payload) => callback(payload.new)
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  destroy() {
    this.supabase.removeAllChannels();
  }
}
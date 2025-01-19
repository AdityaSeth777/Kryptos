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
      // Sign in with wallet address as email (since we need an email format)
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: `${walletAddress.toLowerCase()}@web3chat.com`,
        password: walletAddress, // Using wallet address as password
      });

      if (error) {
        // If user doesn't exist, sign up
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
            email: `${walletAddress.toLowerCase()}@web3chat.com`,
            password: walletAddress,
          });

          if (signUpError) throw signUpError;
          return signUpData;
        }
        throw error;
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
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId.toLowerCase()},recipient_id.eq.${userId.toLowerCase()}`)
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
    const channel = this.supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId.toLowerCase()}`,
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
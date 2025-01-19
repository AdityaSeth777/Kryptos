import { createClient } from '@supabase/supabase-js';

export class Database {
  private supabase;
  private static instance: Database | null = null;
  private static authTimeout: NodeJS.Timeout | null = null;
  private static isAuthenticating = false;

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

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async signInWithWallet(walletAddress: string, retryCount = 0): Promise<any> {
    if (Database.isAuthenticating) {
      await this.delay(1000); // Wait 1 second before retrying
      return this.signInWithWallet(walletAddress, retryCount);
    }

    try {
      Database.isAuthenticating = true;

      // Clear any existing timeout
      if (Database.authTimeout) {
        clearTimeout(Database.authTimeout);
        Database.authTimeout = null;
      }

      const email = `${walletAddress.toLowerCase()}@web3chat.com`;
      const password = `${walletAddress.toLowerCase()}_secret`;

      // Check current session
      const { data: { session } } = await this.supabase.auth.getSession();

      // If already signed in with the same wallet, return the session
      if (session?.user?.email === email) {
        return { data: session };
      }

      // Sign out if signed in with a different wallet
      if (session) {
        await this.supabase.auth.signOut();
        await this.delay(1000); // Wait for signout to complete
      }

      // Try to sign in
      const { data, error: signInError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError) {
        return { data };
      }

      // If user doesn't exist, create account
      if (signInError.status === 400) {
        const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              wallet_address: walletAddress.toLowerCase(),
            },
          },
        });

        if (signUpError) {
          if (signUpError.status === 429 && retryCount < 3) {
            // Wait and retry with exponential backoff
            const waitTime = Math.pow(2, retryCount) * 1000;
            await this.delay(waitTime);
            return this.signInWithWallet(walletAddress, retryCount + 1);
          }
          throw signUpError;
        }

        return { data: signUpData };
      }

      throw signInError;
    } catch (error: any) {
      console.error('Auth error:', error);
      throw error;
    } finally {
      // Set a timeout to reset the auth flag
      Database.authTimeout = setTimeout(() => {
        Database.isAuthenticating = false;
      }, 2000);
    }
  }

  async storeMessage(senderId: string, recipientId: string, message: string) {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
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

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in storeMessage:', error);
      throw error;
    }
  }

  async getMessages(userId: string) {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const lowerId = userId.toLowerCase();
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${lowerId},recipient_id.eq.${lowerId}`)
        .order('timestamp', { ascending: true });

      if (error) throw error;
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
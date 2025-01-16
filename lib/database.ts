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

  async storeMessage(senderId: string, recipientId: string, message: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .insert([
        {
          sender_id: senderId,
          recipient_id: recipientId,
          message: message,
          timestamp: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Error storing message:', error);
      throw error;
    }

    return data;
  }

  async getMessages(userId: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data;
  }

  subscribeToMessages(userId: string, callback: (message: any) => void) {
    // Subscribe to new messages
    const channel = this.supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => callback(payload.new)
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  destroy() {
    this.supabase.removeAllChannels();
  }
}
import { createClient } from '@supabase/supabase-js';

export class Database {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async storeMessage(senderId: string, recipientId: string, encryptedMessage: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .insert([{
        sender_id: senderId,
        recipient_id: recipientId,
        message: encryptedMessage,
        timestamp: new Date().toISOString()
      }]);

    if (error) throw error;
    return data;
  }

  subscribeToMessages(senderId: string, recipientId: string, callback: (message: any) => void) {
    // Subscribe to new messages
    const channel = this.supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${recipientId}`
        },
        (payload) => callback(payload.new)
      )
      .subscribe();

    // Fetch existing messages
    this.supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${senderId},recipient_id.eq.${recipientId}`)
      .order('timestamp', { ascending: true })
      .then(({ data }) => {
        if (data) {
          data.forEach(callback);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }

  // Clean up method
  destroy() {
    this.supabase.removeAllChannels();
  }
}
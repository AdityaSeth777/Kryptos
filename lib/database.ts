import Gun from 'gun';
import 'gun/sea';
import 'gun/axe';

export class Database {
  private gun: any;

  constructor() {
    // Initialize Gun with relay peers
    this.gun = Gun({
      peers: [
        'https://gun-manhattan.herokuapp.com/gun',
        'https://gun-us.herokuapp.com/gun',
      ],
      localStorage: false // Disable localStorage in Next.js environment
    });
  }

  async storeMessage(senderId: string, recipientId: string, encryptedMessage: string) {
    const chatId = this.getChatId(senderId, recipientId);
    const timestamp = Date.now();
    
    return new Promise((resolve, reject) => {
      try {
        this.gun.get('chats')
          .get(chatId)
          .get(timestamp.toString())
          .put({
            sender: senderId,
            recipient: recipientId,
            message: encryptedMessage,
            timestamp,
          }, (ack: any) => {
            if (ack.err) {
              reject(new Error(ack.err));
            } else {
              resolve(true);
            }
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  subscribeToMessages(senderId: string, recipientId: string, callback: (message: any) => void) {
    const chatId = this.getChatId(senderId, recipientId);
    
    this.gun.get('chats')
      .get(chatId)
      .map()
      .on((message: any, id: string) => {
        if (message && message.timestamp) {
          callback({
            id,
            ...message,
          });
        }
      });
  }

  private getChatId(senderId: string, recipientId: string): string {
    return [senderId, recipientId].sort().join('_');
  }

  // Clean up method to be called when component unmounts
  destroy() {
    if (this.gun) {
      this.gun.off();
    }
  }
}
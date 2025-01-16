import * as PushAPI from '@pushprotocol/restapi';
import { ethers } from 'ethers';

export class NotificationService {
  private signer: ethers.Signer;

  constructor(signer: ethers.Signer) {
    this.signer = signer;
  }

  async sendNotification(recipientAddress: string, message: string) {
    try {
      await PushAPI.payloads.sendNotification({
        signer: this.signer,
        type: 1,
        identityType: 2,
        notification: {
          title: 'New Message',
          body: 'You have received a new encrypted message',
        },
        payload: {
          title: 'New Message',
          body: 'You have received a new encrypted message',
          cta: '',
          img: '',
        },
        recipients: `eip155:5:${recipientAddress}`,
        channel: 'eip155:5:Your_Channel_Address',
        env: 'staging',
      });
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  }
}
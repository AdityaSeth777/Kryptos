import _sodium from 'libsodium-wrappers';

export class Encryption {
  private static sodium: typeof _sodium;
  private static initialized = false;

  private static async init() {
    if (!this.initialized) {
      await _sodium.ready;
      this.sodium = _sodium;
      this.initialized = true;
    }
  }

  static async generateKeyPair(seed: Uint8Array) {
    await this.init();
    return this.sodium.crypto_box_seed_keypair(seed);
  }

  static async encrypt(message: string, recipientPublicKey: Uint8Array, senderSecretKey: Uint8Array): Promise<string> {
    await this.init();
    const nonce = this.sodium.randombytes_buf(this.sodium.crypto_box_NONCEBYTES);
    const encryptedMessage = this.sodium.crypto_box_easy(
      this.sodium.from_string(message),
      nonce,
      recipientPublicKey,
      senderSecretKey
    );

    const fullMessage = new Uint8Array(nonce.length + encryptedMessage.length);
    fullMessage.set(nonce);
    fullMessage.set(encryptedMessage, nonce.length);

    return this.sodium.to_base64(fullMessage);
  }

  static async decrypt(encryptedMessage: string, senderPublicKey: Uint8Array, recipientSecretKey: Uint8Array): Promise<string> {
    await this.init();
    const messageWithNonce = this.sodium.from_base64(encryptedMessage);
    const nonce = messageWithNonce.slice(0, this.sodium.crypto_box_NONCEBYTES);
    const message = messageWithNonce.slice(this.sodium.crypto_box_NONCEBYTES);

    const decrypted = this.sodium.crypto_box_open_easy(
      message,
      nonce,
      senderPublicKey,
      recipientSecretKey
    );

    return this.sodium.to_string(decrypted);
  }
}
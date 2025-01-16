import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import { SigningStargateClient } from '@cosmjs/stargate';

export type WalletType = 'metamask' | 'phantom' | 'keplr';

export interface WalletConnection {
  address: string;
  type: WalletType;
  chainId?: number;
  disconnect: () => Promise<void>;
}

export async function connectMetaMask(): Promise<WalletConnection> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return {
    address,
    type: 'metamask',
    chainId: Number(await window.ethereum.request({ method: 'eth_chainId' })),
    disconnect: async () => {
      // MetaMask doesn't have a disconnect method
      return Promise.resolve();
    },
  };
}

export async function connectPhantom(): Promise<WalletConnection> {
  if (!window.solana) {
    throw new Error('Phantom wallet not installed');
  }

  try {
    const resp = await window.solana.connect();
    return {
      address: resp.publicKey.toString(),
      type: 'phantom',
      disconnect: async () => {
        await window.solana.disconnect();
      },
    };
  } catch (err) {
    throw new Error('Failed to connect to Phantom wallet');
  }
}

export async function connectKeplr(): Promise<WalletConnection> {
  if (!window.keplr) {
    throw new Error('Keplr wallet not installed');
  }

  const chainId = 'cosmoshub-4';
  await window.keplr.enable(chainId);
  const offlineSigner = window.keplr.getOfflineSigner(chainId);
  const accounts = await offlineSigner.getAccounts();

  return {
    address: accounts[0].address,
    type: 'keplr',
    disconnect: async () => {
      // Keplr doesn't have a disconnect method
      return Promise.resolve();
    },
  };
}
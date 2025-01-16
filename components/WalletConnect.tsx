'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { WalletConnection, connectMetaMask, connectPhantom, connectKeplr } from '@/lib/web3/wallets';
import { Wallet, Coins } from 'lucide-react';

export function WalletConnect() {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const { toast } = useToast();

  const connectWallet = async (type: 'metamask' | 'phantom' | 'keplr') => {
    try {
      let conn: WalletConnection;
      switch (type) {
        case 'metamask':
          conn = await connectMetaMask();
          break;
        case 'phantom':
          conn = await connectPhantom();
          break;
        case 'keplr':
          conn = await connectKeplr();
          break;
      }
      setConnection(conn);
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${conn.address.slice(0, 6)}...${conn.address.slice(-4)}`,
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive',
      });
    }
  };

  const disconnect = async () => {
    if (connection) {
      await connection.disconnect();
      setConnection(null);
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected',
      });
    }
  };

  if (connection) {
    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center">
          <Wallet className="w-5 h-5 mr-2" />
          <span className="text-sm">
            {connection.address.slice(0, 6)}...{connection.address.slice(-4)}
          </span>
        </div>
        <Button variant="destructive" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        <Button
          variant="outline"
          className="flex items-center justify-center space-x-2"
          onClick={() => connectWallet('metamask')}
        >
          <img src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" 
               alt="MetaMask" 
               className="w-5 h-5" />
          <span>MetaMask</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center justify-center space-x-2"
          onClick={() => connectWallet('phantom')}
        >
          <img src="https://raw.githubusercontent.com/phantom-labs/press-kit/main/phantom-logo-purple.svg" 
               alt="Phantom" 
               className="w-5 h-5" />
          <span>Phantom</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center justify-center space-x-2"
          onClick={() => connectWallet('keplr')}
        >
          <Coins className="w-5 h-5" />
          <span>Keplr</span>
        </Button>
      </div>
    </div>
  );
}
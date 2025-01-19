'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';

export function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts[0]) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Failed to get wallet:', error);
        }
      }
    };

    checkWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast({
        title: 'MetaMask Required',
        description: 'Please install MetaMask to use this application',
        variant: 'destructive',
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts[0]) {
        setWalletAddress(accounts[0]);
        toast({
          title: 'Connected',
          description: 'Wallet connected successfully',
        });
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet',
        variant: 'destructive',
      });
    }
  };

  const disconnect = () => {
    setWalletAddress(null);
    toast({
      title: 'Disconnected',
      description: 'Wallet disconnected',
    });
  };

  return (
    <div className="container mx-auto p-4 flex justify-end">
      {walletAddress ? (
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">
            {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
          </span>
          <Button
            variant="destructive"
            onClick={disconnect}
            className="bg-red-500/80 hover:bg-red-600/80"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Wallet className="w-5 h-5 mr-2" />
          Connect Wallet
        </Button>
      )}
    </div>
  );
}
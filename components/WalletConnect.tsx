'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast({
        title: 'Error',
        description: 'Please install MetaMask',
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
      console.error('Failed to connect wallet:', error);
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

  if (walletAddress) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center space-x-4 mb-8"
      >
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 px-4 py-2 flex items-center">
          <Wallet className="w-5 h-5 mr-2 text-primary" />
          <span className="text-sm text-primary">
            {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
          </span>
        </Card>
        <Button
          variant="destructive"
          onClick={disconnect}
          className="bg-red-500/80 hover:bg-red-600/80 backdrop-blur-sm"
        >
          Disconnect
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex justify-center mb-8">
      <Button
        variant="outline"
        className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:bg-gray-700/50"
        onClick={connectWallet}
      >
        <Wallet className="w-5 h-5 mr-2" />
        Connect Wallet
      </Button>
    </div>
  );
}
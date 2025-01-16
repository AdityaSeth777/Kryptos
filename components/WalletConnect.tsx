'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { WalletConnection, connectMetaMask, connectPhantom, connectKeplr, connectCore } from '@/lib/web3/wallets';
import { Wallet, Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function WalletConnect() {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const { toast } = useToast();

  const connectWallet = async (type: 'metamask' | 'phantom' | 'keplr' | 'core') => {
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
        case 'core':
          conn = await connectCore();
          break;
        default:
          throw new Error('Unsupported wallet type');
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

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  if (connection) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center space-x-4 mb-8"
      >
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 px-4 py-2 flex items-center">
          <Wallet className="w-5 h-5 mr-2 text-primary" />
          <span className="text-sm text-primary">
            {connection.address.slice(0, 6)}...{connection.address.slice(-4)}
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
    <div className="flex flex-col items-center space-y-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:bg-gray-700/50"
            onClick={() => connectWallet('metamask')}
          >
            <img
              src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
              alt="MetaMask"
              className="w-5 h-5"
            />
            <span>MetaMask</span>
          </Button>
        </motion.div>

        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:bg-gray-700/50"
            onClick={() => connectWallet('phantom')}
          >
            <img
              src="https://raw.githubusercontent.com/phantom-labs/press-kit/main/phantom-logo-purple.svg"
              alt="Phantom"
              className="w-5 h-5"
            />
            <span>Phantom</span>
          </Button>
        </motion.div>

        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:bg-gray-700/50"
            onClick={() => connectWallet('keplr')}
          >
            <Coins className="w-5 h-5" />
            <span>Keplr</span>
          </Button>
        </motion.div>

        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:bg-gray-700/50"
            onClick={() => connectWallet('core')}
          >
            <img
              src="https://raw.githubusercontent.com/ava-labs/avalanche-wallet/master/src/assets/core-logo.svg"
              alt="Core"
              className="w-5 h-5"
            />
            <span>Core</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
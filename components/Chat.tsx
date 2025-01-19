'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Database } from '@/lib/database';
import { Send, User, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function Chat() {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dbRef = useRef<Database | null>(null);
  const { toast } = useToast();

  // Initialize database and check wallet connection
  useEffect(() => {
    const initDatabase = async () => {
      try {
        dbRef.current = Database.getInstance();
        
        // Check if ethereum is available (client-side only)
        if (typeof window !== 'undefined' && window.ethereum?.selectedAddress) {
          const address = window.ethereum.selectedAddress;
          setWalletAddress(address);
          await dbRef.current.signInWithWallet(address);
        }
        
        setIsConnected(true);
      } catch (error) {
        console.error('Database initialization failed:', error);
        setIsConnected(false);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to the database. Please check your configuration.',
          variant: 'destructive',
        });
      }
    };

    initDatabase();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setWalletAddress(accounts[0] || null);
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [toast]);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!dbRef.current || !recipient || !walletAddress) return;

      try {
        setLoading(true);
        const data = await dbRef.current.getMessages(walletAddress);
        if (data) {
          setMessages(data.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ));
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Subscribe to new messages
    if (dbRef.current && walletAddress) {
      const unsubscribe = dbRef.current.subscribeToMessages(
        walletAddress,
        (newMessage) => {
          setMessages((prev) => [...prev, newMessage].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ));
        }
      );

      return () => {
        unsubscribe();
      };
    }
  }, [recipient, walletAddress, toast]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !recipient.trim() || !dbRef.current || !isConnected || !walletAddress) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet and enter a recipient address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await dbRef.current.storeMessage(
        walletAddress,
        recipient,
        message
      );
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="glass-card overflow-hidden max-w-4xl mx-auto">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4 bg-gray-800/30 p-3 rounded-lg">
          <User className="w-5 h-5 text-blue-400" />
          <Input
            placeholder="Enter recipient's wallet address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="bg-transparent border-none text-white placeholder-gray-400"
            disabled={loading || !walletAddress}
          />
        </div>

        <ScrollArea 
          className="h-[500px] mb-4 rounded-lg bg-gray-900/30 p-4" 
          ref={scrollRef}
        >
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={`mb-2 ${
                  msg.sender_id === walletAddress?.toLowerCase()
                    ? 'ml-auto text-right'
                    : 'mr-auto'
                }`}
              >
                <div
                  className={`inline-block rounded-lg px-4 py-2 max-w-[70%] ${
                    msg.sender_id === walletAddress?.toLowerCase()
                      ? 'bg-blue-600/80 text-white rounded-br-none'
                      : 'bg-gray-700/80 text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="break-words text-sm">{msg.message}</p>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <span className="text-xs opacity-75">
                      {formatTime(msg.timestamp)}
                    </span>
                    {msg.sender_id === walletAddress?.toLowerCase() && (
                      <span className="text-xs">
                        {msg.read ? (
                          <CheckCheck className="w-3 h-3 text-blue-300" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>

        <div className="flex items-center space-x-2 bg-gray-800/30 p-2 rounded-lg">
          <Input
            placeholder={walletAddress 
              ? "Type your message..." 
              : "Please connect your wallet first"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
            className="bg-transparent border-none text-white placeholder-gray-400"
            disabled={loading || !isConnected || !walletAddress}
          />
          <Button
            onClick={sendMessage}
            className="bg-blue-600/80 hover:bg-blue-700/80"
            disabled={loading || !isConnected || !walletAddress}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
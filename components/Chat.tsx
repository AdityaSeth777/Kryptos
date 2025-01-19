'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database } from '@/lib/database';
import { Send, User, Check, CheckCheck, Menu, Search, MoreVertical, Smile, Paperclip, Mic } from 'lucide-react';
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

  useEffect(() => {
    const initDatabase = async () => {
      try {
        if (!dbRef.current) {
          dbRef.current = Database.getInstance();
        }
        
        if (typeof window !== 'undefined' && window.ethereum?.selectedAddress) {
          const address = window.ethereum.selectedAddress;
          setWalletAddress(address);
          
          try {
            await dbRef.current.signInWithWallet(address);
            setIsConnected(true);
          } catch (error: any) {
            console.error('Auth error:', error);
            toast({
              title: 'Connection Error',
              description: error.message,
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
        setIsConnected(false);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to the database. Please try again.',
          variant: 'destructive',
        });
      }
    };

    initDatabase();

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        const newAddress = accounts[0] || null;
        setWalletAddress(newAddress);
        if (newAddress) {
          initDatabase();
        }
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [toast]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!dbRef.current || !recipient || !walletAddress || !isConnected) return;

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
          description: 'Failed to load messages. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isConnected) {
      loadMessages();

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
    }
  }, [recipient, walletAddress, isConnected, toast]);

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
    <div className="chat-container">
      <div className="sidebar">
        <div className="flex items-center justify-between p-4 bg-[#202c33]">
          <div className="flex items-center space-x-4">
            <User className="w-10 h-10 text-gray-400" />
            <div className="text-white">
              {walletAddress ? (
                <p className="text-sm">{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</p>
              ) : (
                <p className="text-sm">Connect Wallet</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
            <Menu className="w-6 h-6" />
            <MoreVertical className="w-6 h-6" />
          </div>
        </div>
        <div className="p-2">
          <div className="flex items-center bg-[#202c33] rounded-lg px-4 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <Input
              placeholder="Search or start new chat"
              className="bg-transparent border-none text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="chat-area">
        <div className="flex items-center justify-between p-4 bg-[#202c33]">
          <div className="flex items-center space-x-4">
            <User className="w-10 h-10 text-gray-400" />
            <Input
              placeholder={walletAddress ? "Enter recipient's wallet address" : "Please connect your wallet first"}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="bg-transparent border-none text-white placeholder-gray-400"
              disabled={loading || !walletAddress || !isConnected}
            />
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
            <Search className="w-6 h-6" />
            <MoreVertical className="w-6 h-6" />
          </div>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`message-bubble ${
                  msg.sender_id === walletAddress?.toLowerCase() ? 'sent' : 'received'
                }`}>
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

        <div className="message-input">
          <div className="flex items-center space-x-4">
            <Smile className="w-6 h-6 text-gray-400" />
            <Paperclip className="w-6 h-6 text-gray-400" />
            <Input
              placeholder={walletAddress && isConnected
                ? "Type a message" 
                : "Please connect your wallet first"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
              className="bg-[#2a3942] border-none text-white placeholder-gray-400 rounded-lg"
              disabled={loading || !isConnected || !walletAddress}
            />
            {message.trim() ? (
              <Button
                onClick={sendMessage}
                className="bg-[#00a884] hover:bg-[#00946f] rounded-full w-10 h-10 p-0 flex items-center justify-center"
                disabled={loading || !isConnected || !walletAddress}
              >
                <Send className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                className="bg-[#00a884] hover:bg-[#00946f] rounded-full w-10 h-10 p-0 flex items-center justify-center"
                disabled={loading || !isConnected || !walletAddress}
              >
                <Mic className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
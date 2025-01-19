'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Check, CheckCheck, Menu, Search, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Message {
  _id: string;
  senderId: string;
  recipientId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function Chat() {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            loadMessages(accounts[0]);
          }
        } catch (error) {
          console.error('Failed to get wallet address:', error);
        }
      }
    };

    checkWallet();

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        const newAddress = accounts[0] || null;
        setWalletAddress(newAddress);
        if (newAddress) {
          loadMessages(newAddress);
        }
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const loadMessages = async (address: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages?userId=${address}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !recipient.trim() || !walletAddress) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet and enter a recipient address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: walletAddress,
          recipientId: recipient,
          message: message.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('');
        loadMessages(walletAddress);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
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
          <Menu className="w-6 h-6 text-gray-400" />
        </div>
        <div className="p-2">
          <div className="flex items-center bg-[#202c33] rounded-lg px-4 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <Input
              placeholder="Search or start new chat"
              className="bg-transparent border-none text-white placeholder:text-gray-400"
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
              className="bg-transparent border-none text-white placeholder:text-gray-400"
              disabled={loading || !walletAddress}
            />
          </div>
          <MoreVertical className="w-6 h-6 text-gray-400" />
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`message-bubble ${
                  msg.senderId === walletAddress?.toLowerCase() ? 'sent' : 'received'
                }`}>
                  <p className="break-words text-sm">{msg.message}</p>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <span className="text-xs opacity-75">
                      {formatTime(msg.timestamp)}
                    </span>
                    {msg.senderId === walletAddress?.toLowerCase() && (
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
            <Input
              placeholder={walletAddress ? "Type a message" : "Please connect your wallet first"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
              className="bg-[#2a3942] border-none text-white placeholder:text-gray-400 rounded-lg"
              disabled={loading || !walletAddress}
            />
            <Button
              onClick={sendMessage}
              className="bg-[#00a884] hover:bg-[#00946f] rounded-full w-10 h-10 p-0 flex items-center justify-center"
              disabled={loading || !walletAddress || !message.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
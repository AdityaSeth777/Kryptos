'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Database } from '@/lib/database';
import { Encryption } from '@/lib/encryption';
import { Send, User } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  recipient: string;
  message: string;
  timestamp: number;
}

export function Chat() {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dbRef = useRef<Database | null>(null);

  useEffect(() => {
    // Initialize database
    dbRef.current = new Database();

    // Cleanup on unmount
    return () => {
      if (dbRef.current) {
        dbRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !recipient.trim() || !dbRef.current) return;

    try {
      const timestamp = Date.now();
      const newMessage = {
        id: timestamp.toString(),
        sender: 'YOUR_ADDRESS', // Replace with actual sender address
        recipient,
        message,
        timestamp,
      };

      await dbRef.current.storeMessage(newMessage.sender, newMessage.recipient, newMessage.message);
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-800 border-gray-700">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Enter recipient's wallet address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <ScrollArea className="h-[400px] mb-4 rounded-lg bg-gray-900 p-4" ref={scrollRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 ${
                  msg.sender === 'YOUR_ADDRESS'
                    ? 'ml-auto text-right'
                    : 'mr-auto'
                }`}
              >
                <div
                  className={`inline-block rounded-lg px-4 py-2 max-w-[70%] ${
                    msg.sender === 'YOUR_ADDRESS'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <p className="break-words">{msg.message}</p>
                  <span className="text-xs opacity-75">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </ScrollArea>

          <div className="flex items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
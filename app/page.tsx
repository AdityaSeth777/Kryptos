import { WalletConnect } from '@/components/WalletConnect';
import { Chat } from '@/components/Chat';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Decentralized Encrypted Chat</h1>
          <p className="text-gray-400">Secure, private messaging using blockchain wallets</p>
        </header>
        
        <main>
          <WalletConnect />
          <Chat />
        </main>
      </div>
    </div>
  );
}
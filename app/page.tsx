import { WalletConnect } from '@/components/WalletConnect';
import { Chat } from '@/components/Chat';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a1014]">
      <header className="bg-[#111b21] border-b border-[#2a373f] p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-semibold text-white">Web3 Chat</h1>
        </div>
      </header>
      
      <main>
        <WalletConnect />
        <Chat />
      </main>
    </div>
  );
}
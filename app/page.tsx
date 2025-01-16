import { WalletConnect } from '@/components/WalletConnect';
import { Chat } from '@/components/Chat';

export default function Home() {
  return (
    <>
      <div className="mesh-gradient" />
      <div className="min-h-screen relative">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600">
              Decentralized Encrypted Chat
            </h1>
            <p className="text-xl text-gray-400">
              Secure, private messaging using blockchain wallets
            </p>
          </header>
          
          <main>
            <WalletConnect />
            <Chat />
          </main>
        </div>
      </div>
    </>
  );
}
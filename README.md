# Web3 Encrypted Chat Application

A decentralized, encrypted chat application built with Next.js, Supabase, and Web3 wallet integration.

## Features

- 🔒 End-to-end encryption using libsodium
- 👛 Multi-wallet support (MetaMask, Phantom, Keplr)
- 💬 Real-time messaging using Supabase
- 🎨 Beautiful UI with Tailwind CSS and shadcn/ui
- 📱 Responsive design
- 🌐 Secure data storage with Row Level Security

## Prerequisites

Before you begin, ensure you have installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- One or more of the following wallets:
  - [MetaMask](https://metamask.io/) for Ethereum
  - [Phantom](https://phantom.app/) for Solana
  - [Keplr](https://www.keplr.app/) for Cosmos

## Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd web3-chat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new project at [Supabase](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env.local` file based on `.env.example`
   - Add your Supabase credentials to `.env.local`

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

1. Create a production build:
   ```bash
   npm run build
   ```

2. Test the production build locally:
   ```bash
   npm start
   ```

## Deployment Options

### 1. Deploy to Netlify

The easiest way to deploy this application is through Netlify:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Sign up for a [Netlify account](https://www.netlify.com/)
3. Click "New site from Git"
4. Choose your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
6. Environment variables:
   - Add your Supabase credentials as environment variables
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
7. Click "Deploy site"

### 2. Deploy to Vercel

1. Push your code to a Git repository
2. Sign up for a [Vercel account](https://vercel.com/)
3. Import your repository
4. Environment variables:
   - Add your Supabase credentials in the Vercel dashboard
5. Click "Deploy"

### 3. Self-hosting

To self-host on your own server:

1. Build the application:
   ```bash
   npm run build
   ```

2. The static files will be in the `out` directory

3. Deploy these files to your web server (Apache, Nginx, etc.)

4. Set up environment variables on your server

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Troubleshooting

### Common Issues

1. **Wallet Connection Issues**
   - Ensure your wallet extension is installed and unlocked
   - Check if you're on the correct network

2. **Message Not Sending**
   - Verify your internet connection
   - Check if Supabase is properly configured
   - Make sure both sender and recipient addresses are correct

3. **Build Errors**
   - Clear the `.next` directory: `rm -rf .next`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Database Issues

If you experience issues with Supabase:

1. Verify your environment variables are correctly set
2. Check the Supabase dashboard for any service disruptions
3. Ensure your database tables and policies are properly set up

## Security Considerations

1. All messages are end-to-end encrypted using libsodium
2. Wallet connections are secure and don't expose private keys
3. Row Level Security ensures users can only access their own messages
4. Messages are stored securely in Supabase with proper access controls

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# Web3 Chat Application

A decentralized chat application built with Next.js, MongoDB, and MetaMask wallet integration.

## Features

- Secure wallet-based authentication with MetaMask
- Real-time messaging
- Message persistence with MongoDB
- Beautiful UI with Tailwind CSS
- Responsive design
- Message read receipts

## Prerequisites

Before you begin, ensure you have:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MetaMask](https://metamask.io/) browser extension
- MongoDB database (we use MongoDB Atlas)

## Setup Instructions

1. Clone and install dependencies:
   ```bash
   git clone <repository-url>
   cd web3-chat
   npm install
   ```

2. Set up MongoDB Atlas:
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Create a new project
   - Build a new cluster (free tier is fine)
   - Click "Connect" on your cluster
   - Add your IP address to the IP Access List
   - Create a database user with read/write permissions
   - Choose "Connect your application"
   - Copy the connection string

3. Configure Environment:
   - Copy `.env.example` to `.env.local`
   - Replace the MongoDB URI with your connection string
   - Update the database name in the URI if different from 'web3chat'

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## MongoDB Setup Details

1. Create Database User:
   - In MongoDB Atlas, go to Database Access
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password
   - Select "Read and write to any database"
   - Add user

2. Network Access:
   - Go to Network Access
   - Click "Add IP Address"
   - Add your current IP or use "Allow Access from Anywhere" (0.0.0.0/0)

3. Get Connection String:
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Add database name: `web3chat` after the cluster address

Example URI format:
```
mongodb+srv://username:password@cluster.mongodb.net/web3chat?retryWrites=true&w=majority
```

## Troubleshooting

1. **Connection Errors**
   - Verify MongoDB URI in `.env.local`
   - Check if IP is whitelisted in MongoDB Atlas
   - Ensure database user credentials are correct
   - Verify the database name in the URI

2. **Message Send/Receive Issues**
   - Check browser console for errors
   - Verify MetaMask is connected
   - Ensure recipient address is correct
   - Check MongoDB Atlas logs for any issues

3. **MetaMask Issues**
   - Make sure MetaMask is installed and unlocked
   - Connect to the correct network
   - Check if the account has sufficient funds for gas

## Development

### API Routes

- `GET /api/messages?userId=<address>`
  - Fetches messages for a wallet address
  - Returns both sent and received messages

- `POST /api/messages`
  - Sends a new message
  - Required body: `{ senderId, recipientId, message }`

### Database Schema

Messages collection:
```typescript
interface Message {
  _id: string;
  senderId: string;
  recipientId: string;
  message: string;
  timestamp: Date;
  read: boolean;
}
```

## License

MIT License
import { NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const { senderId, recipientId, message } = await request.json();
    const db = client.db('web3chat');

    const result = await db.collection('messages').insertOne({
      senderId: senderId.toLowerCase(),
      recipientId: recipientId.toLowerCase(),
      message,
      timestamp: new Date(),
      read: false
    });

    return NextResponse.json({ success: true, messageId: result.insertedId });
  } catch (error) {
    console.error('MongoDB error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId')?.toLowerCase();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    const db = client.db('web3chat');
    const messages = await db.collection('messages')
      .find({
        $or: [
          { senderId: userId },
          { recipientId: userId }
        ]
      })
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('MongoDB error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' }, 
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { getConversation } from '../../../lib/elevenlabs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversation_id');
  if (!conversationId || conversationId.trim() === '') {
    return NextResponse.json(
      { error: 'Missing or empty conversation_id' },
      { status: 400 },
    );
  }
  try {
    const details = await getConversation(conversationId.trim());
    return NextResponse.json(details);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

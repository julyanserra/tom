import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify webhook
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }
  
  console.error('Webhook verification failed');
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received webhook:', JSON.stringify(body, null, 2));
    
    // Extract message data
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || !messages.length) {
      return new NextResponse('No messages found', { status: 200 });
    }

    const message = messages[0];
    
    // Only process image messages
    if (message.type !== 'image') {
      console.log('Received non-image message type:', message.type);
      return new NextResponse('Not an image message', { status: 200 });
    }

    console.log('Processing image message:', message.id);
    const imageId = message.image.id;
    
    // Get media URL
    const mediaResponse = await fetch(`https://graph.facebook.com/v17.0/${imageId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
      }
    });
    
    if (!mediaResponse.ok) {
      const error = await mediaResponse.text();
      console.error('Failed to get media URL:', error);
      return new NextResponse('Failed to get media URL', { status: 500 });
    }
    
    const mediaData = await mediaResponse.json();
    
    // Download image
    const imageResponse = await fetch(mediaData.url, {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
      }
    });
    
    if (!imageResponse.ok) {
      console.error('Failed to download image:', await imageResponse.text());
      return new NextResponse('Failed to download image', { status: 500 });
    }
    
    const imageBlob = await imageResponse.blob();
    const base64Image = Buffer.from(await imageBlob.arrayBuffer()).toString('base64');

    // Store in Supabase
    const { data, error } = await supabase
      .from('images')
      .insert([
        {
          image_data: base64Image,
          message_id: message.id,
          timestamp: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error('Error storing image in Supabase:', error);
      return new NextResponse('Error storing image', { status: 500 });
    }

    console.log('Successfully processed and stored image:', message.id);
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
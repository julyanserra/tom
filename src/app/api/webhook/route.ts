import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function uploadImageToSupabase(imageBlob: Blob, prefix: string = '', messageId?: string) {
    // Generate filename with optional prefix
    const fileName = `${prefix}${messageId || Date.now()}-${Date.now()}.jpg`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('whatsapp-images')
        .upload(fileName, imageBlob, {
            contentType: 'image/jpeg',
            upsert: false
        });

    if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase
        .storage
        .from('whatsapp-images')
        .getPublicUrl(fileName);

    return {
        fileName,
        publicUrl,
        uploadData
    };
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    
    // Add test endpoint handling
    const isTest = searchParams.get('test');
    const mediaId = searchParams.get('mediaId');
    
    if (isTest && mediaId) {
        try {
            console.log('Testing webhook with media ID:', mediaId);
            const mediaResponse = await downloadMedia(mediaId);
            
            if (!mediaResponse.ok) {
                throw new Error(`Media response not OK: ${mediaResponse.status}`);
            }

            const imageBlob = await mediaResponse.blob();
            console.log('Successfully downloaded test image:', {
                size: imageBlob.size,
                type: imageBlob.type
            });

            // Upload using the new function
            const { fileName, publicUrl } = await uploadImageToSupabase(imageBlob, 'test-');

            return new NextResponse(JSON.stringify({
                success: true,
                message: 'Test successful',
                details: {
                    downloadSize: imageBlob.size,
                    downloadType: imageBlob.type,
                    uploadedFile: fileName,
                    publicUrl
                }
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error: any) {
            console.error('Test endpoint error:', error);
            return new NextResponse(JSON.stringify({
                success: false,
                error: error.message
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    }
    
    // Original webhook verification code
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

async function downloadMedia(mediaId: string) {
    const token = process.env.WHATSAPP_TOKEN;

    if (!token) {
        throw new Error('WHATSAPP_TOKEN is not configured');
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    };

    // First request to get media URL
    const mediaUrlResponse = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
        headers
    });

    if (!mediaUrlResponse.ok) {
        const errorData = await mediaUrlResponse.text();
        console.error('Media URL Response:', {
            status: mediaUrlResponse.status,
            statusText: mediaUrlResponse.statusText,
            error: errorData,
            mediaId
        });
        throw new Error(`Failed to fetch media URL: ${errorData}`);
    }

    const data = await mediaUrlResponse.json();
    console.log('Media URL Response data:', data);

    if (!data.url) {
        throw new Error('No URL found in media response');
    }

    // Second request to download the actual media
    console.log('Downloading media from URL:', data.url);
    console.log('Request headers:', headers);
    const mediaResponse = await fetch(data.url, {
        headers
    });

    if (!mediaResponse.ok) {
        const errorText = await mediaResponse.text();
        console.error('Media download failed:', {
            status: mediaResponse.status,
            statusText: mediaResponse.statusText,
            url: mediaResponse.url,
            dataUrl: data.url,
            response: errorText
        });
        throw new Error(`Failed to download media: ${mediaResponse.statusText} ${mediaResponse.status} ${mediaResponse.url} ${data.url}`);
    }

    return mediaResponse;
}

export async function POST(req: Request) {
    try {
        console.log('WHATSAPP_TOKEN length:', process.env.WHATSAPP_TOKEN?.length);
        console.log('WHATSAPP_TOKEN first 10 chars:', process.env.WHATSAPP_TOKEN?.substring(0, 10));

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

        // Get media URL using WhatsApp Cloud API
        console.log('Fetching media URL for image:', imageId);
        const mediaResponse = await downloadMedia(imageId);

        if (!mediaResponse.ok) {
            const errorText = await mediaResponse.text();
            console.error('Failed to get media URL:', {
                status: mediaResponse.status,
                statusText: mediaResponse.statusText,
                error: errorText,
                imageId
            });
            return new NextResponse(
                JSON.stringify({ error: 'Failed to get media URL', details: errorText }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const imageBlob = await mediaResponse.blob();
        console.log('Successfully downloaded image:', {
            size: imageBlob.size,
            type: imageBlob.type
        });

        // Upload using the new function
        const { fileName, publicUrl } = await uploadImageToSupabase(imageBlob, '', message.id);

        // Store metadata in database
        const { data, error } = await supabase
            .from('images')
            .insert([
                {
                    message_id: message.id,
                    storage_path: fileName,
                    public_url: publicUrl,
                    timestamp: new Date().toISOString(),
                }
            ]);

        if (error) {
            console.error('Error storing image metadata:', error);
            return new NextResponse('Error storing image metadata', { status: 500 });
        }

        console.log('Successfully processed and stored image:', message.id);
        return new NextResponse('OK', { status: 200 });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 
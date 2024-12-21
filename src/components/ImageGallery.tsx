'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ImageViewer } from '@/components/ImageViewer';

interface Image {
  id: number;
  image_data: string;
  timestamp: string;
  message_id: string;
  public_url: string;
}

export function ImageGallery() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .order('timestamp', { ascending: false });

        if (error) {
          console.error('Error fetching images:', error);
          return;
        }

        setImages(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('images_channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'images' },
        (payload) => {
          console.log('Received real-time update:', payload);
          setImages((current) => [payload.new as Image, ...current]);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time changes');
        }
        if (status === 'CLOSED') {
          console.log('Subscription closed');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to real-time changes');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <Card 
            key={image.id} 
            className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => setSelectedImageIndex(index)}
          >
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <img
                  src={image.public_url}
                  alt={`WhatsApp image ${image.id}`}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.error('Image failed to load:', image.id);
                  }}
                />
              </div>
            </CardContent>
            <CardFooter className="p-4">
              <time className="text-sm text-muted-foreground">
                {new Date(image.timestamp).toLocaleString()}
              </time>
            </CardFooter>
          </Card>
        ))}
        {images.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No images received yet. Send an image via WhatsApp to see it here!
          </div>
        )}
      </div>

      {selectedImageIndex !== null && (
        <ImageViewer
          images={images}
          currentImageIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
          onNavigate={setSelectedImageIndex}
        />
      )}
    </>
  );
} 
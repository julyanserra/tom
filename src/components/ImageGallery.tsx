'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { ImageViewer } from './ImageViewer';

type MediaItem = {
  id: number;
  public_url: string;
  media_type: 'image' | 'video';
  timestamp: string;
  message_id: string;
};

export function ImageGallery() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchMedia();

    // Set up real-time subscription
    const channel = supabase
      .channel('media_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'media',
        },
        (payload) => {
          setMediaItems((current) => [payload.new as MediaItem, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaItems.map((item, index) => (
          <div 
            key={item.id} 
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedIndex(index)}
          >
            {item.media_type === 'video' ? (
              <video
                src={item.public_url}
                className="object-cover w-full h-full"
                preload="metadata"
              />
            ) : (
              <img
                src={item.public_url}
                alt={`Uploaded at ${item.timestamp}`}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
        
        {mediaItems.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No images or videos received yet. Send media via WhatsApp to see it here!
          </div>
        )}
      </div>

      {selectedIndex !== null && (
        <ImageViewer
          items={mediaItems}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
        />
      )}
    </>
  );
} 
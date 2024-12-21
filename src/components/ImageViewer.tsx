'use client';

import { ChevronLeft, ChevronRight, X, Download, Play, Pause } from "lucide-react";
import { useEffect, useRef, TouchEvent, useState } from "react";

interface MediaItem {
  id: number;
  public_url: string;
  media_type: 'image' | 'video';
}

interface ImageViewerProps {
  items: MediaItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImageViewer({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: ImageViewerProps) {
  const currentItem = items[currentIndex];
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isButtonInteraction = useRef(false);
  
  const handleTouchStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      isButtonInteraction.current = true;
      return;
    }
    
    isButtonInteraction.current = false;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isButtonInteraction.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (isButtonInteraction.current) {
      isButtonInteraction.current = false;
      return;
    }

    const difference = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(difference) > minSwipeDistance) {
      if (difference > 0) {
        // Swiped left
        handleNext();
      } else {
        // Swiped right
        handlePrevious();
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const newScale = scale + (e.deltaY > 0 ? -0.1 : 0.1);
      setScale(Math.min(Math.max(0.5, newScale), 3));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
      document.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, scale]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        if (currentIndex < items.length - 1) {
          onNavigate(currentIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentIndex, items.length]);

  const handleDownload = async () => {
    try {
      // First try the native browser download
      const link = document.createElement('a');
      link.href = currentItem.public_url;
      link.download = `media-${currentItem.id}${currentItem.media_type === 'video' ? '.mp4' : '.jpg'}`;
      
      // For iOS Safari and some mobile browsers
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Fetch the image/video first
        const response = await fetch(currentItem.public_url);
        const blob = await response.blob();
        
        // Try to use the native sharing if available
        if (navigator.share) {
          await navigator.share({
            files: [
              new File(
                [blob], 
                `media-${currentItem.id}${currentItem.media_type === 'video' ? '.mp4' : '.jpg'}`,
                { type: blob.type }
              )
            ]
          });
          return;
        }
        
        // Fallback: Open in new tab
        window.open(currentItem.public_url, '_blank');
      } else {
        // Desktop browsers
        link.click();
      }
    } catch (error) {
      console.error('Error downloading media:', error);
      // Fallback: Open in new tab
      window.open(currentItem.public_url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div 
        className="relative flex items-center justify-center w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close button */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <Download className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>
        </div>

        {/* Navigation buttons */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center px-2 sm:px-4">
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-full transition-colors bg-black/20 backdrop-blur-sm"
            >
              <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10" />
            </button>
          )}
          
          {currentIndex < items.length - 1 && (
            <button
              onClick={handleNext}
              className="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-full transition-colors ml-auto bg-black/20 backdrop-blur-sm"
            >
              <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10" />
            </button>
          )}
        </div>

        {/* Media content */}
        <div className="w-full h-full flex items-center justify-center p-4">
          {currentItem.media_type === 'video' ? (
            <video
              src={currentItem.public_url}
              controls
              className="max-h-full max-w-full"
              autoPlay
            />
          ) : (
            <img
              src={currentItem.public_url}
              alt={`Media item ${currentItem.id}`}
              className="max-h-full max-w-full object-contain select-none transition-transform"
              style={{ transform: `scale(${scale})` }}
              onDoubleClick={() => setScale(scale === 1 ? 2 : 1)}
            />
          )}
        </div>

        {/* Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white bg-black/50 p-1.5 sm:p-2 rounded-full hover:bg-black/70"
          >
            {isPlaying ? 
              <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : 
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
            }
          </button>
          <div className="text-white bg-black/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base">
            {currentIndex + 1} / {items.length}
          </div>
        </div>
      </div>
    </div>
  );
} 
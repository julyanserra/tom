'use client';

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, TouchEvent } from "react";

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
  
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [currentIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div 
        className="relative flex items-center justify-center w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="h-8 w-8" />
        </button>

        {/* Navigation buttons */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center px-4">
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}
          
          {currentIndex < items.length - 1 && (
            <button
              onClick={handleNext}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors ml-auto"
            >
              <ChevronRight className="h-10 w-10" />
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
              className="max-h-full max-w-full object-contain select-none"
            />
          )}
        </div>

        {/* Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
          {currentIndex + 1} / {items.length}
        </div>
      </div>
    </div>
  );
} 
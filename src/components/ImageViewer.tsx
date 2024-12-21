'use client';

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

interface Image {
  id: number;
  image_data: string;
  timestamp: string;
  message_id: string;
  public_url: string;
}

interface ImageViewerProps {
  images: Image[];
  currentImageIndex: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export function ImageViewer({
  images,
  currentImageIndex,
  onClose,
  onNavigate,
}: ImageViewerProps) {
  const currentImage = images[currentImageIndex];
  
  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      onNavigate(currentImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      onNavigate(currentImageIndex + 1);
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
  }, [currentImageIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="h-8 w-8" />
        </button>

        {/* Navigation buttons */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center px-4">
          {currentImageIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}
          
          {currentImageIndex < images.length - 1 && (
            <button
              onClick={handleNext}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors ml-auto"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          )}
        </div>

        {/* Image */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <img
            src={currentImage.public_url}
            alt={`WhatsApp image ${currentImage.id}`}
            className="max-h-full max-w-full object-contain select-none"
          />
        </div>

        {/* Image counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
} 
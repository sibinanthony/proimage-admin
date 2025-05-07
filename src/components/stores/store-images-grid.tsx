"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface GeneratedImage {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  prompt?: string;
  width?: number;
  height?: number;
  createdAt: string;
  productId: string;
  products: {
    title: string;
    handle?: string;
  };
}

interface StoreImagesGridProps {
  images: GeneratedImage[];
  isLoading?: boolean;
}

export function StoreImagesGrid({ images, isLoading = false }: StoreImagesGridProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="aspect-square bg-muted/40 rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }
  
  if (images.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No images found for this store.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card 
            key={image.id} 
            className="cursor-pointer overflow-hidden hover:shadow-md transition-shadow"
            onClick={() => setSelectedImage(image)}
          >
            <CardContent className="p-2">
              <div className="aspect-square relative">
                <Image 
                  src={image.thumbnailUrl || image.imageUrl} 
                  alt={`Generated image for ${image.products.title}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover rounded-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.products.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedImage && (
              <>
                <div className="aspect-square md:aspect-video relative w-full max-h-[70vh]">
                  <Image
                    src={selectedImage.imageUrl}
                    alt={`Generated image for ${selectedImage.products.title}`}
                    fill
                    className="object-contain"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{formatDate(selectedImage.createdAt, 'PPpp')}</p>
                  </div>
                  
                  {selectedImage.width && selectedImage.height && (
                    <div>
                      <p className="text-muted-foreground">Dimensions</p>
                      <p>{selectedImage.width} × {selectedImage.height}</p>
                    </div>
                  )}
                  
                  {selectedImage.prompt && (
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground">Prompt</p>
                      <p className="font-mono text-xs bg-muted p-2 rounded-sm">{selectedImage.prompt}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
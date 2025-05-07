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
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

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
  jobs: {
    storeId: string;
    stores: {
      name: string;
      domain: string;
    };
  };
}

interface AllImagesGridProps {
  images: GeneratedImage[];
  totalImages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function AllImagesGrid({ 
  images, 
  totalImages,
  currentPage,
  pageSize,
  onPageChange,
  isLoading = false
}: AllImagesGridProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  
  const totalPages = Math.ceil(totalImages / pageSize);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 20 }).map((_, index) => (
          <div key={index} className="aspect-square bg-muted/40 rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }
  
  if (images.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No images found.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
              <div className="mt-2 text-xs truncate text-muted-foreground">
                {image.jobs.stores.name}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalImages)} of {totalImages} images
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
          >
            <ChevronRightIcon className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>
      
      {/* Image Detail Dialog */}
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
                    <p className="text-muted-foreground">Store</p>
                    <p>{selectedImage.jobs.stores.name}</p>
                  </div>
                  
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
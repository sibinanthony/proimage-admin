"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon, Cross2Icon, ArrowLeftIcon, ZoomInIcon, ZoomOutIcon } from '@radix-ui/react-icons';

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
    originalImageUrl?: string;
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
  const [enlargedView, setEnlargedView] = useState<{image: string, title: string} | null>(null);
  const [viewType, setViewType] = useState<'original' | 'generated' | null>(null);
  
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

  // Handler for enlarging an image
  const handleEnlargeImage = (imageUrl: string, title: string, type: 'original' | 'generated') => {
    setEnlargedView({ image: imageUrl, title });
    setViewType(type);
  };
  
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
      <Dialog open={!!selectedImage && !enlargedView} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-4xl overflow-y-auto max-h-[90vh] md:max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{selectedImage?.products.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pb-2">
            {selectedImage && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedImage.products.originalImageUrl && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Original Image</p>
                      <div 
                        className="aspect-square md:aspect-video relative w-full max-h-[40vh] group cursor-pointer"
                        onClick={() => handleEnlargeImage(selectedImage.products.originalImageUrl!, selectedImage.products.title, 'original')}
                      >
                        <Image
                          src={selectedImage.products.originalImageUrl}
                          alt={`Original image for ${selectedImage.products.title}`}
                          fill
                          className="object-contain"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomInIcon className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Generated Image</p>
                    <div 
                      className="aspect-square md:aspect-video relative w-full max-h-[40vh] group cursor-pointer"
                      onClick={() => handleEnlargeImage(selectedImage.imageUrl, selectedImage.products.title, 'generated')}
                    >
                      <Image
                        src={selectedImage.imageUrl}
                        alt={`Generated image for ${selectedImage.products.title}`}
                        fill
                        className="object-contain"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomInIcon className="h-8 w-8 text-white drop-shadow-md" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Store</p>
                    <div className="flex items-center gap-1">
                      <p>{selectedImage.jobs.stores.name}</p>
                      <a 
                        href={`https://${selectedImage.jobs.stores.domain}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                      >
                        <svg 
                          className="h-3 w-3 ml-1" 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
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
      
      {/* Enlarged Image View Dialog */}
      <Dialog open={!!enlargedView} onOpenChange={(open) => !open && setEnlargedView(null)}>
        <DialogContent className="sm:max-w-5xl md:max-w-6xl max-h-screen overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {enlargedView?.title} {viewType && `(${viewType === 'original' ? 'Original' : 'Generated'})`}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-screen flex flex-col">
            {/* Top bar with title */}
            <div className="bg-background px-4 py-3 flex items-center justify-center border-b">
              <p className="text-sm font-medium truncate max-w-[80%] text-center">
                {enlargedView?.title} {viewType && `(${viewType === 'original' ? 'Original' : 'Generated'})`}
              </p>
            </div>
            
            {/* Image container */}
            <div className="flex-1 flex items-center justify-center bg-black/5 p-4 overflow-auto">
              <div className="relative max-w-full max-h-full">
                {enlargedView && (
                  <img
                    src={enlargedView.image}
                    alt={enlargedView.title}
                    className="max-w-full max-h-[calc(100vh-100px)] object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AllImagesGrid } from '@/components/images/all-images-grid';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ImageIcon } from '@radix-ui/react-icons';

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

interface ImagesResponse {
  images: GeneratedImage[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

export default function ImagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [totalImages, setTotalImages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the page from query params or default to 1
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(page);
  }, [searchParams]);
  
  // Fetch images when page changes
  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true);
        const response = await fetch(`/api/images?page=${currentPage}&pageSize=${pageSize}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        
        const data: ImagesResponse = await response.json();
        setImages(data.images);
        setTotalImages(data.pagination.total);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError(`${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [currentPage, pageSize]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    router.push(`/images?page=${page}`);
  };
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <h2 className="text-lg font-bold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Images</h1>
      <p className="text-muted-foreground">
        View all generated images across all stores.
      </p>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Generated Images
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {totalImages} total images
          </div>
        </CardHeader>
        <CardContent>
          <AllImagesGrid 
            images={images}
            totalImages={totalImages}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
} 
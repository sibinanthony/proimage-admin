"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StoreImagesGrid } from '@/components/stores/store-images-grid';
import { ArrowLeftIcon, ImageIcon } from '@radix-ui/react-icons';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

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

export default function StoreImagesPage() {
  const { id } = useParams<{ id: string }>();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    async function fetchStoreImages() {
      try {
        setLoading(true);
        const response = await fetch(`/api/stores/${id}/images`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch store images');
        }
        
        const data = await response.json();
        setImages(data.images);
        setStoreName(data.storeName);
      } catch (err) {
        console.error('Error fetching store images:', err);
        setError(`${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchStoreImages();
    }
  }, [id]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Link
            href={`/stores/${id}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-muted hover:bg-muted/80 h-8 px-3 py-2"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Store
          </Link>
        </div>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <h2 className="text-lg font-bold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link
          href={`/stores/${id}`}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-muted hover:bg-muted/80 h-8 px-3 py-2"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Store
        </Link>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {storeName ? `${storeName} - Generated Images` : 'Generated Images'}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </div>
        </CardHeader>
        <CardContent>
          <StoreImagesGrid images={images} isLoading={loading} />
        </CardContent>
      </Card>
    </div>
  );
} 
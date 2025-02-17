import { DocumentDetails } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import * as pdfjsLib from "pdfjs-dist";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';

// Configure worker with correct URL
if (typeof window !== 'undefined') {
  console.log('PDF.js version:', pdfjsLib.version)
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs'
}

interface DocumentViewerProps {
  document: DocumentDetails;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClientComponentClient();
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      if (authLoading) return; // Wait for auth to initialize

      console.log('DocumentViewer: Loading document with state:', {
        user: user ? 'authenticated' : 'not authenticated',
        documentUrl: document.file_url,
        documentId: document.id,
        authLoading
      });

      if (!document.file_url || !user) {
        console.log('DocumentViewer: Error condition triggered:', {
          hasFileUrl: !!document.file_url,
          hasUser: !!user,
          authLoading
        });
        setError('No file URL provided or user not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const storagePath = `${user.id}/${document.id}/${document.file_name}`;
        
        const { data, error: downloadError } = await supabase
          .storage
          .from('documents')
          .download(storagePath);

        if (downloadError) throw downloadError;

        const blob = data;
        console.log('Document blob loaded:', blob.type);

        if (document.file_name.toLowerCase().endsWith(".pdf")) {
          const arrayBuffer = await blob.arrayBuffer();
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          console.log('PDF loaded, pages:', pdf.numPages);
          
          const loadedPages = await Promise.all(
            Array.from({ length: pdf.numPages }, async (_, i) => {
              const page = await pdf.getPage(i + 1);
              const viewport = page.getViewport({ scale: 1.5 });
              const canvas = window.document.createElement('canvas');
              const context = canvas.getContext('2d');

              canvas.height = viewport.height;
              canvas.width = viewport.width;

              await page.render({
                canvasContext: context!,
                viewport,
              }).promise;

              return canvas.toDataURL();
            })
          );

          setPages(loadedPages);
        } else {
          setPages([document.content || '']);
        }
      } catch (error) {
        console.error('Error loading document:', error);
        setError(error instanceof Error ? error.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [document, supabase, user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        Initializing...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        Error: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading document...
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-4">
        {pages.map((page, index) => (
          <Card key={index} className="p-4 bg-gray-800">
            {document.file_name.toLowerCase().endsWith(".pdf") ? (
              <Image
                src={page}
                alt={`Page ${index + 1}`}
                width={800}
                height={1200}
                className="w-full h-auto"
                unoptimized
              />
            ) : (
              <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                {page}
              </div>
            )}
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

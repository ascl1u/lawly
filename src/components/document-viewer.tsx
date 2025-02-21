'use client'

import { DocumentDetails } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import * as pdfjsLib from "pdfjs-dist";
import { useAuth } from '@/hooks/useAuth';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  // PaginationLink,
  // PaginationNext,
  // PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button";

// Configure worker with correct URL
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs'
}

interface DocumentViewerProps {
  document: DocumentDetails;
}

export function DocumentViewer({ document: doc }: DocumentViewerProps) {
  const { user, loading: authLoading, supabase } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageContent, setPageContent] = useState<string | null>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);

  // Load PDF document
  useEffect(() => {
    const loadDocument = async () => {
      if (authLoading || !doc.file_url || !user) return;

      try {
        setLoading(true);
        const storagePath = `${user.id}/${doc.id}/${doc.file_name}`;
        const { data, error: downloadError } = await supabase
          .storage
          .from('documents')
          .download(storagePath);

        if (downloadError) throw downloadError;

        const isPdfFile = doc.file_name.toLowerCase().endsWith(".pdf");
        setIsPdf(isPdfFile);

        if (isPdfFile) {
          const arrayBuffer = await data.arrayBuffer();
          const loadedPdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          setPdf(loadedPdf);
          setTotalPages(loadedPdf.numPages);
          console.log(`PDF loaded successfully. Total pages: ${loadedPdf.numPages}`);
        } else {
          setPageContent(doc.content || '');
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error loading document:', error);
        setError(error instanceof Error ? error.message : 'Failed to load document');
        setTotalPages(0);
        setPdf(null);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [doc, supabase, user, authLoading]);

  // Load specific page
  useEffect(() => {
    const loadPage = async () => {
      if (!pdf || !doc.file_name.toLowerCase().endsWith(".pdf")) return;

      try {
        setLoading(true);
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = window.document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context!,
          viewport,
        }).promise;

        setPageContent(canvas.toDataURL());
      } catch (error) {
        console.error('Error loading page:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [pdf, currentPage, doc.file_name]);

  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  if (error) return <div className="flex items-center justify-center h-full">Error: {error}</div>;
  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-6 pb-0">
          <Card className="overflow-hidden bg-primary border-primary/20">
            <CardContent className="p-4">
              {isPdf ? (
                pageContent && (
                  <Image
                    src={pageContent}
                    alt={`Page ${currentPage}`}
                    width={800}
                    height={1200}
                    className="w-full h-auto"
                    unoptimized
                  />
                )
              ) : (
                <div className="prose prose-primary max-w-none whitespace-pre-wrap">
                  {pageContent}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {isPdf && totalPages > 0 && (
          <div className="px-6 py-4 flex justify-center">
            <Pagination>
              <PaginationContent className="bg-primary rounded-lg p-1">
                <PaginationItem>
                  <Button 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground hover:bg-primary-foreground/10 disabled:text-primary-foreground/50"
                  >
                    Previous
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 text-primary-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <Button 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground hover:bg-primary-foreground/10 disabled:text-primary-foreground/50"
                  >
                    Next
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

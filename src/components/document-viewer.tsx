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
import { AlertCircle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [fileType, setFileType] = useState<string>('');

  // Load PDF document
  useEffect(() => {
    const loadDocument = async () => {
      if (authLoading || !doc.file_url || !user) return;

      try {
        setLoading(true);
        
        // Get file extension
        const fileExtension = doc.file_name.split('.').pop()?.toLowerCase() || '';
        setFileType(fileExtension);
        
        // Use the encoded_file_name if available, otherwise fall back to file_name
        const fileName = doc.encoded_file_name || doc.file_name;
        const storagePath = `${user.id}/${doc.id}/${fileName}`;
        
        console.log('Attempting to download file from path:', storagePath);
        
        const { data, error: downloadError } = await supabase
          .storage
          .from('documents')
          .download(storagePath);

        if (downloadError) throw downloadError;

        const isPdfFile = fileExtension === 'pdf';
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
      if (!pdf || !isPdf) return;

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
  }, [pdf, currentPage, isPdf]);

  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // Get a user-friendly file type name
  const getFileTypeName = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'pdf': return 'PDF';
      case 'docx': return 'Word Document';
      case 'doc': return 'Word Document';
      case 'txt': return 'Text File';
      case 'rtf': return 'Rich Text Format';
      default: return type.toUpperCase();
    }
  };

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
                <div className="prose prose-primary max-w-none">
                  {/* Display notification for non-PDF files */}
                  <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Document Preview Not Available</AlertTitle>
                    <AlertDescription>
                      Direct preview is not available for {getFileTypeName(fileType)} files. 
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">{doc.file_name}</span>
                  </div>
                  
                  <div className="whitespace-pre-wrap">
                    {pageContent || 'No content available'}
                  </div>
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

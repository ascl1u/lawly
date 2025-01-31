export interface Document {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileUrl: string | null;
  parsedText: string | null;
  uploadedAt: Date;
  status: 'pending' | 'parsing' | 'analyzed' | 'error';
  parsedAt: Date | null;
}

export interface DocumentSection {
  id: string;
  documentId: string;
  content: string;
  title?: string;
  orderIndex: number;
  createdAt: Date;
  metadata: {
    pageNumber?: number;
    sectionType?: 'header' | 'body' | 'footer';
    confidence?: number;
    [key: string]: unknown;
  };
}

export interface Analysis {
  id: string;
  documentId: string;
  summary: string;
  risks: Risk[];
  createdAt: Date;
}

export interface Risk {
  id: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
} 
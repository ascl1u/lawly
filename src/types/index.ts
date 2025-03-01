export interface DocumentDetails {
  id: string;
  file_name: string;
  encoded_file_name: string | null;
  error_message: string | null;
  file_type: string;
  file_url: string | null;
  content: string | null;
  uploaded_at: string;
  status: 'pending' | 'parsing' | 'analyzed' | 'error';
  parsed_at: string | null;
  summary?: {
    summary_text: string | null;
  };
  risks?: Array<{
    risk_severity: string | null;
    risk_description: string | null;
    suggested_action: string | null;
  }>;
  messages?: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    created_at: string;
  }>;
}

export interface Document {
  id: string;
  userId: string;
  fileName: string;
  encodedFileName: string | null;
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
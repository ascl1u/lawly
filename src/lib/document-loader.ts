import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
// import { TextLoader } from 'langchain/document_loaders/fs/text'
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { Document as LangChainDocument } from "langchain/document";

interface Section {
  content: string
  metadata: {
    pageNumber?: number
    type?: string
    title?: string
  }
}

export class DocumentLoader {
  static async load(file: Blob): Promise<{ text: string; sections: Section[] }> {
    switch (file.type) {
      case 'application/pdf':
        return await this.loadPDF(file)
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await this.loadDOCX(file)
      case 'text/plain':
        return await this.loadText(file)
      default:
        throw new Error(`Unsupported file type: ${file.type}`)
    }
  }

  static async loadPDF(file: Blob): Promise<{
    text: string;
    sections: Array<{
      content: string;
      metadata: Record<string, unknown>;
    }>;
  }> {
    try {
      const loader = new PDFLoader(file);
      const docs = await loader.load();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splitDocs = await splitter.splitDocuments(docs);
      
      return {
        text: docs.map(doc => doc.pageContent).join('\n\n'),
        sections: splitDocs.map(doc => ({
          content: doc.pageContent,
          metadata: doc.metadata
        }))
      };
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('Failed to process PDF document');
    }
  }

  static async loadDOCX(file: Blob): Promise<{
    text: string;
    sections: Array<{
      content: string;
      metadata: Record<string, unknown>;
    }>;
  }> {
    try {
      const loader = new DocxLoader(file);
      const docs = await loader.load();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splitDocs = await splitter.splitDocuments(docs);
      
      return {
        text: docs.map(doc => doc.pageContent).join('\n\n'),
        sections: splitDocs.map(doc => ({
          content: doc.pageContent,
          metadata: doc.metadata
        }))
      };
    } catch (error) {
      console.error('Error loading DOCX:', error);
      throw new Error('Failed to process DOCX document');
    }
  }

  static async loadText(file: Blob): Promise<{
    text: string;
    sections: Array<{
      content: string;
      metadata: Record<string, unknown>;
    }>;
  }> {
    try {
      const text = await file.text();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splitDocs = await splitter.createDocuments([text]);
      
      return {
        text,
        sections: splitDocs.map(doc => ({
          content: doc.pageContent,
          metadata: doc.metadata
        }))
      };
    } catch (error) {
      console.error('Error loading text:', error);
      throw new Error('Failed to process text document');
    }
  }
}
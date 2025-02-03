export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_type: string
          file_url: string | null
          parsed_text: string | null
          uploaded_at: string
          status: 'pending' | 'parsing' | 'analyzed' | 'error'
          parsed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_type: string
          file_url?: string | null
          parsed_text?: string | null
          uploaded_at?: string
          status?: 'pending' | 'parsing' | 'analyzed' | 'error'
          parsed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_type?: string
          file_url?: string | null
          parsed_text?: string | null
          uploaded_at?: string
          status?: 'pending' | 'parsing' | 'analyzed' | 'error'
          parsed_at?: string | null
        }
      }
      summaries: {
        Row: {
          id: string
          document_id: string
          summary_text: string | null
          simplified_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          summary_text?: string | null
          simplified_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          summary_text?: string | null
          simplified_text?: string | null
          created_at?: string
        }
      }
      risk_analyses: {
        Row: {
          id: string
          document_id: string
          risk_description: string | null
          risk_severity: string | null
          suggested_action: string | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          risk_description?: string | null
          risk_severity?: string | null
          suggested_action?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          risk_description?: string | null
          risk_severity?: string | null
          suggested_action?: string | null
          created_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          document_id: string
          content: string
          title: string | null
          order_index: number
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          document_id: string
          content: string
          title?: string | null
          order_index: number
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          document_id?: string
          content?: string
          title?: string | null
          order_index?: number
          created_at?: string
          metadata?: Json
        }
      }
      messages: {
        Row: {
          id: string
          document_id: string
          user_id: string
          content: string
          role: 'user' | 'assistant'
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          content: string
          role: 'user' | 'assistant'
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          document_id?: string
          user_id?: string
          content?: string
          role?: 'user' | 'assistant'
          created_at?: string
          metadata?: Json
        }
      }
    }
  }
} 
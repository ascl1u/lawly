export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SubscriptionTier = 'free' | 'pro' | 'pay_as_you_go'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          analysis_usage: number
          analysis_limit: number
          reset_cycle: string | null
          tier: 'free' | 'pro' | 'pay_as_you_go'
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          analysis_usage?: number
          analysis_limit?: number
          reset_cycle?: string | null
          tier?: 'free' | 'pro' | 'pay_as_you_go'
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          analysis_usage?: number
          analysis_limit?: number
          reset_cycle?: string | null
          tier?: 'free' | 'pro' | 'pay_as_you_go'
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_checkout_session_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          price_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_checkout_session_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          price_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_checkout_session_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          price_id?: string | null
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          file_name: string
          encoded_file_name?: string | null
          file_type: string
          file_url: string | null
          parsed_text: string | null
          uploaded_at?: string
          status: 'pending' | 'parsing' | 'analyzed' | 'error'
          parsed_at: string | null
          content: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          encoded_file_name?: string | null
          file_type: string
          file_url?: string | null
          parsed_text?: string | null
          uploaded_at?: string
          status?: 'pending' | 'parsing' | 'analyzed' | 'error'
          parsed_at?: string | null
          content?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          encoded_file_name?: string | null
          file_type?: string
          file_url?: string | null
          parsed_text?: string | null
          uploaded_at?: string
          status?: 'pending' | 'parsing' | 'analyzed' | 'error'
          parsed_at?: string | null
          content?: string | null
          error_message?: string | null
        }
      }
      summaries: {
        Row: {
          id: string
          document_id: string
          summary_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          summary_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          summary_text?: string | null
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
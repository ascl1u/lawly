import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}
/**
 * Utility functions for handling file paths and names
 */

/**
 * Encodes a filename to be safe for storage paths
 */
export function encodeFileName(fileName: string): string {
  return encodeURIComponent(fileName)
}

/**
 * Decodes an encoded filename back to its original form
 */
export function decodeFileName(encodedFileName: string): string {
  return decodeURIComponent(encodedFileName)
}

/**
 * Generates a storage path for a document
 */
export function getDocumentStoragePath(userId: string, documentId: string, fileName: string, isEncoded = false): string {
  const safeFileName = isEncoded ? fileName : encodeFileName(fileName)
  return `${userId}/${documentId}/${safeFileName}`
}